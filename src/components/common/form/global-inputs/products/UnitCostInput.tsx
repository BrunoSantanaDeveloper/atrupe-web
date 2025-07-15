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

// Função para obter o label baseado na unidade visual (amigável para o usuário)
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

// Função para converter valor unitário visual para valor por unidade bruta (mantendo em centavos)
function convertUnitCostToRaw(
  unitKind: string,
  visualUnitCostInCents: number,
): number {
  switch (unitKind) {
    case 'AREA':
      // R$/m² → R$/mm² (dividir por 1.000.000)
      return Math.round(visualUnitCostInCents / 1_000_000)
    case 'LENGTH':
      // R$/metro → R$/mm (dividir por 1.000)
      return Math.round(visualUnitCostInCents / 1000)
    case 'CAPACITY':
      // R$/litro → R$/ml (dividir por 1.000)
      return Math.round(visualUnitCostInCents / 1000)
    case 'WEIGHT':
      // R$/kg → R$/mg (dividir por 1.000.000)
      return Math.round(visualUnitCostInCents / 1_000_000)
    case 'DISTANCE':
      // R$/km → R$/metro (dividir por 1.000)
      return Math.round(visualUnitCostInCents / 1000)
    case 'DURATION':
      // R$/hora → R$/segundo (dividir por 3.600)
      return Math.round(visualUnitCostInCents / 3600)
    case 'UNITY':
    default:
      return visualUnitCostInCents
  }
}

// Função para converter valor por unidade bruta para valor unitário visual (mantendo em centavos)
function convertRawToUnitCost(
  unitKind: string,
  rawUnitCostInCents: number,
): number {
  switch (unitKind) {
    case 'AREA':
      // R$/mm² → R$/m² (multiplicar por 1.000.000)
      return rawUnitCostInCents * 1_000_000
    case 'LENGTH':
      // R$/mm → R$/metro (multiplicar por 1.000)
      return rawUnitCostInCents * 1000
    case 'CAPACITY':
      // R$/ml → R$/litro (multiplicar por 1.000)
      return rawUnitCostInCents * 1000
    case 'WEIGHT':
      // R$/mg → R$/kg (multiplicar por 1.000.000)
      return rawUnitCostInCents * 1_000_000
    case 'DISTANCE':
      // R$/metro → R$/km (multiplicar por 1.000)
      return rawUnitCostInCents * 1000
    case 'DURATION':
      // R$/segundo → R$/hora (multiplicar por 3.600)
      return rawUnitCostInCents * 3600
    case 'UNITY':
    default:
      return rawUnitCostInCents
  }
}

// Função para calcular a quantidade total baseada na unidade (usando valores brutos)
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
      // Calcular diretamente em mm² (valores brutos)
      const areaInSquareMillimeters = (item.width || 0) * (item.height || 0)
      return areaInSquareMillimeters * baseMultiplier
    }

    case 'LENGTH': {
      // Usar comprimento em mm (valor bruto)
      return (item.length || 0) * baseMultiplier
    }

    case 'CAPACITY':
      // Usar volume em ml (valor bruto)
      return (item.volume || 0) * baseMultiplier

    case 'WEIGHT':
      // Usar peso em mg (valor bruto)
      return (item.weight || 0) * baseMultiplier

    case 'DISTANCE': {
      // Usar distância em metros (valor bruto)
      return (item.distance || 0) * baseMultiplier
    }

    case 'DURATION': {
      // Usar duração em segundos (valor bruto)
      return (item.duration || 0) * baseMultiplier
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

  // Recalcular valor de venda quando quantidade total mudar (mantém valor unitário bruto)
  useEffect(() => {
    const currentRawUnitCost = getValues(`items.${index}.unitCost`)
    if (totalQuantity > 0 && currentRawUnitCost > 0) {
      const newSalePriceInCents = Math.round(currentRawUnitCost * totalQuantity)
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
      // salePrice está em centavos, calculatedRawUnitCost deve estar em centavos também
      const calculatedRawUnitCost = Math.round(salePrice / totalQuantity)
      const currentUnitCost = getValues(`items.${index}.unitCost`)

      // Só atualiza se o valor for diferente para evitar loops (tolerância de 1 centavo)
      if (Math.abs(calculatedRawUnitCost - (currentUnitCost || 0)) > 1) {
        setValue(`items.${index}.unitCost`, calculatedRawUnitCost, {
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
                const visualUnitCostInReais = values.floatValue ?? 0
                // Converter reais para centavos (como FormBrlInput)
                const visualUnitCostInCents = Math.round(
                  visualUnitCostInReais * 100,
                )
                // Converter valor visual para valor por unidade bruta (já em centavos)
                const rawUnitCostInCents = convertUnitCostToRaw(
                  unitKind,
                  visualUnitCostInCents,
                )
                field.onChange(rawUnitCostInCents)

                // Calcular novo preço de venda baseado no custo unitário bruto (ambos em centavos)
                if (totalQuantity > 0 && rawUnitCostInCents > 0) {
                  const newSalePriceInCents = Math.round(
                    rawUnitCostInCents * totalQuantity,
                  )
                  setValue(`items.${index}.salePrice`, newSalePriceInCents, {
                    shouldValidate: false,
                    shouldDirty: true,
                  })
                }

                onHasChanged?.()
              }}
              value={
                field.value
                  ? (
                      convertRawToUnitCost(unitKind, field.value) / 100
                    ).toString()
                  : ''
              }
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
