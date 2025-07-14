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
import {
  cn,
  calculateAreaFromMillimeters,
  millimetersToMeters,
} from '@/lib/utils'

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
      return 'Valor M²'
    case 'LENGTH':
      return 'Valor Metro'
    case 'CAPACITY':
      return 'Valor Litro'
    case 'WEIGHT':
      return 'Valor Kg'
    case 'DISTANCE':
      return 'Valor Km'
    case 'DURATION':
      return 'Valor Hora'
    case 'UNITY':
      return 'Custo Unitário'
    default:
      return 'Valor Unidade'
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
      // item.width e item.height estão em milímetros
      // calculateAreaFromMillimeters retorna área em m²
      const areaInSquareMeters = calculateAreaFromMillimeters(
        item.width || 0,
        item.height || 0,
      )
      return areaInSquareMeters * baseMultiplier
    }

    case 'LENGTH': {
      // Converter milímetros para metros
      const lengthInMeters = millimetersToMeters(item.width || item.length || 0)
      return lengthInMeters * baseMultiplier
    }

    case 'CAPACITY':
      return (item.volume || 0) * baseMultiplier

    case 'WEIGHT':
      return (item.weight || 0) * baseMultiplier

    case 'DISTANCE': {
      // Converter metros para quilômetros para o cálculo do valor por km
      const distanceInKilometers = (item.distance || 0) / 1000
      return distanceInKilometers * baseMultiplier
    }

    case 'DURATION': {
      // duration está em segundos, converter para horas
      const durationInHours = (item.duration || 0) / 3600
      return durationInHours * baseMultiplier
    }

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
  width = 'flex-[1_0_140px]',
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

  // Recalcular valor de venda quando quantidade total mudar (mantém valor unitário)
  useEffect(() => {
    const currentUnitCost = getValues(`items.${index}.unitCost`)
    if (totalQuantity > 0 && currentUnitCost > 0) {
      const newSalePriceInCents = Math.round(currentUnitCost * totalQuantity)
      const currentSalePrice = getValues(`items.${index}.salePrice`)

      // Só atualiza se o valor for diferente para evitar loops (tolerância de 1 centavo)
      if (Math.abs(newSalePriceInCents - (currentSalePrice || 0)) > 1) {
        setValue(`items.${index}.salePrice`, newSalePriceInCents, {
          shouldValidate: false,
          shouldDirty: true,
        })
      }
    }
  }, [totalQuantity, setValue, index, getValues])

  // Recalcular custo unitário apenas quando preço de venda mudar manualmente
  useEffect(() => {
    if (totalQuantity > 0 && salePrice > 0) {
      // salePrice está em centavos, calculatedUnitCost deve estar em centavos também
      const calculatedUnitCost = Math.round(salePrice / totalQuantity)
      const currentUnitCost = getValues(`items.${index}.unitCost`)

      // Só atualiza se o valor for diferente para evitar loops (tolerância de 1 centavo)
      if (Math.abs(calculatedUnitCost - (currentUnitCost || 0)) > 1) {
        setValue(`items.${index}.unitCost`, calculatedUnitCost, {
          shouldValidate: false,
          shouldDirty: true,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salePrice, setValue, index, getValues])

  // Não renderizar se não houver unidade
  if (!unitKind) {
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
                const newUnitCostInReais = values.floatValue ?? 0
                // Converter para centavos para manter consistência com FormBrlInput
                const newUnitCostInCents = Math.round(newUnitCostInReais * 100)
                field.onChange(newUnitCostInCents)

                // Calcular novo preço de venda baseado no custo unitário (ambos em centavos)
                if (totalQuantity > 0 && newUnitCostInCents > 0) {
                  const newSalePriceInCents = Math.round(
                    newUnitCostInCents * totalQuantity,
                  )
                  setValue(`items.${index}.salePrice`, newSalePriceInCents, {
                    shouldValidate: false,
                    shouldDirty: true,
                  })
                }

                onHasChanged?.()
              }}
              value={field.value ? (field.value / 100).toString() : ''}
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
