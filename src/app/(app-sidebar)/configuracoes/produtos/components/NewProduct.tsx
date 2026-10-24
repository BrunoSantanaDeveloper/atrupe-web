'use client'

// React
import React, { useEffect, useState } from 'react'

// UI
import {
  AllowEditValueHint,
  AllowEditDescriptionHint,
} from '@/components/common/RiskHint'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

// Components
import { ProductionStages } from './ProductionStages'
import { ProductVariations } from './ProductVariations'
import { AssemblyEditor } from '../[id]/composicao/components/AssemblyEditor'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'
import { FormImageUploadBigSmall } from '@/components/common/form/global-inputs/FormImageUploadBigSmall'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { SelectSectorField } from '@/components/common/form/global-inputs/SectorSelectField'
import { UnitOfMeasureField } from '@/components/common/form/global-inputs/UnitOfMeasureField'
import { MeasurementInput } from '@/components/common/form/global-inputs/products/MeasurementInput'
import { UnitCostInput } from '@/components/common/form/global-inputs/products/UnitCostInput'
import { SelectProductGroupWithSectorField } from '@/components/common/form/global-inputs/ProductGroupWithSectorSelectField'
import { ProductFiscalTab } from './ProductFiscalData/ProductFiscalTab'
import { InactivateProductDialog } from './InactivateProductDialog'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import {
  defaultNewProductValues,
  NewProductsFormType,
  newProductsSchema,
} from './schema'
import {
  productFiscalDataSchema,
  type ProductFiscalDataFormType,
  defaultFiscalDataValues,
} from './ProductFiscalData/schema'

// Icons
import {
  IconPackage,
  IconPlus,
  IconCircleCheck,
  IconPencil,
  IconReceiptTax,
  IconHierarchy2,
  IconTrash,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Action
import {
  createItemNew,
  getItemOld,
  updateItemNew,
  getData,
} from '@/actions/_cruds'

// Hooks
import { useSector } from '@/hooks/queries/useSector'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type ProductTab = 'general' | 'composition' | 'fiscal'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
  // Aba em que o diálogo abre: depois de criar o produto no PRO ele reabre
  // direto na composição (CP-16: o produto nasce e então ganha composição)
  initialTab?: ProductTab
  // Valores já preenchidos ao criar (o nome e o descritivo de um item da
  // biblioteca de produtos, 03/10/2026)
  initialValues?: Partial<NewProductsFormType>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess?: (product: any) => void
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

async function fetchFiscalData(productId: string) {
  try {
    const response = await getData({ route: `/fiscal/product/${productId}` })
    if (response.success && response.data) return response.data
    return null
  } catch {
    return null
  }
}

function NewProductModal({
  editMode,
  productId,
  open,
  onOpenChange,
  initialTab = 'general',
  initialValues,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient()
  const {
    canManageProducts,
    canManageProductionStages,
    hasFiscalModule,
    hasFeature,
  } = usePlanFeatures()
  const { data: sectors } = useSector({ isProductionStage: true })

  const [insertAnother, setInsertAnother] = useState(false)
  const [activeTab, setActiveTab] = useState<ProductTab>(initialTab)
  // Inativar com "onde é usado" (PAD-7, 05/10/2026): o diálogo lista os
  // produtos em que este é parte e os orçamentos abertos que o têm
  const [inactivateOpen, setInactivateOpen] = useState(false)

  const canAddComposition = canManageProducts()
  const canShowProductionStages = canManageProductionStages()
  const showFiscalTab = hasFiscalModule()
  // A composição é recurso do cadastro do produto, não tela à parte (CP-17):
  // do PRO em diante o diálogo ganha a aba, e o fluxo de etapas (FL-1) toma o
  // lugar da lista simples de etapas do LITE (ET-1). A composição lê a
  // API (contrato, módulo 1, parte A)
  const showCompositionTab = hasFeature(FEATURES.COSTS.COST_BASE)
  // As variações simples ficam aqui; com a composição (PRO), elas vivem
  // na aba Composição, como abas com composição própria
  const showVariations = !showCompositionTab

  useEffect(() => {
    if (open) setActiveTab(initialTab)
  }, [open, initialTab])

  const { data: product, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product', productId],
    queryFn: () => handleGetProduct(productId ?? ''),
    enabled: !!productId,
  })

  // Fiscal data form — independent form instance
  const fiscalForm = useForm<ProductFiscalDataFormType>({
    resolver: zodResolver(productFiscalDataSchema),
    defaultValues: defaultFiscalDataValues,
  })

  const { data: existingFiscalData } = useQuery({
    queryKey: ['product-fiscal-data', productId],
    queryFn: () => fetchFiscalData(productId ?? ''),
    enabled: !!productId && open && showFiscalTab,
  })

  // Load fiscal data into fiscal form
  useEffect(() => {
    if (existingFiscalData) {
      fiscalForm.reset({
        productCode: existingFiscalData.productCode || '',
        commercialUnit: existingFiscalData.commercialUnit || 'UN',
        ncm: existingFiscalData.ncm || '',
        cean: existingFiscalData.cean || '',
        icmsOrigin: existingFiscalData.icmsOrigin || '0',
        icmsCst: existingFiscalData.icmsCst || '102',
        icmsRate: existingFiscalData.icmsRate || undefined,
        icmsCreditRate: existingFiscalData.icmsCreditRate || undefined,
        icmsBaseModality: existingFiscalData.icmsBaseModality || '3',
        icmsStMva: existingFiscalData.icmsStMva ?? undefined,
        icmsStReducao: existingFiscalData.icmsStReducao ?? undefined,
        icmsStRate: existingFiscalData.icmsStRate ?? undefined,
        fcpRate: existingFiscalData.fcpRate ?? undefined,
        fcpStRate: existingFiscalData.fcpStRate ?? undefined,
        pisCst: existingFiscalData.pisCst || '07',
        pisRate: existingFiscalData.pisRate || undefined,
        cofinsCst: existingFiscalData.cofinsCst || '07',
        cofinsRate: existingFiscalData.cofinsRate || undefined,
        ipiFramework: existingFiscalData.ipiFramework || '0',
        ipiCst: existingFiscalData.ipiCst || '',
        ipiRate: existingFiscalData.ipiRate || undefined,
        cfopInState: existingFiscalData.cfopInState || '5102',
        cfopOutState: existingFiscalData.cfopOutState || '6102',
        cfopExport: existingFiscalData.cfopExport || '7102',
      })
    } else if (!productId) {
      fiscalForm.reset(defaultFiscalDataValues)
    }
  }, [existingFiscalData, productId, fiscalForm])

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
      ? { ...defaultNewProductValues, ...initialValues }
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
    setActiveTab('general')
    onOpenChange(false)
  }

  function handleCleanForm() {
    reset(defaultNewProductValues)
    items.replace(defaultItemFields)
    fiscalForm.reset(defaultFiscalDataValues)
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
      imageUrl: data.imageUrl || null,
      imageSize: data.imageSize || null,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let createdProduct: any = null

      if (editMode) {
        const result = await updateItemNew({
          route: `/product/${productId}`,
          data: body,
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        toast.success('Produto atualizado')
      } else {
        const result = await createItemNew({
          route: '/product',
          data: body,
        })

        if (!result.success) {
          throw new Error(result.message)
        }
        createdProduct = result.data

        toast.success('Produto criado')
      }

      // Save fiscal data if fiscal tab is shown and productId is available
      const savedId = editMode ? productId : createdProduct?.id
      if (showFiscalTab && savedId) {
        const fiscalData = fiscalForm.getValues()
        try {
          // createItemNew sinaliza falha pelo retorno, não por exceção — sem
          // este check um erro no upsert passaria como "salvo com sucesso"
          const fiscalResult = await createItemNew({
            route: '/fiscal/product/upsert',
            data: { ...fiscalData, productId: savedId },
          })

          if (!fiscalResult.success) {
            throw new Error(fiscalResult.message)
          }

          await queryClient.invalidateQueries({
            queryKey: ['product-fiscal-data', savedId],
          })
        } catch (error) {
          // Non-fatal: product was saved, just fiscal data failed
          toast.warning(
            `Produto salvo, mas erro ao salvar dados fiscais${
              error instanceof Error && error.message
                ? `: ${error.message}`
                : '.'
            }`,
          )
        }
      }

      if (!insertAnother) {
        if (onSuccess && createdProduct) {
          onSuccess(createdProduct)
        }
        handleCleanForm()
        handleToggleModal()
      } else {
        onSuccess?.(createdProduct)
        reset()
      }

      await queryClient.invalidateQueries()
    } catch (error) {
      toast.error(
        `Erro ao ${editMode ? 'editar' : 'cadastrar'} produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    }
  }

  // O Tabs desmonta a aba inativa, então o <form id="new-product"> não existe no
  // DOM enquanto "Dados fiscais" está aberta e um submit nativo não encontraria
  // o formulário. Disparar o handleSubmit direto salva a partir de qualquer aba.
  const handleSave = handleSubmit(onSubmit, () => {
    // Os campos inválidos estão na aba Produto — traz o usuário até eles
    setActiveTab('general')
    toast.error('Verifique os campos obrigatórios do produto.')
  })

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

  return (
    <PermissionGate
      permissions={[
        'product_settings:products:view',
        editMode
          ? 'product_settings:products:edit'
          : 'product_settings:products:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleToggleModal}>
        <DialogContent
          className={cn(
            activeTab === 'composition'
              ? 'sm:max-w-[1180px]'
              : 'sm:max-w-[855px]',
          )}
        >
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <span>{editMode ? 'Editar produto' : 'Novo produto'}</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as ProductTab)}
              className="flex flex-col h-full"
            >
              <div className="px-6 pt-4 border-b border-gray-100">
                <TabsList>
                  <TabsTrigger value="general">
                    <IconPackage
                      aria-hidden
                      size={ICON_SIZE.sm}
                      className="mr-1.5"
                    />
                    Produto
                  </TabsTrigger>
                  {showCompositionTab && (
                    <TabsTrigger value="composition">
                      <IconHierarchy2
                        aria-hidden
                        size={ICON_SIZE.sm}
                        className="mr-1.5"
                      />
                      Composição
                    </TabsTrigger>
                  )}
                  {showFiscalTab && (
                    <TabsTrigger value="fiscal">
                      <IconReceiptTax
                        aria-hidden
                        size={ICON_SIZE.sm}
                        className="mr-1.5"
                      />
                      Dados Fiscais
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
                <TabsContent value="general" className="mt-0 p-6">
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
                          {/* Primeira linha: Seletor de unidade comercial e valor unitário */}
                          <div className="flex flex-wrap gap-4 w-full h-20">
                            <UnitOfMeasureField
                              name="items.0.unitKind"
                              width="flex-[1_0_225px]"
                            />
                            <UnitCostInput
                              name="items.0.unitCost"
                              width="flex-[1_0_140px]"
                              index={0}
                            />
                          </div>

                          {/* Seção "Padrão de medidas do produto" */}
                          {watch('items.0.unitKind') &&
                            watch('items.0.unitKind') !== 'UNITY' && (
                              <div className="w-full">
                                <h4 className="type-card-title mb-2">
                                  Padrão de medidas do produto
                                </h4>
                                <div className="flex flex-wrap gap-3 p-6 bg-blue-light-50 rounded-xl border border-blue-light-300">
                                  <MeasurementInput
                                    control={control}
                                    index={0}
                                    unitKind={watch('items.0.unitKind')}
                                  />
                                  <FormBrlInput
                                    name={`items.0.salePrice`}
                                    label="Valor"
                                    startAdornment={<>R$</>}
                                    width="flex-[1_0_140px]"
                                    disabled
                                  />
                                </div>
                              </div>
                            )}

                          {/* Variações já no START (PV-6, 05/10/2026). No PRO
                              elas vivem na aba Composição */}
                          {showVariations && (
                            <div className="w-full rounded-xl border border-gray-200 p-4">
                              {editMode && productId ? (
                                <ProductVariations
                                  productId={productId}
                                  unitKind={watch('items.0.unitKind')}
                                />
                              ) : (
                                <p className="text-sm text-gray">
                                  <span className="font-medium text-gray-700">
                                    Variações
                                  </span>{' '}
                                  · Tamanhos ou cores do mesmo produto (P, M, G;
                                  4x0, 4x4) entram depois de salvar, na edição
                                  do produto.
                                </p>
                              )}
                            </div>
                          )}
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
                                onClick={() =>
                                  handleRemoveCompositionProducts(index)
                                }
                              >
                                <IconTrash aria-hidden size={ICON_SIZE.sm} />
                              </Button>
                            )}
                            <FormInput
                              name={`items.${index}.name`}
                              label="Nome da unidade de venda"
                              width="flex-[1_0_100%]"
                            />

                            {/* Primeira linha: Seletor de unidade comercial e valor unitário */}
                            <div className="flex flex-wrap gap-4 w-full">
                              <UnitOfMeasureField
                                name={`items.${index}.unitKind`}
                                width="flex-[1_0_200px]"
                              />
                              <UnitCostInput
                                name={`items.${index}.unitCost`}
                                width="flex-[1_0_140px]"
                                index={index}
                              />
                            </div>

                            {/* Seção "Padrão de medidas do produto" */}
                            {watch(`items.${index}.unitKind`) &&
                              watch(`items.${index}.unitKind`) !== 'UNITY' && (
                                <div className="w-full">
                                  <h4 className="type-body-strong mb-3">
                                    Padrão de medidas do produto
                                  </h4>
                                  <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
                                    <MeasurementInput
                                      control={control}
                                      index={index}
                                      unitKind={watch(
                                        `items.${index}.unitKind`,
                                      )}
                                    />
                                    <FormBrlInput
                                      name={`items.${index}.salePrice`}
                                      label="Valor"
                                      startAdornment={<>R$</>}
                                      width="flex-[1_0_140px]"
                                      disabled
                                    />
                                  </div>
                                </div>
                              )}
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
                            <FeaturedIcon tone="brand" Icon={IconPlus} />
                            <p className="text-sm text-gray-600 font-medium">
                              Adicionar outra unidade de venda
                            </p>
                          </Button>
                        </div>
                      )}
                      <FormImageUploadBigSmall
                        control={control}
                        imageName="imageUrl"
                        sizeName="imageSize"
                      />
                      <FormTextarea
                        name="technicalDescription"
                        label="Descritivo técnico"
                        placeholder="Digite aqui."
                      />
                      <div className="flex gap-6">
                        <div className="flex items-center gap-1.5">
                          <FormSwitch
                            name="allowEditValues"
                            label="Permitir editar valor"
                          />
                          <AllowEditValueHint />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FormSwitch
                            name="allowEditDescription"
                            label="Permitir editar descrição"
                          />
                          <AllowEditDescriptionHint />
                        </div>
                      </div>
                      {canShowProductionStages && !showCompositionTab && (
                        <ProductionStages />
                      )}
                    </form>
                  </Form>
                </TabsContent>

                {showCompositionTab && (
                  <TabsContent value="composition" className="mt-0 p-6">
                    {editMode && productId ? (
                      <TooltipProvider>
                        <div className="space-y-5">
                          <AssemblyEditor productId={productId} embedded />
                          {canShowProductionStages && (
                            <Form {...form}>
                              <div className="space-y-1">
                                <ProductionStages />
                                <p className="text-sm text-gray">
                                  Enquanto a Agenda de entrega não lê o fluxo,
                                  ela usa esta lista de setores. As caixas do
                                  fluxo acima são as etapas que vão substituí-la
                                  (ET-1).
                                </p>
                              </div>
                            </Form>
                          )}
                        </div>
                      </TooltipProvider>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <FeaturedIcon tone="brand" Icon={IconHierarchy2} />
                        <p className="text-base font-semibold text-gray-700">
                          O fluxo de etapas vem depois de salvar
                        </p>
                        <p className="max-w-md text-sm text-gray">
                          Preencha a aba Produto e salve. O produto reabre nesta
                          aba para você montar as etapas, com os processos,
                          materiais e tempos de cada uma.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                )}

                {showFiscalTab && (
                  <TabsContent value="fiscal" className="mt-0 p-6">
                    <Form {...fiscalForm}>
                      <form
                        id="new-product-fiscal"
                        onSubmit={handleSave}
                        noValidate
                      >
                        <ProductFiscalTab />
                      </form>
                    </Form>
                  </TabsContent>
                )}
              </ScrollArea>
            </Tabs>
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
                <PermissionGate
                  permissions={['product_settings:products:delete']}
                >
                  <Button
                    type="button"
                    variant={isActive ? 'errorOutline' : 'successOutline'}
                    onClick={() => setInactivateOpen(true)}
                  >
                    {isActive ? 'Inativar' : 'Ativar'}
                  </Button>
                </PermissionGate>
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
                type="button"
                onClick={handleSave}
                RightIcon={IconCircleCheck}
                disabled={form.formState?.isSubmitting}
                isLoading={form.formState?.isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
        {editMode && productId && (
          <InactivateProductDialog
            product={{
              id: productId,
              name: product?.name || 'este produto',
              active: !!isActive,
            }}
            open={inactivateOpen}
            onOpenChange={setInactivateOpen}
          />
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
      RightIcon={editMode ? IconPencil : IconPlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo produto'}
    </Button>
  )
}
