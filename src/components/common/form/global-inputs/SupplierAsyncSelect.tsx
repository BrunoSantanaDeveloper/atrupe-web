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
 * Componente especializado para seleção de fornecedores
 * Utiliza o componente genérico FormAsyncSelect com configurações específicas para fornecedores
 */
export function SupplierSelector({
  name,
  label,
  width,
  placeholder = 'Selecione um fornecedor',
  additionalOnChange,
}: Props) {
  return (
    <FormAsyncSelect
      name={name}
      label={label}
      width={width}
      placeholder={placeholder}
      route="/supplier"
      icon={User}
      minChars={3}
      emptyMessage="Nenhum fornecedor encontrado"
      loadingMessage="Buscando fornecedores..."
      additionalOnChange={additionalOnChange}
    />
  )
}
