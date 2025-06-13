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
import { FormCurrencyInput } from '@/components/common/form/FormCurrencyInput'
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
import { parseCurrencyToBrl, parseCurrencyToCent } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { QuotationItemType } from '@/types/sales/quotation'

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
      quantity: data.product.quantity ?? null,
      items: data?.product?.compositions.map((item) => ({
        ...item,
        distance: item.distance ?? null,
        duration: item.duration ?? null,
        height: item.height ?? null,
        id: item.id ?? null,
        length: item.length ?? null,
        quantity: item?.originalQuantity ?? null,
        salePrice:
          parseCurrencyToBrl(item?.unitValue * (item?.originalQuantity ?? 1)) ??
          null,
        unitCost: parseCurrencyToBrl(item?.unitValue) ?? null,
        unitOfMeasureId: item?.unitOfMeasure?.id ?? null,
        volume: item.volume ?? null,
        weight: item.weight ?? null,
        width: item.width ?? null,
      })),
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
        quantity: Number(product.quantity ?? 1) as unknown as number,
        items: product.items.map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
          salePrice: parseCurrencyToBrl(item.salePrice) as unknown as number,
          unitCost: parseCurrencyToBrl(item.salePrice) as unknown as number,
        })),
        // unitOfMeasureId: product.unitOfMeasureId ?? undefined,
        // unitValue: product.salePrice ?? undefined,
        // salesValue: product.salePrice ?? undefined,
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
        total: '0,00',
        measurementValue: '',
      }

    const quantity = Number(item.quantity || 1)

    const unitCode = unitOfMeasure?.find(
      (unit) => unit.id === item.unitOfMeasureId,
    )?.code

    const measurement = (): number => {
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
          const hours = duration > 60 ? duration / 60 : duration
          return hours
        }
        default:
          return 1
      }
    }

    const unitValue = parseFloat(
      String(item.unitCost)
        .replace(/[^0-9,]/g, '')
        .replace(',', '.') || '0',
    )
    const measurementValue = unitValue * measurement()

    const total = measurementValue * quantity

    const formattedData = {
      measurementValue: measurementValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      total: total.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }
    return formattedData
  }

  const calculateFinalValue = useCallback((): string => {
    const items = watch('items')
    const quantity = watch('quantity')
    let total = 0
    items.forEach((item, index) => {
      const { total: saleValue } = calculateSalesValue(index)
      total += Number(
        saleValue.replace('.', '').replace(',', '.').replace('R$', ''),
      )
    })

    total = total * quantity

    return total.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [calculateSalesValue, watch])

  if (!open) return null

  function handleToggleModal() {
    onClose()
    reset()
  }

  async function onSubmit(data: ProductsFormType) {
    // setIsLoading(true)
    const newFormData = {
      ...data,
      items: data?.items?.map((item) => ({
        // ...item,
        distance: item.distance ?? null,
        duration: item.duration ?? null,
        height: item.height ?? null,
        id: item.id ?? null,
        length: item.length ?? null,
        quantity: item.quantity ?? null,
        salePrice:
          parseCurrencyToCent(String(item.measurementValue ?? '')) ?? null,
        unitCost: item.unitCost ?? null,
        unitOfMeasureId: item.unitOfMeasureId ?? null,
        volume: item.volume ?? null,
        weight: item.weight ?? null,
        width: item.width ?? null,
      })),
    }
    // return
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

  function getPriceLabel(unitOfMeasureId: string): string {
    const label = unitOfMeasure?.find(
      (unit) => unit.id === unitOfMeasureId,
    )?.name

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
                        onChange={(e) => {
                          setValue(
                            `items.${index}.quantity`,
                            Number(e.target.value),
                          )
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(
                            `items.${index}.salePrice`,
                            total as unknown as number,
                          )
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue as unknown as number,
                          )
                        }}
                        onBlur={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(
                            `items.${index}.salePrice`,
                            total as unknown as number,
                          )
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue as unknown as number,
                          )
                        }}
                      />
                      <MeasurementInput<ProductsFormType>
                        control={control}
                        index={index}
                        unitOfMeasureId={item?.unitOfMeasureId}
                        onHasChanged={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(
                            `items.${index}.salePrice`,
                            total as unknown as number,
                          )
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue as unknown as number,
                          )
                        }}
                        onBlur={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(
                            `items.${index}.salePrice`,
                            total as unknown as number,
                          )
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue as unknown as number,
                          )
                        }}
                      />
                      <FormCurrencyInput<ProductsFormType>
                        control={control}
                        name={`items.${index}.unitCost`}
                        label={`Valor ${getPriceLabel(item?.unitOfMeasureId)}`}
                        placeholder="0,00"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_130px]"
                        disabled={
                          product?.allowEditValues === false ||
                          data?.allowEditValues === false
                        }
                        // onChange={(e) => {
                        //   const value = parseCurrencyToCent(
                        //     e.target.value.toString(),
                        //   )

                        //   // let value = e.target.value.replace(/[^0-9]/g, '')
                        //   // value = (Number(value) / 100).toLocaleString(
                        //   //   'pt-BR',
                        //   //   {
                        //   //     minimumFractionDigits: 2,
                        //   //     maximumFractionDigits: 2,
                        //   //   },
                        //   // )
                        //   setValue(
                        //     `items.${index}.unitCost`,
                        //     String(value).replace('.', '') as unknown as number,
                        //   )

                        //   const { total, measurementValue } =
                        //     calculateSalesValue(index)
                        //   setValue(
                        //     `items.${index}.salePrice`,
                        //     total as unknown as number,
                        //   )
                        //   setValue(
                        //     `items.${index}.measurementValue`,
                        //     measurementValue as unknown as number,
                        //   )
                        // }}
                        onBlur={() => {
                          const { total, measurementValue } =
                            calculateSalesValue(index)
                          setValue(
                            `items.${index}.salePrice`,
                            total as unknown as number,
                          )
                          setValue(
                            `items.${index}.measurementValue`,
                            measurementValue as unknown as number,
                          )
                        }}
                      />
                      <FormCurrencyInput<ProductsFormType>
                        readOnly
                        disabled
                        control={control}
                        name={`items.${index}.salePrice`}
                        label="Valor de venda"
                        placeholder="0,00"
                        startAdornment={<>R$</>}
                        width="flex-[1_0_130px]"
                        // value={calculateSalesValue(index)}
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
              R$ {calculateFinalValue()}
            </strong>
            <span className="font-medium text-gray-700 text-sm">
              Valor Final
            </span>
          </div>
          <div className="space-x-4">
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
              disabled={!form.formState.isValid || isSubmitting || isLoading}
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
