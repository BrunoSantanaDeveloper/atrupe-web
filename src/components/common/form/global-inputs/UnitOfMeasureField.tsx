import { FormSelect } from '../FormSelect'
import type { Path, FieldValues } from 'react-hook-form'
// import { useUnitOfMeasure } from '@/hooks/queries/useUnitOfMeasure'

const options = [
  {
    value: 'LENGTH',
    label: 'Metro Linear (m)',
  },
  {
    value: 'WEIGHT',
    label: 'Peso (kg)',
  },
  {
    value: 'CAPACITY',
    label: 'Litro (l)',
  },
  {
    value: 'DISTANCE',
    label: 'Distância (km)',
  },
  {
    value: 'DURATION',
    label: 'Tempo (h)',
  },
  {
    value: 'UNITY',
    label: 'Unidade (un)',
  },
  {
    value: 'AREA',
    label: 'Metro Quadrado (m²)',
  },
]

interface Props<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  width?: string
  disabled?: boolean
}

export function UnitOfMeasureField<T extends FieldValues>({
  name,
  label = 'Unidade comercial',
  placeholder = label,
  width = 'flex-[1_0_100px]',
  ...props
}: Props<T>) {
  // const { data: unitOfMeasures } = useUnitOfMeasure()

  // const options = useMemo(() => {
  //   return unitOfMeasures?.map((unit) => ({
  //     value: unit.kind,
  //     label: `${unit.code} - ${unit.name}`,
  //   }))
  // }, [unitOfMeasures])

  return (
    <FormSelect<T>
      name={name}
      label={label}
      placeholder={placeholder}
      options={options}
      width={width}
      {...props}
    />
  )
}
