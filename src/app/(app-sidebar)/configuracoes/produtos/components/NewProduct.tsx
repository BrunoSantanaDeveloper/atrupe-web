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
    unitOfMeasureId: '',
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
  const { getProductsType, getProductionStagesType } = usePlanFeatures()

  const [insertAnother, setInsertAnother] = useState(!editMode)

  const canAddComposition = getProductsType() === 'full'
  const canShowProductionStages = getProductionStagesType() === 'full'

  const { data: product, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product', productId],
    queryFn: () => handleGetProduct(productId ?? ''),
    enabled: !!productId,
  })

  const form = useForm<NewProductsFormType>({
    resolver: zodResolver(newProductsSchema),
    mode: 'onChange',
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
      ...data,
      items: data.items?.map((item) => ({
        ...item,
        id: editMode ? item.id : undefined,
        name: item?.name,
        unitOfMeasureId: item.unitOfMeasureId,
        salePrice: item.salePrice,
        unitCost: item.salePrice,
      })),
      technicalDescription: data?.technicalDescription ?? '',
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

        await queryClient.invalidateQueries()
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
      await queryClient.invalidateQueries()

      if (!insertAnother) {
        handleCleanForm()
        handleToggleModal()
      } else {
        handleCleanForm()
      }
    } catch (error) {
      toast.error(
        `Erro ao ${editMode ? 'editar' : 'cadastrar'} produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }
  function handleAppendProductItems() {
    items.append({
      name: '',
      unitOfMeasureId: '',
      unitCost: 0,
      salePrice: 0,
    })
  }

  function handleRemoveCompositionProducts(index: number) {
    items.remove(index)
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
        {open && (
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
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Form {...form}>
                <form
                  id="new-product"
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-wrap gap-5"
                  noValidate
                >
                  <SelectSectorField<NewProductsFormType>
                    name="sectorId"
                    label="Setor"
                    width="flex-[1_0_190px]"
                  />
                  <SelectProductGroupWithSectorField<NewProductsFormType>
                    name="categoryId"
                    label="Grupo de produtos"
                    width="flex-[1_0_190px]"
                    selectedSectorId={watch('sectorId')}
                  />

                  <FormInput<NewProductsFormType>
                    name="name"
                    label="Nome do produto"
                    width="flex-[1_0_400px]"
                    additionalOnChange={(value) => {
                      if (items?.fields?.length === 1) {
                        form.setValue('items.0.name', String(value))
                      }
                    }}
                  />
                  <FormInput<NewProductsFormType>
                    name="code"
                    label="Código"
                    width="flex-[1_0_250px]"
                    additionalOnChange={(value) => {
                      form.setValue('code', String(value).toUpperCase())
                    }}
                  />
                  {items?.fields?.length === 1 && (
                    <>
                      <UnitOfMeasureField<NewProductsFormType>
                        name="items.0.unitOfMeasureId"
                        label="Unidade comercial"
                        width="flex-[1_0_225px]"
                      />
                      <MeasurementInput<NewProductsFormType>
                        control={control}
                        index={0}
                        unitOfMeasureId={watch('items.0.unitOfMeasureId')}
                      />
                      <FormBrlInput<NewProductsFormType>
                        name={`items.0.salePrice`}
                        label="Preço de venda"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_200px] max-w-[290px]"
                      />
                    </>
                  )}
                  {items?.fields?.length > 1 &&
                    items?.fields?.map((item, index) => (
                      <div
                        className="flex flex-wrap gap-5 bg-white p-6 rounded-xl relative justify-start w-full"
                        key={item.id}
                      >
                        {index > 0 && (
                          <Button
                            type="button"
                            size="iconSm"
                            variant="neutralGhost"
                            className="absolute top-1 right-1"
                            onClick={() =>
                              handleRemoveCompositionProducts(index)
                            }
                          >
                            <LucideIcon icon="Trash2" className="size-5" />
                          </Button>
                        )}
                        <FormInput<NewProductsFormType>
                          name={`items.${index}.name`}
                          label="Nome da composição"
                          width="flex-[1_0_100%]"
                        />
                        <UnitOfMeasureField<NewProductsFormType>
                          name={`items.${index}.unitOfMeasureId`}
                          label="Unidade comercial"
                          width="flex-[1_0_200px]"
                        />
                        <MeasurementInput<NewProductsFormType>
                          control={control}
                          index={index}
                          unitOfMeasureId={watch(
                            `items.${index}.unitOfMeasureId`,
                          )}
                        />
                        <FormBrlInput<NewProductsFormType>
                          name={`items.${index}.salePrice`}
                          label="Preço de venda"
                          startAdornment={<>R$</>}
                          width="flex-[1_0_200px] max-w-[290px]"
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
                  <FormImageUpload<NewProductsFormType>
                    control={control}
                    name="imageUrl"
                  />
                  <FormTextarea<NewProductsFormType>
                    name="technicalDescription"
                    label="Descritivo técnico"
                    placeholder="Digite aqui."
                  />
                  <div className="flex gap-6">
                    <FormSwitch<NewProductsFormType>
                      name="allowEditValues"
                      label="Permitir editar valor"
                    />
                    <FormSwitch<NewProductsFormType>
                      name="allowEditDescription"
                      label="Permitir editar descrição"
                    />
                  </div>
                  {canShowProductionStages && <ProductionStages />}
                </form>
              </Form>
            </div>
            <DialogFooter className="sm:justify-between">
              <div className="flex items-center space-x-2">
                {!editMode ? (
                  <CheckboxBasic
                    name="inserir-outro"
                    label="Inserir outro depois deste"
                    checked={editMode ? false : insertAnother}
                    onCheckedChange={(value) => setInsertAnother(value)}
                  />
                ) : null}
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
        )}
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
