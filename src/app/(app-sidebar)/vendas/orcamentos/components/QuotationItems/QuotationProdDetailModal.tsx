/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useCallback, useEffect } from 'react'
// UI component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Form } from '@/components/ui/form'

// Component Imports
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { UnitOfMeasureField } from '@/components/common/form/global-inputs/UnitOfMeasureField'

// Icon Imports
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  IconCircleCheck,
  IconHelpCircle,
  IconPackage,
} from '@tabler/icons-react'

// Third-party Imports
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { useProductDetail } from '@/hooks/queries/useProductDetail'
import { useQuotation } from '@/contexts/quotationContext'
import { ProductImageUpload } from '@/components/common/form/global-inputs/ProductImageUpload'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MeasurementInput } from '@/components/common/form/global-inputs/products/MeasurementInput'
import {
  UnitCostInput,
  convertUnitCostToRaw,
} from '@/components/common/form/global-inputs/products/UnitCostInput'
import {
  defaultProductValues,
  productSchema,
  ProductsFormType,
} from './productSchema'
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'
import { parseCurrencyToBrl, cn } from '@/lib/utils'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QuotationItemType } from '@/types/sales/quotation'

import { QUOTATION_DATA_QUERY_KEY } from '../../[quotationId]/components/Quotation'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { SaleCompositionFields } from './SaleCompositionFields'
import { saveItemComposition } from '@/actions/quotation-composition'
import { getPriceTiers, getProductVariations } from '@/actions/product-assembly'
import type { ItemComposition } from '../../[quotationId]/composicao/types'

interface Props {
  open: boolean
  editMode?: boolean
  data?: QuotationItemType
  // O que o vendedor já escolheu na composição deste item, ao editar
  composition?: ItemComposition
}

// Função auxiliar para calcular medida básica baseada no unitKind (valores brutos)
function calculateRawMeasurement(
  item: {
    width?: number | null
    height?: number | null
    length?: number | null
    volume?: number | null
    weight?: number | null
    distance?: number | null
    duration?: number | null
  },
  unitKind: string,
): number {
  switch (unitKind) {
    case 'AREA':
      // Calcular diretamente em mm² (sem conversão)
      return (item.width ?? 0) * (item.height ?? 0)
    case 'LENGTH':
      // Usar comprimento em mm (sem conversão)
      return item.length ?? 0
    case 'CAPACITY':
      // Usar volume em ml (sem conversão)
      return item.volume ?? 0
    case 'WEIGHT':
      // Usar peso em mg (sem conversão)
      return item.weight ?? 0
    case 'DISTANCE':
      // Usar distância em metros (sem conversão)
      return item.distance ?? 0
    case 'DURATION':
      // Usar duração em segundos (sem conversão)
      return item.duration ?? 0
    default:
      return 1
  }
}

export function QuotationProdDetailModal({
  open,
  editMode,
  data,
  composition: savedComposition,
}: Props) {
  const params = useParams()
  // Produto com composição (PRO): o vendedor preenche só o que é editável
  // nela, dentro deste mesmo modal (IP-36, ORC-3)
  const [composition, setComposition] = React.useState<
    ItemComposition | undefined
  >()
  const queryClient = useQueryClient()
  const { quotationData, openChangeModal } = useQuotation()
  // const { data: unitOfMeasure } = useUnitOfMeasure()
  const { data: product, isLoading } = useProductDetail(
    quotationData.productId || '',
  )

  const { quotationId } = params

  // console.info('PRODUCT: ', product)
  // console.info('DATA: ', data)

  function parseQuotationData(data: QuotationItemType) {
    if (!data) return defaultProductValues
    const newData = {
      ...data,
      productId: data.id ?? null,
      description: data.description ?? null,
      imageUrl: data.image?.url ?? null,
      technicalDescription: data.technicalDescription ?? null,
      quantity: data.product.quantity ?? 1,
      items: data?.product?.compositions.map((item) => {
        return {
          ...item,
          id: item.id ?? null,
          name: item.name ?? null,
          quantity: item?.quantity ?? null,
          // Usar valores diretos do backend sem recalcular
          salePrice: item?.totalValue ?? null,
          unitCost: item?.unitValue ?? null,
          unitKind: item.unitKind ?? null,
          // Manter as dimensões originais da API
          width: item.width || null,
          height: item.height || null,
          length: item.length || null,
          volume: item.volume || null,
          weight: item.weight || null,
          distance: item.distance || null,
          duration: item.duration || null,
        }
      }),
    }
    return newData
  }

  const form = useForm<ProductsFormType>({
    resolver: zodResolver(productSchema),
    values: editMode
      ? (parseQuotationData(data as QuotationItemType) as ProductsFormType)
      : defaultProductValues,
  })

  const {
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = form

  useEffect(() => {
    if (product && !editMode && open) {
      reset({
        ...product,
        productId: product.id,
        description: product.name as unknown as string,
        technicalDescription:
          product?.technicalDescription as unknown as string,
        quantity: Number(product.quantity ?? 1),
        items: product.items.map((item) => ({
          ...item,
          name: item.name,
          quantity: item.quantity ?? 1,
          salePrice: item.salePrice,
          unitCost: item.unitCost,
        })),
      })
    }
  }, [product, reset, open])

  const items = useFieldArray({
    control: form.control,
    name: 'items',
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calculateSalesValue = (index: number) => {
    const compositions = watch('items')
    const item = compositions[index]
    if (!item)
      return {
        total: 0,
        measurementValue: 0,
      }

    // Em modo de edição, recalcular baseado na nova quantidade
    if (editMode && item.salePrice) {
      const quantity = Number(item.quantity || 1)
      const productQuantity = Number(watch('quantity') || 1)
      const items = watch('items') ?? []

      const measurement = (): number => {
        const basicMeasurement = calculateRawMeasurement(item, item.unitKind)

        // Para produto simples (apenas 1 item): multiplicar apenas pela quantidade
        // Para produto composto (múltiplos itens): multiplicar por ambas as quantidades
        const isSimpleProduct = items.length === 1
        return isSimpleProduct
          ? basicMeasurement * quantity
          : basicMeasurement * quantity * productQuantity
      }

      const measurementValue = item.unitCost * measurement()
      const total = measurementValue

      return {
        measurementValue,
        total,
      }
    }

    // Lógica original para novos itens
    const quantity = Number(item.quantity || 1)
    const productQuantity = Number(watch('quantity') || 1)
    const items = watch('items') ?? []

    const measurement = (): number => {
      const basicMeasurement = calculateRawMeasurement(item, item.unitKind)

      // Para produto simples (apenas 1 item): multiplicar apenas pela quantidade
      // Para produto composto (múltiplos itens): multiplicar por ambas as quantidades
      const isSimpleProduct = items.length === 1
      return isSimpleProduct
        ? basicMeasurement * quantity
        : basicMeasurement * quantity * productQuantity
    }

    const measurementValue = item.unitCost * measurement()

    const total = measurementValue

    return {
      measurementValue,
      total,
    }
  }

  const calculateFinalValue = useCallback((): number => {
    const items = watch('items')
    let total = 0

    items.forEach((item, index) => {
      const { total: saleValue } = calculateSalesValue(index)
      total += saleValue
    })

    // O calculateSalesValue já inclui a quantidade do produto principal
    // para novos itens, então não precisamos multiplicar novamente
    return total
  }, [calculateSalesValue, watch])

  // Preço por faixa de quantidade (FQ-1, FQ-2): a faixa vale para o total,
  // e muda o valor por unidade do item simples conforme a quantidade
  const tierProductId = product?.id || data?.id || null
  const { data: tiersRes } = useQuery({
    enabled: !!tierProductId && open,
    staleTime: 60_000,
    queryKey: ['price-tiers', tierProductId],
    queryFn: () => getPriceTiers({ productId: tierProductId as string }),
  })
  const tiers = tiersRes?.data || []
  const itemQuantity = Number(watch('items.0.quantity') || 1)
  const itemUnitKind = watch('items.0.unitKind')
  const activeTier =
    tiers.length && (watch('items') || []).length === 1
      ? [...tiers]
          .sort((a, b) => b.from - a.from)
          .find((tier) => itemQuantity >= tier.from) || null
      : null
  const baseUnitCost = product?.items?.[0]?.unitCost ?? null

  // Variações do produto (PV-6, já no START): o vendedor escolhe uma, e o
  // preço e o nome do item seguem a escolha. Com variação escolhida, as faixas
  // do produto não se aplicam
  const { data: variationsRes } = useQuery({
    enabled: !!product?.id && open && !editMode,
    staleTime: 60_000,
    queryKey: ['product-variations', product?.id],
    queryFn: () => getProductVariations({ productId: product?.id as string }),
  })
  const variations =
    (watch('items') || []).length === 1 ? variationsRes?.data || [] : []
  const [variationId, setVariationId] = React.useState<string | null>(null)
  useEffect(() => {
    if (open) setVariationId(null)
  }, [open, product?.id])
  const chooseVariation = (id: string) => {
    const variation = variations.find((item) => item.id === id)
    if (!variation) return
    setVariationId(id)
    const target =
      variation.unitPrice !== null
        ? convertUnitCostToRaw(itemUnitKind, variation.unitPrice)
        : baseUnitCost
    if (target !== null && target !== undefined) {
      setValue('items.0.unitCost', target)
      const { total, measurementValue } = calculateSalesValue(0)
      setValue('items.0.salePrice', total)
      setValue('items.0.measurementValue', measurementValue)
    }
    if (product?.name) {
      setValue('description', `${product.name} · ${variation.name}`)
    }
  }

  useEffect(() => {
    if (variationId) return
    if (!tiers.length || (watch('items') || []).length !== 1) return
    const target =
      activeTier !== null
        ? convertUnitCostToRaw(itemUnitKind, activeTier.unitPrice)
        : baseUnitCost
    if (target === null || target === undefined) return
    if (Number(watch('items.0.unitCost')) === target) return
    setValue('items.0.unitCost', target)
    const { total, measurementValue } = calculateSalesValue(0)
    setValue('items.0.salePrice', total)
    setValue('items.0.measurementValue', measurementValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemQuantity, activeTier?.from, tiers.length])

  if (!open) return null

  function handleToggleModal(open: boolean) {
    openChangeModal(open, 'productDetail')
    if (!open) reset()
  }

  const canEditValue = product?.allowEditValues || data?.allowEditValues

  const canEditDescription =
    product?.allowEditDescription || data?.allowEditDescription

  async function onSubmit(data: ProductsFormType) {
    if (!editMode && variations.length > 0 && !variationId) {
      toast.error('Escolha a variação do produto')
      return
    }
    // Função auxiliar para omitir campos undefined (null é mantido para limpar campos no backend)
    // eslint-disable-next-line
    const omitUndefined = (obj: Record<string, any>) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined),
      )
    }

    // ✅ Payload ajustado conforme orientação do backend
    const newFormData = omitUndefined({
      productId: data.productId,
      quantity: data.quantity,
      description: data.description,
      technicalDescription: canEditDescription
        ? data.technicalDescription?.trim()
          ? data.technicalDescription.trim()
          : null
        : undefined,
      imageUrl: data.imageUrl || undefined,
      items: data?.items?.map((item) =>
        omitUndefined({
          id: item.id,
          quantity: item.quantity,
          unitCost: item.unitCost,
          // Remover unitKind - API não atualiza este campo
          // Valores brutos das dimensões - omitir campos null
          width: item.width || undefined,
          height: item.height || undefined,
          length: item.length || undefined,
          weight: item.weight || undefined,
          volume: item.volume || undefined,
          distance: item.distance || undefined,
          duration: item.duration || undefined,
          salePrice: item.salePrice,
        }),
      ),
    })

    // console.info('SUBMIT:', newFormData)

    if (editMode) {
      const res = await updateItemNew({
        route: `/sale/quotation/update-product/${data?.productId}`,
        data: newFormData,
      })

      if (!res.success) {
        toast.error(res.message)
        return
      }

      // Na edição, o productId do formulário é o id do item
      if (composition && data?.productId) {
        await saveItemComposition({
          quotationId: String(quotationId),
          key: String(data.productId),
          composition,
        })
      }
      handleToggleModal(false)
      toast.success('Produto editado')
      queryClient.invalidateQueries({
        queryKey: ['quotation-item-compositions'],
      })
      await queryClient.invalidateQueries({
        queryKey: [QUOTATION_DATA_QUERY_KEY],
      })
      reset()
      return
    }

    const res = await createItemNew({
      route: `/sale/quotation/${quotationId}/add-product`,
      data: newFormData,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    if (composition) {
      const created = res.data as { id?: string } | undefined
      await saveItemComposition({
        quotationId: String(quotationId),
        key: created?.id || String(data.productId),
        composition,
      })
    }

    handleToggleModal(false)
    queryClient.invalidateQueries({
      queryKey: [QUOTATION_DATA_QUERY_KEY],
    })
    queryClient.invalidateQueries({
      queryKey: ['quotation-item-compositions'],
    })
    reset()
  }

  // function getPriceLabel(unitKind: string): string {
  //   const label = unitOfMeasure?.find((unit) => unit.kind === unitKind)?.name

  //   return label || ''
  // }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent className="sm:max-w-[90%] lg:max-w-[950px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
              {isLoading ? (
                <span className="text-gray-400">
                  Carregando dados do produto...
                </span>
              ) : (
                <span>{product?.name || items?.fields[0]?.name}</span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className={cn(isLoading && 'opacity-50')}>
          <Form {...form}>
            <form
              id="new-product"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-row gap-5"
              noValidate
            >
              <div className="w-[300px] h-[300px] flex items-stretch justify-stretch">
                <ProductImageUpload<ProductsFormType>
                  control={control}
                  name="imageUrl"
                  className="w-full h-full"
                  maxSize={1024 * 50}
                  customHelpText="PNG ou JPG até 50KB e 200x150px"
                />
              </div>
              <div className="flex-1 flex flex-wrap gap-4">
                <FormInput<ProductsFormType>
                  name="description"
                  label="Descrição do item"
                  width="flex-[1_0_380px]"
                  placeholder="Digite aqui"
                  disabled={!canEditDescription}
                />
                {variations.length > 0 && (
                  <div className="w-full space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Variação
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Variação"
                      className="flex flex-wrap gap-2"
                    >
                      {variations.map((variation) => {
                        const selected = variationId === variation.id
                        return (
                          <button
                            key={variation.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => chooseVariation(variation.id)}
                            className={cn(
                              'h-10 rounded-lg border px-4 text-sm font-medium transition-colors',
                              selected
                                ? 'border-brand bg-success-25 text-brand-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                            )}
                          >
                            {variation.name}
                          </button>
                        )
                      })}
                    </div>
                    {!variationId && (
                      <p className="text-xs text-gray">
                        Escolha a variação para o preço e o nome do item.
                      </p>
                    )}
                  </div>
                )}
                {items?.fields?.length > 1 && (
                  <>
                    <FormInput<ProductsFormType>
                      name="quantity"
                      label="Quantidade do item"
                      type="number"
                      min={1}
                      width="flex-[1_0_160px]"
                    />
                    <div className="border-b border-1 border-gray-300 h-0 w-full" />
                  </>
                )}

                {items?.fields?.map((item, index) => {
                  return (
                    <div
                      className="flex flex-wrap gap-4 relative"
                      key={item.id}
                    >
                      <span className="text-sm font-semibold text-gray-700 leading-4 w-[100%] my-2">
                        {item?.name}
                      </span>
                      <UnitOfMeasureField
                        name={`items.${index}.unitKind`}
                        width="flex-[1_0_200px]"
                        disabled
                      />
                      <FormInput<ProductsFormType>
                        name={`items.${index}.quantity`}
                        label="Quantidade"
                        type="number"
                        min={0}
                        startAdornment={
                          items?.fields?.length > 1 ? (
                            <span className="text-gray-500 text-md">
                              {Number(watch('quantity')) || 1}x
                            </span>
                          ) : undefined
                        }
                        endAdornment={
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger type="button">
                                <IconHelpCircle className="text-gray-400 h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent className="w-[205px] text-center">
                                <p>
                                  Esta quantidade é multiplicada pela quantidade
                                  do item
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        }
                        width="flex-[1_0_130px]"
                        additionalOnChange={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(`items.${index}.salePrice`, total)
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue,
                          )
                        }}
                      />
                      <MeasurementInput<ProductsFormType>
                        control={control}
                        index={index}
                        unitKind={watch(`items.${index}.unitKind`)}
                        onHasChanged={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(`items.${index}.salePrice`, total)
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue,
                          )
                        }}
                      />
                      <PermissionGate permissions={['values:values:view']}>
                        <UnitCostInput
                          name={`items.${index}.unitCost`}
                          placeholder="0,00"
                          width="flex-[1_0_130px]"
                          index={index}
                          disabled={!canEditValue}
                          onHasChanged={() => {
                            if (!canEditValue) return

                            const { total, measurementValue } =
                              calculateSalesValue(index)
                            setValue(`items.${index}.salePrice`, total)
                            setValue(
                              `items.${index}.measurementValue`,
                              measurementValue,
                            )
                          }}
                        />
                        <FormBrlInput<ProductsFormType>
                          disabled={!canEditValue}
                          name={`items.${index}.salePrice`}
                          label="Preço de venda"
                          placeholder="0,00"
                          startAdornment={<>R$</>}
                          width="flex-[1_0_130px]"
                        />
                      </PermissionGate>
                      {index === 0 && tiers.length > 0 && !variationId && (
                        <p className="w-full text-xs text-gray">
                          {activeTier
                            ? `Preço da faixa a partir de ${activeTier.from}: R$ ${(activeTier.unitPrice / 100).toFixed(2).replace('.', ',')} por unidade de venda.`
                            : `Abaixo de ${Math.min(...tiers.map((tier) => tier.from))} vale o valor de venda do produto.`}
                        </p>
                      )}
                    </div>
                  )
                })}
                <FeatureGate features={[FEATURES.PRODUCTS.PRODUCT_COMPOSITION]}>
                  <div className="w-full">
                    <SaleCompositionFields
                      key={data?.id || product?.id}
                      productId={
                        product?.id || data?.product?.originalProductId
                      }
                      initial={editMode ? savedComposition : undefined}
                      onChange={setComposition}
                    />
                  </div>
                </FeatureGate>
                <FormTextarea<ProductsFormType>
                  name="technicalDescription"
                  label="Descritivo técnico"
                  placeholder="Digite aqui"
                  disabled={!canEditDescription}
                />
              </div>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col">
            <PermissionGate permissions={['values:values:view']}>
              <strong className="font-semibold text-lg text-gray-900">
                R$ {parseCurrencyToBrl(calculateFinalValue())}
              </strong>
              <span className="font-medium text-gray-700 text-sm">
                Valor Final
              </span>
            </PermissionGate>
          </div>
          <div className="space-x-4">
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.trigger()
                  console.info('Form values:', form.getValues())
                  console.info('Form errors:', form.formState.errors)
                }}
              >
                Teste
              </Button>
            )}
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleToggleModal(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
              form="new-product"
              RightIcon={IconCircleCheck}
              disabled={isLoading}
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
