'use client'

// React
import { InfoHint } from '@/components/common/InfoHint'
import React, { useEffect, useState } from 'react'
import { AiContextButton } from '@/components/ai/AiContextButton'

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
import { ProductPrintSettings } from './ProductPrintSettings'
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
import {
  UnitCostInput,
  convertRawToUnitCost,
  convertUnitCostToRaw,
} from '@/components/common/form/global-inputs/products/UnitCostInput'
import { SelectProductGroupWithSectorField } from '@/components/common/form/global-inputs/ProductGroupWithSectorSelectField'
import { ProductFiscalTab } from './ProductFiscalData/ProductFiscalTab'
import { InactivateProductDialog } from './InactivateProductDialog'
import { OutsourcedProductFields } from './OutsourcedProductFields'
import { NewGroupInline } from './NewGroupInline'
import { ProductPriceTiers } from './ProductPriceTiers'
import { ProductionStagesSection } from './ProductionStagesSection'
import { ProductFormAccordion } from './ProductFormAccordion'
import {
  saveProductVariations,
  setPriceTiers,
} from '@/actions/product-variations'
import type { PriceTier, UnitKind } from '../[id]/composicao/assembly'
import { unitSymbol } from '../[id]/composicao/assembly'

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
  IconTruckDelivery,
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
  getDataOld,
} from '@/actions/_cruds'

// Hooks
import { useSector } from '@/hooks/queries/useSector'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { cn } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// O código sugerido pelo nome (18/11/2026): 5 letras, como os produtos
// que vêm cadastrados (ADBLK). Duas da primeira palavra e três da segunda,
// sem acento nem palavras curtas ("de", "com"); com uma palavra só, as
// cinco primeiras. "Lona impressa com bainha e ilhós" → LOIMP
const CODE_STOP = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'com',
  'e',
  'em',
  'para',
  'a',
  'o',
  'sem',
])
export function suggestProductCode(name: string) {
  const words = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((word) => word && !CODE_STOP.has(word.toLowerCase()))
  if (!words.length) return ''
  const [first, second] = words
  const code = second ? first.slice(0, 2) + second.slice(0, 3) : first
  return code.slice(0, 5)
}

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
  // Variações e faixas digitadas no cadastro novo, gravadas depois que o
  // produto existe (27/10/2026)
  const [pendingVariations, setPendingVariations] = useState<
    { name: string; unitPrice: number | null }[]
  >([])
  const [pendingTiers, setPendingTiers] = useState<PriceTier[]>([])
  // Com variações, os valores por quantidade passam para cada uma
  const [variationCount, setVariationCount] = useState(0)
  const [advancedSaleOpen, setAdvancedSaleOpen] = useState(false)

  const canAddComposition = canManageProducts()
  const canShowProductionStages = canManageProductionStages()
  const showFiscalTab = hasFiscalModule()
  // A composição é recurso do cadastro do produto, não tela à parte (CP-17):
  // do PRO em diante o diálogo ganha a aba, e o fluxo de etapas (FL-1) toma o
  // lugar da lista simples de etapas do LITE (ET-1). A composição lê a
  // API (contrato, módulo 1, parte A)
  const showCompositionTab = hasFeature(FEATURES.COSTS.COST_BASE)
  // Variações, faixas de quantidade e quantidade mínima são do LITE em
  // diante (chave product_composition; decisão de 27/10/2026). As variações
  // simples e as faixas ficam aqui; com a composição (PRO), elas vivem na
  // aba Composição. A quantidade mínima fica no produto em todos os planos a
  // partir do LITE: no PRO ela é a base mínima dos materiais da composição
  const hasLiteProducts = hasFeature(FEATURES.PRODUCTS.PRODUCT_COMPOSITION)
  const showVariations = hasLiteProducts && !showCompositionTab
  const showMinQuantity = hasLiteProducts

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
          // O custo do fornecedor vem na base da API (por mm², mm…) e a
          // tela mostra por m², metro… (T-5)
          isOutsourced: product?.isOutsourced ?? false,
          outsourcedCost: product?.outsourcedCost
            ? convertRawToUnitCost(
                product?.items?.[0]?.unitKind || 'UNITY',
                product.outsourcedCost,
              )
            : null,
          suppliers: product?.suppliers ?? [],
          supplierPick: null,
          minQuantity: product?.minQuantity ?? null,
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

  const { handleSubmit, control, reset, watch, setError } = form

  // Configurações avançadas de venda (16/11/2026): a sanfona começa fechada
  // e abre sozinha no produto terceirizado (botão "Produto terceirizado" ou
  // edição de um), porque fornecedor e custo são obrigatórios
  // As configurações do produto abrem pelo que ele é (PS-3, área 03,
  // 17/11/2026): sangria, folhas de acerto e papel são da impressão em folha
  // (gráfica rápida, offset), não de toda impressão. Provisório até o produto
  // guardar as suas produções: o setor do produto ou de uma etapa ligada é o
  // "Gráfica Rápida" (ícone printer)
  const productSectorIds = [
    watch('sectorId'),
    ...(watch('productionStages') || [])
      .filter((stage) => stage.isActive)
      .map((stage) => stage.id),
  ]
  // Com a composição aprovada (PRO), a contagem de folhas vem da linha de
  // papel dela, e a sangria e as folhas de acerto do produto não valem
  // (18/11/2026): o cartão sai
  const passesSheetPrinting =
    product?.compositionStatus !== 'RELEASED' &&
    (sectors || []).some(
      (sector) =>
        sector.icon === 'printer' && productSectorIds.includes(sector.id),
    )

  const isOutsourced = watch('isOutsourced')
  useEffect(() => {
    if (isOutsourced) setAdvancedSaleOpen(true)
  }, [isOutsourced])
  useEffect(() => {
    if (!open) setAdvancedSaleOpen(false)
  }, [open])

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
    setPendingVariations([])
    setPendingTiers([])
    items.replace(defaultItemFields)
    fiscalForm.reset(defaultFiscalDataValues)
  }

  // O código é único na empresa, inclusive entre os inativos, que a lista
  // esconde: a API só diz "código já existe", e quem cadastrava não achava o
  // produto que o usa (Lite 4, terceirizado, 29/10/2026)
  const codeOwner = async (code: string) => {
    for (const status of ['ACTIVE', 'INACTIVE']) {
      const res = await getDataOld({
        route: 'productRoute',
        filters: { search: code, status, limit: '20' },
      })
      const owner = (
        (res?.data ?? []) as { name: string; code: string }[]
      ).find((item) => item.code?.toUpperCase() === code.toUpperCase())
      if (owner) return { name: owner.name, inactive: status === 'INACTIVE' }
    }
    return null
  }

  // O código nasce do nome no produto novo (18/11/2026): a pessoa não
  // precisa inventar um; depois de criado, pode ser editado. Se já existir
  // (inclusive em produto inativo), ganha um número no fim
  const uniqueCode = async (base: string) => {
    let candidate = base
    for (let n = 2; n < 50 && (await codeOwner(candidate)); n++) {
      candidate = `${base}${n}`
    }
    return candidate
  }

  const onSubmit = async (data: NewProductsFormType) => {
    if (!editMode) {
      const base = data.code || suggestProductCode(data.name)
      const code = await uniqueCode(base)
      if (code !== data.code) form.setValue('code', code)
      data = { ...data, code }
    }
    // Produto terceirizado (T-5): fornecedor e custo são obrigatórios
    if (data.isOutsourced) {
      if (!data.suppliers?.length) {
        toast.error('Informe pelo menos um fornecedor do terceirizado')
        return
      }
      if (!(Number(data.outsourcedCost) > 0)) {
        toast.error('Informe o custo do fornecedor')
        return
      }
    }
    // Quantidade mínima só quando preenchida (no cadastro novo): a API sem
    // o patch 13 recusa campo desconhecido
    const minimums: { minQuantity?: number | null } = {}
    if (Number(data.minQuantity) > 0) {
      minimums.minQuantity = Number(data.minQuantity)
    } else if (editMode) {
      minimums.minQuantity = null
    }
    const body = {
      isOutsourced: !!data.isOutsourced,
      outsourcedCost: data.isOutsourced
        ? convertUnitCostToRaw(
            data.items?.[0]?.unitKind || 'UNITY',
            Number(data.outsourcedCost) || 0,
          )
        : null,
      supplierIds: data.isOutsourced
        ? (data.suppliers || []).map((supplier) => supplier.id)
        : [],
      name: data.name,
      code: data.code,
      categoryId: data.categoryId,
      sectorId: data.sectorId,
      technicalDescription: data?.technicalDescription ?? '',
      allowEditValues: data.allowEditValues,
      allowEditDescription: data.allowEditDescription,
      ...minimums,
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

      // A API desatualizada recusa campo que ainda não conhece ("property X
      // should not exist"): grava sem esses campos e avisa quais ficaram de
      // fora, em vez de perder o cadastro (27/10/2026)
      const send = async (payload: Record<string, unknown>) =>
        editMode
          ? updateItemNew({ route: `/product/${productId}`, data: payload })
          : createItemNew({ route: '/product', data: payload })
      let payload: Record<string, unknown> = body
      let result = await send(payload)
      const unknown: string[] = []
      // A API aponta um campo por vez: tira e tenta de novo, até seis vezes
      for (let attempt = 0; attempt < 6 && !result.success; attempt++) {
        const field = String(result.message).match(
          /property (\w+) should not exist/,
        )?.[1]
        if (!field || !(field in payload)) break
        unknown.push(field)
        payload = Object.fromEntries(
          Object.entries(payload).filter(([key]) => key !== field),
        )
        result = await send(payload)
      }
      if (result.success && unknown.length) {
        toast.warning(
          `A API ainda não aceita: ${unknown.join(', ')}. O produto foi salvo sem esses campos.`,
        )
      }

      if (!result.success) {
        throw new Error(result.message)
      }

      if (editMode) {
        toast.success('Produto atualizado')
      } else {
        createdProduct = result.data
        toast.success('Produto criado')
      }

      // Save fiscal data if fiscal tab is shown and productId is available
      const savedId = editMode ? productId : createdProduct?.id
      if (!editMode && savedId) {
        if (pendingVariations.length) {
          const res = await saveProductVariations({
            productId: savedId,
            variations: pendingVariations,
          })
          if (!res.success)
            toast.error(`Variações não gravadas: ${res.message}`)
        }
        if (pendingTiers.length) {
          const res = await setPriceTiers({
            productId: savedId,
            tiers: pendingTiers,
          })
          if (!res.success) toast.error(`Faixas não gravadas: ${res.message}`)
        }
        setPendingVariations([])
        setPendingTiers([])
      }
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
      const message = error instanceof Error ? error.message : ''
      if (/código.*já existe/i.test(message)) {
        const owner = await codeOwner(data.code)
        const text = owner
          ? owner.inactive
            ? `O código ${data.code} é do produto ${owner.name}, que está inativo. Use outro código ou reative esse produto.`
            : `O código ${data.code} é do produto ${owner.name}. Use outro código.`
          : `O código ${data.code} já é usado por outro produto. Use outro código.`
        setActiveTab('general')
        setError('code', { message: text })
        toast.error(text)
        return
      }
      toast.error(
        `Erro ao ${editMode ? 'editar' : 'cadastrar'} produto: ${message || 'Erro desconhecido'}`,
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
                <span>
                  {editMode
                    ? watch('isOutsourced')
                      ? 'Editar produto terceirizado'
                      : 'Editar produto'
                    : watch('isOutsourced')
                      ? 'Novo produto terceirizado'
                      : 'Novo produto'}
                </span>
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
                      <div className="flex flex-[1_0_190px] gap-2">
                        <SelectProductGroupWithSectorField
                          name="categoryId"
                          label="Grupo de produtos"
                          width="flex-1"
                          selectedSectorId={watch('sectorId')}
                        />
                        <NewGroupInline
                          sectorId={watch('sectorId')}
                          onCreated={(id) =>
                            form.setValue('categoryId', id, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        />
                      </div>

                      <FormInput
                        name="name"
                        label="Nome do produto"
                        width="flex-[1_0_400px]"
                        additionalOnChange={(value) => {
                          if (items?.fields?.length === 1) {
                            form.setValue('items.0.name', String(value))
                          }
                          if (!editMode) {
                            form.setValue(
                              'code',
                              suggestProductCode(String(value || '')),
                              { shouldValidate: !!value },
                            )
                          }
                        }}
                      />
                      <FormInput
                        name="code"
                        label="Código"
                        labelSuffix={
                          <span className="ml-1 inline-flex align-middle">
                            <InfoHint title="Código do produto">
                              <p>
                                No produto novo, o código é criado sozinho a
                                partir do nome: as primeiras letras das palavras
                                principais, com 5 letras. Se já existir, ganha
                                um número no fim.
                              </p>
                              <p>
                                Depois de salvar, o código pode ser editado. Ele
                                é único na empresa e serve para achar o produto
                                rápido na busca e na planilha.
                              </p>
                            </InfoHint>
                          </span>
                        }
                        width="flex-[1_0_250px]"
                        readOnly={!editMode}
                        className={cn(!editMode && 'bg-gray-50 text-gray-600')}
                        placeholder={editMode ? undefined : 'Criado pelo nome'}
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
                      {/* O assistente escreve o descritivo do produto já
                          cadastrado (IA-5, seção 9) */}
                      {productId && (
                        <AiContextButton
                          label="Escrever descritivo com IA"
                          message="Escreva o descritivo técnico deste produto."
                          context={{ productId }}
                        />
                      )}
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
                      {/* Configurações avançadas de venda (16/11/2026): o
                          produto é composto acima (dados e unidades de
                          venda); numa sanfona ficam o terceirizado e as
                          regras de venda dele */}
                      <ProductFormAccordion
                        title="Configurações avançadas de venda"
                        description={
                          items?.fields?.length === 1 &&
                          (showVariations || showMinQuantity)
                            ? 'Produto terceirizado, variações, quantidade mínima e preço por quantidade.'
                            : 'Produto terceirizado: comprado de fornecedor e revendido.'
                        }
                        open={advancedSaleOpen}
                        onOpenChange={setAdvancedSaleOpen}
                        contentClassName="flex flex-col gap-4"
                      >
                        <OutsourcedProductFields />
                        {items?.fields?.length === 1 &&
                          (showVariations ||
                            showMinQuantity ||
                            hasFeature(FEATURES.PRODUCTS.PAPER_REGISTER)) && (
                            <>
                              {/* Variações do LITE em diante (PV-6, 05/10/2026;
                              plano revisto em 27/10/2026). No PRO elas vivem
                              na aba Composição */}
                              {showVariations && (
                                <div className="w-full rounded-xl border border-gray-200 bg-white p-4">
                                  <ProductVariations
                                    productId={
                                      editMode ? (productId ?? null) : null
                                    }
                                    unitKind={watch('items.0.unitKind')}
                                    onLocalChange={setPendingVariations}
                                    onCountChange={setVariationCount}
                                    showPaper={passesSheetPrinting}
                                    basePriceCents={Math.round(
                                      convertRawToUnitCost(
                                        watch('items.0.unitKind') || 'UNITY',
                                        Number(watch('items.0.unitCost')) || 0,
                                      ),
                                    )}
                                  />
                                </div>
                              )}
                              {/* Impressão da gráfica rápida (12/11/2026):
                              sangria e folhas de acerto, com Papéis no plano.
                              Só no produto que passa por um setor de impressão
                              em folha (17/11/2026): a letra caixa não vê */}
                              {hasFeature(FEATURES.PRODUCTS.PAPER_REGISTER) &&
                                passesSheetPrinting &&
                                (editMode && productId ? (
                                  <ProductPrintSettings productId={productId} />
                                ) : (
                                  <p className="w-full text-xs text-gray">
                                    Salve o produto para configurar a impressão:
                                    sangria e folhas de acerto.
                                  </p>
                                ))}
                              {/* Quantidade mínima (27/10/2026), na unidade do
                              produto, do LITE em diante: abaixo dela o item é
                              cobrado pelo mínimo (0,5 m² a R$ 100 o m² = R$ 50).
                              No PRO é também a base mínima dos materiais */}
                              {showMinQuantity && (
                                <div className="w-full space-y-4 rounded-xl border border-gray-200 bg-white p-4">
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="type-card-title">
                                      Quantidade mínima
                                    </h4>
                                    <InfoHint title="Quantidade mínima">
                                      <p>
                                        O menor tamanho que a empresa cobra por
                                        este produto, mesmo que o pedido seja
                                        menor.
                                      </p>
                                      <p>
                                        <MinimumExample
                                          unitKind={
                                            (watch(
                                              'items.0.unitKind',
                                            ) as UnitKind) || 'UNITY'
                                          }
                                        />
                                      </p>
                                    </InfoHint>
                                  </div>
                                  <FormInput
                                    name="minQuantity"
                                    label={`Quantidade mínima (${
                                      unitSymbol[
                                        (watch(
                                          'items.0.unitKind',
                                        ) as UnitKind) || 'UNITY'
                                      ] || 'un'
                                    })`}
                                    type="number"
                                    step="0.001"
                                    width="flex-[1_0_160px]"
                                  />
                                </div>
                              )}
                              {/* Faixas de quantidade do LITE em diante (FQ-1;
                              decisão do produto, 26/10/2026). No PRO elas vivem
                              na aba Composição, com custo e margem por faixa */}
                              {/* Com variações, os valores por quantidade são de
                              cada variação (correção do LITE, 11/11/2026): a
                              tabela do produto só aparece se já tiver faixas,
                              avisando que não vale, para serem apagadas */}
                              {showVariations && (
                                <ProductPriceTiers
                                  className="rounded-xl border border-gray-200 bg-white p-4"
                                  productId={
                                    editMode ? (productId ?? null) : null
                                  }
                                  unitKind={watch('items.0.unitKind')}
                                  basePriceCents={Math.round(
                                    convertRawToUnitCost(
                                      watch('items.0.unitKind') || 'UNITY',
                                      Number(watch('items.0.unitCost')) || 0,
                                    ),
                                  )}
                                  onLocalChange={setPendingTiers}
                                  hideWhenEmpty={variationCount > 0}
                                  notice={
                                    variationCount > 0
                                      ? 'Com variações, vale a tabela de cada variação: esta não entra no orçamento. Apague as faixas daqui e cadastre em cada variação.'
                                      : undefined
                                  }
                                />
                              )}
                            </>
                          )}
                      </ProductFormAccordion>
                      {canShowProductionStages && !showCompositionTab && (
                        <ProductionStagesSection />
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
                                <ProductionStages
                                  hint={
                                    <InfoHint title="Etapas de produção">
                                      <p>
                                        Os setores por onde o produto passa. A
                                        Agenda de entrega usa esta lista para
                                        mostrar em que setor está cada pedido.
                                      </p>
                                      <p>
                                        No PRO, a composição acima também tem as
                                        etapas. Por enquanto a Agenda de entrega
                                        continua lendo esta lista.
                                      </p>
                                    </InfoHint>
                                  }
                                />
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

// O exemplo da quantidade mínima acompanha a unidade comercial (27/10/2026).
// Em JSX para a biblioteca de idiomas enxergar os textos (IN-7)
function MinimumExample({ unitKind }: { unitKind: UnitKind }) {
  switch (unitKind) {
    case 'AREA':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 100,00 o m²
          com mínimo de 0,5 m², o item sai por R$ 50,00 mesmo com 0,2 m² de
          arte. A medida digitada permanece, e a área total aparece em vermelho
          apontando o mínimo.
        </>
      )
    case 'LENGTH':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 20,00 o
          metro com mínimo de 0,5 m, o item sai por R$ 10,00 mesmo com 0,3 m. A
          medida digitada permanece, e o total aponta o mínimo em vermelho.
        </>
      )
    case 'WEIGHT':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 40,00 o
          quilo com mínimo de 0,5 kg, o item sai por R$ 20,00 mesmo com 0,2 kg.
          O peso digitado permanece, e o total aponta o mínimo em vermelho.
        </>
      )
    case 'CAPACITY':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 30,00 o
          litro com mínimo de 0,5 l, o item sai por R$ 15,00 mesmo com 0,2 l. A
          quantidade digitada permanece, e o total aponta o mínimo em vermelho.
        </>
      )
    case 'DISTANCE':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 5,00 o
          quilômetro com mínimo de 10 km, o item sai por R$ 50,00 mesmo com 4
          km. A distância digitada permanece, e o total aponta o mínimo em
          vermelho.
        </>
      )
    case 'DURATION':
      return (
        <>
          Abaixo dela, o item é cobrado pela quantidade mínima: a R$ 80,00 a
          hora com mínimo de 1 h, o item sai por R$ 80,00 mesmo com 30 minutos.
          O tempo digitado permanece, e o total aponta o mínimo em vermelho.
        </>
      )
    case 'UNITY':
    default:
      return (
        <>
          O item já nasce com essa quantidade no orçamento e, abaixo dela, é
          cobrado pela quantidade mínima: a R$ 1,00 a unidade com mínimo de 100
          un, o item sai por R$ 100,00 mesmo com 50 pedidas. A quantidade
          digitada permanece, e o total aponta o mínimo em vermelho.
        </>
      )
  }
}

export function NewProductTriggerButton({
  editMode,
  outsourced,
  onOpenChange,
}: {
  editMode?: boolean
  // O botão "Produto terceirizado" (T-5): o mesmo formulário, já com o
  // bloco do terceirizado aberto
  outsourced?: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (outsourced) {
    return (
      <Button
        type="button"
        variant="neutralOutline"
        LeftIcon={IconTruckDelivery}
        onClick={() => onOpenChange(true)}
      >
        Produto terceirizado
      </Button>
    )
  }
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
