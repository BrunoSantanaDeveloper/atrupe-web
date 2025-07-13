// Type Imports
import { type Control, type FieldValues, type Path } from 'react-hook-form'

// UI component Imports
import { LinearMeter } from '@/components/common/form/global-inputs/products/LinearMeter'
import { SquareMeters } from '@/components/common/form/global-inputs/products/SquareMeters'
import { useUnitOfMeasure } from '@/hooks/queries/useUnitOfMeasure'
import { Liters } from './Liters'
import { Kilometers } from './Kilometers'
import { Hour } from './Hour'
import { Weight } from './weight'

interface MeasurementInputProps<T extends FieldValues>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  control: Control<T>
  index: number
  unitKind: string
  unitOfMeasureId?: string
  onHasChanged?: () => void
}

export function MeasurementInput<T extends FieldValues>({
  control,
  index,
  unitOfMeasureId,
  unitKind,
  onHasChanged,
  ...props
}: MeasurementInputProps<T>) {
  const { data: unitOfMeasure } = useUnitOfMeasure()
  const unitCode = unitOfMeasure?.find(
    (unit) => unit.id === unitOfMeasureId,
  )?.code

  const commonProps = {
    control,
    width: 'flex-[1_0_130px]',
  }

  console.log(unitCode)

  const renderComponent = () => {
    switch (unitKind) {
      case 'AREA':
        return (
          <SquareMeters<T>
            {...commonProps}
            {...props}
            name={`items.${index}.area` as Path<T>}
            label="Área Total"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'LENGTH':
        return (
          <LinearMeter<T>
            {...commonProps}
            {...props}
            name={`items.${index}.width` as Path<T>}
            label="Medida"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'CAPACITY':
        return (
          <Liters<T>
            {...commonProps}
            {...props}
            name={`items.${index}.volume` as Path<T>}
            label="Volume"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'WEIGHT':
        return (
          <Weight<T>
            {...commonProps}
            {...props}
            name={`items.${index}.weight` as Path<T>}
            label="Peso"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'DISTANCE':
        return (
          <Kilometers<T>
            {...commonProps}
            {...props}
            name={`items.${index}.distance` as Path<T>}
            label="Distância"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'DURATION':
        return (
          <Hour<T>
            {...commonProps}
            {...props}
            name={`items.${index}.duration` as Path<T>}
            label="Duração"
            placeholder="00:00"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
          />
        )
      case 'UNITY':
      default:
        return null
    }
  }
  return renderComponent()
}
