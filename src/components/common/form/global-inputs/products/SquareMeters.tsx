// UI component Imports
import {
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Lib Imports
import { cn, calculateAreaFromMillimeters } from '@/lib/utils'
import { HTMLInputTypeAttribute } from 'react'

// Type Imports
import {
  type Path,
  type Control,
  type FieldValues,
  useFormContext,
} from 'react-hook-form'

// Third-party Imports
import { NumericFormat } from 'react-number-format'
import { LinearMeter } from './LinearMeter'

interface Props<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  type?: HTMLInputTypeAttribute | undefined
  className?: string
  index?: number
  onHasChanged?: () => void
}

export function SquareMeters<T extends FieldValues>({
  name,
  label,
  control,
  placeholder = label,
  width = 'flex-[1_0_100px]',
  className,
  index = 0,
  onHasChanged,
  ...props
}: Props<T>) {
  const { watch } = useFormContext()

  // Calcular valores de largura e altura (em milímetros do banco)
  const widthValue = watch(`items[${index}].width`) ?? 0
  const heightValue = watch(`items[${index}].height`) ?? 0
  const quantity = watch(`items[${index}].quantity`) ?? 1
  const productQuantity = watch('quantity') ?? 1
  const items = watch('items') ?? []

  // Para produto simples (apenas 1 item): multiplicar apenas pela quantidade
  // Para produto composto (múltiplos itens): multiplicar por ambas as quantidades
  const isSimpleProduct = items.length === 1

  // Calcular área em metros quadrados a partir dos milímetros do banco
  const areaInSquareMeters = calculateAreaFromMillimeters(
    widthValue,
    heightValue,
  )
  const totalArea = isSimpleProduct
    ? areaInSquareMeters * quantity
    : areaInSquareMeters * quantity * productQuantity

  // Subcomponente para campo de número com rótulo
  const renderLinearMeter = (fieldName: string, label: string) => (
    <LinearMeter<T>
      control={control}
      name={fieldName as Path<T>}
      label={label}
      width="flex-[1_0_100px]"
      onHasChanged={onHasChanged}
      {...props}
    />
  )

  return (
    <>
      {renderLinearMeter(`items[${index}].width`, 'Largura')}
      {renderLinearMeter(`items[${index}].height`, 'Altura')}
      <FormField
        control={control}
        name={name}
        render={() => (
          <NumericFormat
            allowedDecimalSeparators={['.', ',']}
            customInput={() => (
              <FormItem className={cn('flex flex-col', width)}>
                {label && <FormLabel>{label}</FormLabel>}
                <FormControl>
                  <Input
                    disabled
                    placeholder={placeholder || label}
                    value={totalArea ? `${totalArea.toFixed(3)} M²` : ''}
                    className={className}
                    onChange={onHasChanged}
                    inputMode="decimal"
                    {...props}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      />
    </>
  )
}
