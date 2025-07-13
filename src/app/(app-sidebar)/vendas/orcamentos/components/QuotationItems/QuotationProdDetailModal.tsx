/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useCallback, useEffect, useState } from 'react'
// UI component Imports
import { Button } from '@/components/ui/button'
import {
  Dialog,
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

// Icon Imports
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
import { useUnitOfMeasure } from '@/hooks/queries/useUnitOfMeasure'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MeasurementInput } from '@/components/common/form/global-inputs/products/MeasurementInput'
import {
  defaultProductValues,
  productSchema,
  ProductsFormType,
} from './productSchema'
import { createItem, updateItem } from '@/actions/_cruds'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { QuotationItemType } from '@/types/sales/quotation'
import { parseCurrencyToBrl } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  editMode?: boolean
  data?: QuotationItemType
}

export function QuotationProdDetailModal({
  open,
  onClose,
  editMode,
  data,
}: Props) {
  const { quotationData } = useQuotation()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const { data: product } = useProductDetail(quotationData.productId || '')
  const { data: unitOfMeasure } = useUnitOfMeasure()
  const params = useParams()
  const { quotationId } = params

  function parseQuotationData(data: QuotationItemType) {
    if (!data) return defaultProductValues
    const newData = {
      ...data,
      productId: data.id ?? null,
      description: data.description ?? null,
      imageUrl: data.image?.url ?? null,
      technicalDescription: data.technicalDescription ?? null,
      quantity:
        data?.product?.compositions?.[0]?.originalQuantity ??
        data.product.quantity ??
        null,
      items: data?.product?.compositions.map((item) => {
        // Calcular measurementValue inicial baseado nos dados existentes
        const unitValue = item?.unitValue ?? 0
        const quantity = item?.originalQuantity ?? 1
        const basicMeasurement = (() => {
          switch (item?.unitOfMeasure?.code) {
            case 'M²':
              return (item.height ?? 0) * (item.width ?? 0)
            case 'M':
              return item.width ?? 0
            case 'LT':
              return item.volume ?? 0
            case 'KG':
              return item.weight ?? 0
            case 'KM':
              return item.distance ?? 0
            case 'HH': {
              const duration = Number(item.duration || 0)
              // Converter minutos para horas
              return duration / 60
            }
            default:
              return 1
          }
        })()

        const measurementValue = unitValue * basicMeasurement * quantity
        return {
          ...item,
          distance: item.distance ?? null,
          duration: item.duration ?? null,
          height: item.height ?? null,
          id: item.id ?? null,
          length: item.length ?? null,
          quantity: item?.originalQuantity ?? null,
          salePrice: item?.totalValue ?? null,
          unitCost: item?.unitValue ?? null,
          unitKind: item?.unitOfMeasure?.id ?? null,
          volume: item.volume ?? null,
          weight: item.weight ?? null,
          width: item.width ?? null,
          measurementValue,
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
    // values: defaultProductValues,
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
    if (product && !editMode) {
      reset({
        ...product,
        productId: product.id,
        description: product.name as unknown as string,
        technicalDescription:
          product?.technicalDescription as unknown as string,
        quantity: Number(product.quantity ?? 1),
        items: product.items.map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
          salePrice: item.salePrice,
          unitCost: item.unitCost,
        })),
      })
    }
  }, [product, reset])

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
        const unitCode = unitOfMeasure?.find(
          (unit) => unit.id === item.unitKind,
        )?.code

        const basicMeasurement = (() => {
          switch (unitCode) {
            case 'M²':
              return (item.height ?? 0) * (item.width ?? 0)
            case 'M':
              return item.width ?? 0
            case 'LT':
              return item.volume ?? 0
            case 'KG':
              return item.weight ?? 0
            case 'KM':
              return item.distance ?? 0
            case 'HH': {
              const duration = Number(item.duration || 0)
              // Converter minutos para horas
              const hours = duration / 60
              return hours
            }
            default:
              return 1
          }
        })()

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

    const unitCode = unitOfMeasure?.find(
      (unit) => unit.id === item.unitKind,
    )?.code

    const measurement = (): number => {
      const basicMeasurement = (() => {
        switch (unitCode) {
          case 'M²':
            return (item.height ?? 0) * (item.width ?? 0)
          case 'M':
            return item.width ?? 0
          case 'LT':
            return item.volume ?? 0
          case 'KG':
            return item.weight ?? 0
          case 'KM':
            return item.distance ?? 0
          case 'HH': {
            const duration = Number(item.duration || 0)
            // Converter minutos para horas
            const hours = duration / 60
            return hours
          }
          default:
            return 1
        }
      })()

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

  if (!open) return null

  function handleToggleModal() {
    onClose()
    reset()
  }

  async function onSubmit(data: ProductsFormType) {
    const newFormData = {
      ...data,
      items: data?.items?.map((item) => ({
        id: item.id ?? null,
        distance: item.distance ?? null,
        duration: item.duration ?? null,
        height: item.height ?? null,
        length: item.length ?? null,
        quantity: item.quantity ?? null,
        salePrice: item.salePrice,
        unitCost: item.unitCost ?? null,
        unitKind: item.unitKind ?? null,
        volume: item.volume ?? null,
        weight: item.weight ?? null,
        width: item.width ?? null,
      })),
    }

    if (!editMode) {
      createItem({
        route: 'quotationRoute',
        customPath: `/${quotationId}/add-product`,
        data: newFormData,
      })
        .then(() => {
          toast.success('Produto adicionado com sucesso!')
          queryClient.invalidateQueries()
          handleToggleModal()
          reset()
        })
        .catch((error) => {
          console.error(error)
          toast.error('Erro ao adicionar novo produto, tente novamente!')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      updateItem(
        'quotationRoute',
        `update-product/${data?.productId}`,
        newFormData,
      )
        .then(() => {
          toast.success('Produto editado com sucesso!')
          queryClient.invalidateQueries()
          handleToggleModal()
          reset()
        })
        .catch((error) => {
          console.error(error)
          toast.error('Erro ao editar produto, tente novamente!')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  function getPriceLabel(unitKind: string): string {
    const label = unitOfMeasure?.find((unit) => unit.kind === unitKind)?.name

    return label || ''
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] lg:max-w-[950px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPackage} />
              <span>{product?.name || items?.fields[0]?.name}</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto flex gap-6 ">
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
                />
              </div>
              <div className="flex-1 flex flex-wrap gap-4">
                <FormInput<ProductsFormType>
                  name="description"
                  label="Descrição do item"
                  width="flex-[1_0_380px]"
                  placeholder="Digite aqui"
                />
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
                        unitKind={item?.unitKind}
                        unitOfMeasureId={watch(
                          `items.${index}.unitOfMeasureId`,
                        )}
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
                      <FormBrlInput<ProductsFormType>
                        name={`items.${index}.unitCost`}
                        label={`Valor ${getPriceLabel(item?.unitKind)}`}
                        placeholder="0,00"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_130px]"
                        disabled={
                          product?.allowEditValues === false ||
                          data?.allowEditValues === false
                        }
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
                      <FormBrlInput<ProductsFormType>
                        readOnly
                        disabled
                        name={`items.${index}.salePrice`}
                        label="Valor de venda"
                        placeholder="0,00"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_130px]"
                      />
                    </div>
                  )
                })}
                <FormTextarea<ProductsFormType>
                  name="technicalDescription"
                  label="Descritivo técnico"
                  placeholder="Digite aqui"
                  disabled={
                    product?.allowEditDescription === false ||
                    data?.allowEditDescription === false
                  }
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col">
            <strong className="font-semibold text-lg text-gray-900">
              R$ {parseCurrencyToBrl(calculateFinalValue())}
            </strong>
            <span className="font-medium text-gray-700 text-sm">
              Valor Final
            </span>
          </div>
          <div className="space-x-4">
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.trigger()
                  console.log('Form values:', form.getValues())
                  console.log('Form errors:', form.formState.errors)
                }}
              >
                Teste
              </Button>
            )}
            <Button
              type="button"
              variant="neutralOutline"
              onClick={handleToggleModal}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="gap-2"
              form="new-product"
              isLoading={isSubmitting || isLoading}
              disabled={isSubmitting || isLoading}
            >
              Salvar
              {!isLoading && <IconCircleCheck />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
