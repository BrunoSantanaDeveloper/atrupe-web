import { FormSelect } from '@/components/common/form/FormSelect'
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'

interface Props {
  name: string
  label: string
  width?: string
  clientId: string
  placeholder?: string
  disabled?: boolean
}

export function ClientAddressSelectField({
  name,
  label,
  width = 'w-full',
  clientId,
  placeholder,
  disabled = false,
}: Props) {
  const { data: addresses, isLoading } = useClientAddresses({ clientId })

  const options =
    addresses?.map((address) => ({
      value: address.id,
      label: `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}`,
    })) || []

  const isEmpty = !isLoading && options.length === 0

  const newPlaceholder = isLoading
    ? 'Carregando endereços...'
    : isEmpty
      ? 'Nenhum endereço para o cliente'
      : placeholder || 'Selecione um endereço'

  return (
    <FormSelect
      name={name}
      label={label}
      options={options}
      width={width}
      placeholder={newPlaceholder}
      disabled={disabled || isLoading}
    />
  )
}
