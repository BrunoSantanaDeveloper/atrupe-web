// Type Imports
import { type Control, type FieldValues, type Path } from 'react-hook-form'

// UI component Imports
import { LinearMeter } from '@/components/common/form/global-inputs/products/LinearMeter'
import { SquareMeters } from '@/components/common/form/global-inputs/products/SquareMeters'
import { useUnitOfMeasure } from '@/hooks/queries/useUnitOfMeasure'
import { useCompanyUnitDefaults } from '@/hooks/queries/useUnitOfMeasureDefaults'
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
  const { data: companyDefaults } = useCompanyUnitDefaults()
  const unitCode = unitOfMeasure?.find(
    (unit) => unit.id === unitOfMeasureId,
  )?.code

  const commonProps = {
    control,
    width: 'flex-[1_0_130px]',
  }

  if (unitCode === 'TESTE') {
    return null
  }

  // Função para mapear códigos para abreviações
  const getUnitAbbreviation = (code: string) => {
    const unitMap: Record<string, string> = {
      // Length
      MM: 'mm',
      CM: 'cm',
      MT: 'm',
      // Weight
      MG: 'mg',
      GR: 'g',
      KG: 'kg',
      // Capacity
      ML: 'ml',
      LT: 'l',
    }
    return unitMap[code] || code
  }

  const renderComponent = () => {
    switch (unitKind) {
      case 'AREA':
        return (
          <SquareMeters<T>
            {...commonProps}
            {...props}
            index={index}
            name={`items.${index}.area` as Path<T>}
            label="Área total"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
            defaultUnit={companyDefaults?.LENGTH}
            getUnitAbbreviation={getUnitAbbreviation}
          />
        )
      case 'LENGTH':
        return (
          <LinearMeter<T>
            {...commonProps}
            {...props}
            name={`items.${index}.length` as Path<T>}
            label="Medida"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
            defaultUnit={companyDefaults?.LENGTH}
            getUnitAbbreviation={getUnitAbbreviation}
          />
        )
      case 'CAPACITY':
        return (
          <Liters<T>
            {...commonProps}
            {...props}
            name={`items.${index}.volume` as Path<T>}
            label="Quantidade"
            placeholder="Digite aqui"
            width={commonProps.width as string}
            onHasChanged={onHasChanged}
            defaultUnit={companyDefaults?.CAPACITY}
            getUnitAbbreviation={getUnitAbbreviation}
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
            defaultUnit={companyDefaults?.WEIGHT}
            getUnitAbbreviation={getUnitAbbreviation}
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
            label="Tempo"
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
