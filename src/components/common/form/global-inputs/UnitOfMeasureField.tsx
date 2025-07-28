import { FormSelect } from '../FormSelect'
import type { Path, FieldValues } from 'react-hook-form'
// import { useUnitOfMeasure } from '@/hooks/queries/useUnitOfMeasure'

const options = [
  {
    value: 'LENGTH',
    label: 'Comprimento',
  },
  {
    value: 'WEIGHT',
    label: 'Peso',
  },
  {
    value: 'CAPACITY',
    label: 'Volume',
  },
  {
    value: 'DISTANCE',
    label: 'Distância',
  },
  {
    value: 'DURATION',
    label: 'Duração',
  },
  {
    value: 'UNITY',
    label: 'Unidade',
  },
  {
    value: 'AREA',
    label: 'Área',
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
