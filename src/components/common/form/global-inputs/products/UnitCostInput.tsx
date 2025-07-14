'use client'

// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

// Lib Imports
import { cn } from '@/lib/utils'

// Type Imports
import {
  type Path,
  type Control,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

// Third-party Imports
import { NumericFormat } from 'react-number-format'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  className?: string
  index: number
  onHasChanged?: () => void
}

// Função para obter o label baseado na unidade
function getUnitLabel(unitKind: string): string {
  switch (unitKind) {
    case 'AREA':
      return 'Custo por M²'
    case 'LENGTH':
      return 'Custo por Metro'
    case 'CAPACITY':
      return 'Custo por Litro'
    case 'WEIGHT':
      return 'Custo por Kg'
    case 'DISTANCE':
      return 'Custo por Km'
    case 'DURATION':
      return 'Custo por Hora'
    case 'UNITY':
      return 'Custo Unitário'
    default:
      return 'Custo por Unidade'
  }
}

// Função para calcular a quantidade total baseada na unidade
function calculateTotalQuantity(
  unitKind: string,
  item: Record<string, number>,
  isSimpleProduct: boolean,
  productQuantity: number = 1,
): number {
  const itemQuantity = item.quantity || 1
  const baseMultiplier = isSimpleProduct
    ? itemQuantity
    : itemQuantity * productQuantity

  switch (unitKind) {
    case 'AREA': {
      const area = (item.width || 0) * (item.height || 0)
      return area * baseMultiplier
    }

    case 'LENGTH':
      return (item.width || item.length || 0) * baseMultiplier

    case 'CAPACITY':
      return (item.volume || 0) * baseMultiplier

    case 'WEIGHT':
      return (item.weight || 0) * baseMultiplier

    case 'DISTANCE':
      return (item.distance || 0) * baseMultiplier

    case 'DURATION':
      return (item.duration || 0) * baseMultiplier

    case 'UNITY':
    default:
      return baseMultiplier
  }
}

export function UnitCostInput<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_200px]',
  className,
  index,
  onHasChanged,
}: Props<T>) {
  const { watch, setValue, getValues } = useFormContext()

  // Valores observados para cálculo
  const salePrice = watch(`items.${index}.salePrice`) ?? 0
  const unitKind = watch(`items.${index}.unitKind`) ?? ''
  const widthValue = watch(`items.${index}.width`) ?? 0
  const heightValue = watch(`items.${index}.height`) ?? 0
  const lengthValue = watch(`items.${index}.length`) ?? 0
  const volumeValue = watch(`items.${index}.volume`) ?? 0
  const weightValue = watch(`items.${index}.weight`) ?? 0
  const distanceValue = watch(`items.${index}.distance`) ?? 0
  const durationValue = watch(`items.${index}.duration`) ?? 0
  const quantity = watch(`items.${index}.quantity`) ?? 1
  const productQuantity = watch('quantity') ?? 1
  const items = watch('items') ?? []

  // Montar objeto com os valores do item atual
  const currentItem = {
    width: widthValue,
    height: heightValue,
    length: lengthValue,
    volume: volumeValue,
    weight: weightValue,
    distance: distanceValue,
    duration: durationValue,
    quantity,
  }

  // Calcular quantidade total baseada na unidade
  const isSimpleProduct = items.length === 1
  const totalQuantity = calculateTotalQuantity(
    unitKind,
    currentItem,
    isSimpleProduct,
    productQuantity,
  )

  // Determinar o label dinâmico
  const dynamicLabel = label || getUnitLabel(unitKind)

  // Recalcular custo unitário quando preço de venda ou quantidade total mudarem
  useEffect(() => {
    if (totalQuantity > 0 && salePrice > 0) {
      const calculatedUnitCost = salePrice / totalQuantity
      const currentUnitCost = getValues(`items.${index}.unitCost`)

      // Só atualiza se o valor for diferente para evitar loops
      if (Math.abs(calculatedUnitCost - (currentUnitCost || 0)) > 0.001) {
        setValue(`items.${index}.unitCost`, calculatedUnitCost, {
          shouldValidate: false,
          shouldDirty: true,
        })
      }
    }
  }, [salePrice, totalQuantity, setValue, index, getValues])

  // Não renderizar se não houver unidade ou se for UNITY (unidade simples)
  if (!unitKind || unitKind === 'UNITY') {
    return null
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', width)}>
          {dynamicLabel && <FormLabel>{dynamicLabel}</FormLabel>}
          <FormControl>
            <NumericFormat
              customInput={Input}
              decimalScale={2}
              fixedDecimalScale
              thousandSeparator="."
              decimalSeparator=","
              placeholder={placeholder}
              prefix="R$ "
              onValueChange={(values) => {
                const newUnitCost = values.floatValue ?? 0
                field.onChange(newUnitCost)

                // Calcular novo preço de venda baseado no custo unitário
                if (totalQuantity > 0 && newUnitCost > 0) {
                  const newSalePrice = newUnitCost * totalQuantity
                  setValue(`items.${index}.salePrice`, newSalePrice, {
                    shouldValidate: false,
                    shouldDirty: true,
                  })
                }

                onHasChanged?.()
              }}
              value={field.value || ''}
              className={className}
              inputMode="decimal"
              allowedDecimalSeparators={['.', ',']}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
