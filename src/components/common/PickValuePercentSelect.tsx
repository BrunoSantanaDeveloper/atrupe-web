import { FormSelect } from './form/FormSelect'

export function PickValuePercentSelect({
  name = 'discountType',
  onChange,
}: {
  name?: string
  onChange?: (value: string) => void
}) {
  return (
    <FormSelect
      name={name}
      options={[
        { value: 'VALUE', label: 'R$' },
        { value: 'PERCENT', label: '%' },
      ]}
      width="w-[60px]"
      className="border-0 -ml-3.5 pr-1 text-gray-900"
      additionalOnChange={onChange}
    />
  )
}
