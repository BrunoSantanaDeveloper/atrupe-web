'use client'

// React
import React, { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { LucideIcon } from '@/components/LucideIcon'
import { ProductionStages } from './ProductionStages'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'
import { FormImageUpload } from '@/components/common/form/ImageUpload'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'
import { UnitOfMeasureField } from '@/components/common/form/global-inputs/UnitOfMeasureField'
import { MeasurementInput } from '@/components/common/form/global-inputs/products/MeasurementInput'
import { UnitCostInput } from '@/components/common/form/global-inputs/products/UnitCostInput'
import { SelectProductGroupWithSectorField } from '@/components/common/form/global-inputs/ProductGroupWithSectorSelectField'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  defaultNewProductValues,
  NewProductsFormType,
  newProductsSchema,
} from './schema'

// Icons
import {
  IconPackage,
  IconCirclePlus,
  IconCircleCheck,
  IconPencil,
} from '@tabler/icons-react'

// Action
import { createItemNew, getItemOld, updateItemNew } from '@/actions/_cruds'

// Hooks
import { useSector } from '@/hooks/queries/useSector'
import { useAlertDialog } from '@/store/useAlertDialog'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
}

const defaultItemFields = [
  {
    name: '',
    unitKind: '',
    unitCost: 0,
    salePrice: 0,
  },
]

async function handleGetProduct(productId: string) {
  if (!productId) return
  const product = await getItemOld({
    route: 'productRoute',
    id: productId ?? '',
  })
  return product
}

function NewProductModal({ editMode, productId, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const { canManageProducts, canManageProductionStages } = usePlanFeatures()
  const { data: sectors } = useSector({ isProductionStage: true })

  const [insertAnother, setInsertAnother] = useState(!editMode)

  const alertDialog = useAlertDialog()

  const canAddComposition = canManageProducts()
  const canShowProductionStages = canManageProductionStages()

  const { data: product, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product', productId],
    queryFn: () => handleGetProduct(productId ?? ''),
    enabled: !!productId,
  })

  const isActive = product?.isActive ?? true

  // Filtrar etapas de produção para manter apenas as dos setores ativos, preservando isActive
  const getFilteredProductionStages = () => {
    if (!editMode || !product?.productionStages || !sectors) return []

    const activeSectors = sectors.filter((sector) => sector.isActive)

    // Filtrar apenas etapas que correspondem aos setores ativos e enriquecer com dados atuais do setor
    return product.productionStages
      .filter((stage: { id: string; isActive: boolean }) => {
        const sector = activeSectors.find((s) => s.id === stage.id)
        return !!sector
      })
      .map((stage: { id: string; isActive: boolean }) => {
        const sector = activeSectors.find((s) => s.id === stage.id)
        return {
          id: stage.id,
          name: sector?.name || '',
          icon: sector?.icon || '',
          isActive: stage.isActive, // Preservar o isActive original
        }
      })
  }

  const form = useForm<NewProductsFormType>({
    resolver: zodResolver(newProductsSchema),
    // mode: 'onChange',
    values: !editMode
      ? defaultNewProductValues
      : {
          ...product,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: product?.items?.map((item: any) => ({
            ...item,
            unitCost: item.unitCost,
            salePrice: item.salePrice,
          })),
          productionStages: getFilteredProductionStages(),
        },
  })

  const items = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const { handleSubmit, control, reset, watch } = form

  useEffect(() => {
    if (editMode) return
    form.setValue('categoryId', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('sectorId')])

  if (editMode && isLoading) return <></>

  function handleToggleModal() {
    handleCleanForm()
    onOpenChange(false)
  }

  function handleCleanForm() {
    reset(defaultNewProductValues)
    items.replace(defaultItemFields)
  }

  const onSubmit = async (data: NewProductsFormType) => {
    const body = {
      name: data.name,
      code: data.code,
      categoryId: data.categoryId,
      sectorId: data.sectorId,
      technicalDescription: data?.technicalDescription ?? '',
      allowEditValues: data.allowEditValues,
      allowEditDescription: data.allowEditDescription,
      imageUrl: data.imageUrl,
      items: data.items?.map((item) => ({
        id: editMode ? item.id : undefined,
        name: item.name,
        unitKind: item.unitKind,
        unitCost: item.unitCost,
        salePrice: item.salePrice,
        // ✅ Valores brutos das dimensões (enviados conforme preenchidos pelo usuário)
        width: item.unitKind === 'AREA' ? item.width || null : null, // mm
        height: item.unitKind === 'AREA' ? item.height || null : null, // mm
        length: item.unitKind === 'LENGTH' ? item.length || null : null, // mm
        weight: item.unitKind === 'WEIGHT' ? item.weight || null : null, // mg
        volume: item.unitKind === 'CAPACITY' ? item.volume || null : null, // ml
        distance: item.unitKind === 'DISTANCE' ? item.distance || null : null, // metros
        duration: item.unitKind === 'DURATION' ? item.duration || null : null, // segundos
      })),
      productionStages: data?.productionStages?.map((stage) => ({
        id: stage?.id,
        isActive: stage?.isActive,
      })),
    }

    try {
      if (editMode) {
        const result = await updateItemNew({
          route: `/product/${productId}`,
          data: body,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Produto atualizado com sucesso!')
      } else {
        const result = await createItemNew({
          route: '/product',
          data: body,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Produto criado com sucesso!')
      }

      if (!insertAnother) {
        handleCleanForm()
        handleToggleModal()
      } else {
        handleCleanForm()
      }

      await queryClient.invalidateQueries()
    } catch (error) {
      toast.error(
        `Erro ao ${editMode ? 'editar' : 'cadastrar'} produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }
  function handleAppendProductItems() {
    items.append({
      name: '',
      unitKind: '',
      unitCost: 0,
      salePrice: 0,
    })
  }

  function handleRemoveCompositionProducts(index: number) {
    items.remove(index)
  }

  const handleToggleStatus = async () => {
    if (!productId) return

    const confirmed = await alertDialog.open({
      title: `Deseja ${isActive ? 'inativar' : 'ativar'} este produto?`,
      description: isActive
        ? 'O produto ficará indisponível para novos orçamentos e vendas.'
        : 'O produto ficará disponível novamente para orçamentos e vendas.',
      confirmLabel: isActive ? 'Inativar' : 'Ativar',
      confirmVariant: isActive ? 'error' : 'default',
      onConfirm: async () => {
        const result = await createItemNew({
          route: `/product/${productId}/toggle-status`,
          data: {
            isActive: !isActive,
          },
        })

        if (!result.success) {
          throw new Error(result.message)
        }
      },
      toastMsg: {
        loading: 'Aguarde...',
        success: `Produto ${isActive ? 'inativado' : 'ativado'} com sucesso!`,
        error: `Erro ao ${isActive ? 'inativar' : 'ativar'} produto`,
      },
    })

    if (confirmed) {
      await queryClient.invalidateQueries()
    }
  }

  return (
    <PermissionGate
      permissions={[
        'product_settings:materials_products:view',
        editMode
          ? 'product_settings:materials_products:edit'
          : 'product_settings:materials_products:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent className="sm:max-w-[855px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
                <span>{editMode ? 'Editar' : 'Novo'} produto</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="new-product"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-4"
                noValidate
              >
                <SelectSectorField
                  name="sectorId"
                  label="Setor"
                  width="flex-[1_0_190px]"
                />
                <SelectProductGroupWithSectorField
                  name="categoryId"
                  label="Grupo de produtos"
                  width="flex-[1_0_190px]"
                  selectedSectorId={watch('sectorId')}
                />

                <FormInput
                  name="name"
                  label="Nome do produto"
                  width="flex-[1_0_400px]"
                  additionalOnChange={(value) => {
                    if (items?.fields?.length === 1) {
                      form.setValue('items.0.name', String(value))
                    }
                  }}
                />
                <FormInput
                  name="code"
                  label="Código"
                  width="flex-[1_0_250px]"
                  additionalOnChange={(value) => {
                    form.setValue('code', String(value).toUpperCase())
                  }}
                />
                {items?.fields?.length === 1 && (
                  <>
                    <UnitOfMeasureField
                      name="items.0.unitKind"
                      width="flex-[1_0_225px]"
                    />
                    <MeasurementInput
                      control={control}
                      index={0}
                      unitKind={watch('items.0.unitKind')}
                    />
                    <div className="flex flex-wrap gap-4">
                      <UnitCostInput
                        name="items.0.unitCost"
                        width="flex-[1_0_140px]"
                        index={0}
                      />
                      <FormBrlInput
                        name={`items.0.salePrice`}
                        label="Valor de venda"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_140px]"
                        disabled
                      />
                    </div>
                  </>
                )}
                {items?.fields?.length > 1 &&
                  items?.fields?.map((item, index) => (
                    <div
                      className="flex flex-wrap gap-4 bg-white p-6 rounded-xl relative justify-start w-full"
                      key={`${item.id}-${index}`}
                    >
                      {index > 0 && (
                        <Button
                          type="button"
                          size="iconSm"
                          variant="neutralGhost"
                          className="absolute top-1 right-1"
                          onClick={() => handleRemoveCompositionProducts(index)}
                        >
                          <LucideIcon icon="Trash2" className="size-5" />
                        </Button>
                      )}
                      <FormInput
                        name={`items.${index}.name`}
                        label="Nome da composição"
                        width="flex-[1_0_100%]"
                      />
                      <UnitOfMeasureField
                        name={`items.${index}.unitKind`}
                        width="flex-[1_0_200px]"
                      />
                      <MeasurementInput
                        control={control}
                        index={index}
                        unitKind={watch(`items.${index}.unitKind`)}
                      />
                      <UnitCostInput
                        name={`items.${index}.unitCost`}
                        width="flex-[1_0_140px]"
                        index={index}
                      />
                      <FormBrlInput
                        name={`items.${index}.salePrice`}
                        label="Valor de venda"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_140px]"
                        disabled
                      />
                    </div>
                  ))}
                {canAddComposition && (
                  <div className="w-full">
                    <Button
                      type="button"
                      variant="none"
                      className="flex justify-center items-center mx-auto gap-3 py-8"
                      onClick={handleAppendProductItems}
                    >
                      <FeaturedIcon
                        variant="light"
                        Icon={IconCirclePlus}
                        rounded
                      />
                      <p className="text-sm text-gray-600 font-medium">
                        Adicionar composição
                      </p>
                    </Button>
                  </div>
                )}
                <FormImageUpload
                  control={control}
                  name="imageUrl"
                  maxSize={1024 * 200}
                  customHelpText="PNG ou JPG até 200kb e 300x300px"
                />
                <FormTextarea
                  name="technicalDescription"
                  label="Descritivo técnico"
                  placeholder="Digite aqui."
                />
                <div className="flex gap-6">
                  <FormSwitch
                    name="allowEditValues"
                    label="Permitir editar valor"
                  />
                  <FormSwitch
                    name="allowEditDescription"
                    label="Permitir editar descrição"
                  />
                </div>
                {canShowProductionStages && <ProductionStages />}
              </form>
            </Form>
          </DialogBody>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center space-x-2">
              {!editMode ? (
                <CheckboxBasic
                  name="inserir-outro"
                  label="Inserir outro depois deste"
                  checked={editMode ? false : insertAnother}
                  onCheckedChange={(value) => setInsertAnother(value)}
                />
              ) : (
                <Button
                  type="button"
                  variant={isActive ? 'error' : 'default'}
                  onClick={handleToggleStatus}
                >
                  {isActive ? 'Inativar' : 'Ativar'}
                </Button>
              )}
            </div>
            <div className="space-x-4">
              <Button
                type="button"
                variant="neutralOutline"
                onClick={handleToggleModal}
              >
                Cancelar
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => {
                    form.trigger()
                    console.info('form', form.getValues())
                    console.info('errors', form.formState.errors)
                  }}
                >
                  Trigger
                </Button>
              )}
              <Button
                type="submit"
                form="new-product"
                RightIcon={IconCircleCheck}
                onClick={handleSubmit(onSubmit)}
                disabled={form.formState?.isSubmitting}
                isLoading={form.formState?.isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}

export const NewProduct = React.memo(NewProductModal)

export function NewProductTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      variant={editMode ? 'neutralGhost' : 'default'}
      size={editMode ? 'icon' : 'default'}
      RightIcon={editMode ? IconPencil : IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo produto'}
    </Button>
  )
}
