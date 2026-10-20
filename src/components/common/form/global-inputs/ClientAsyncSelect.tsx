'use client'

import { IconUser as User } from '@tabler/icons-react'
import { FormAsyncSelect } from '@/components/common/form/FormAsyncSelect'

interface Props {
  name: string
  label: string
  placeholder?: string
  width?: string
  value?: string
  additionalOnChange?: (value: string) => void
}

/**
 * Componente especializado para seleção de clientes
 * Utiliza o componente genérico FormAsyncSelect com configurações específicas para clientes
 */
export function ClientSelector({
  name,
  label,
  width,
  placeholder = 'Selecione um cliente',
  additionalOnChange,
}: Props) {
  return (
    <FormAsyncSelect
      name={name}
      label={label}
      width={width}
      placeholder={placeholder}
      route="/client"
      icon={User}
      minChars={1}
      emptyMessage="Nenhum cliente encontrado"
      loadingMessage="Buscando clientes..."
      additionalOnChange={additionalOnChange}
    />
  )
}
