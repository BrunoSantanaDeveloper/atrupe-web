'use client'

import { UserRound } from 'lucide-react'
import {
  FormAsyncSelect,
  EntityBase,
} from '@/components/common/form/FormAsyncSelect'

// Tipo específico para funcionários
interface Employee extends EntityBase {
  department: string
  position: string
}

interface Props {
  name: string
  label: string
  placeholder?: string
  width?: string
  value?: string
  additionalOnChange?: (value: string) => void
  showDepartment?: boolean
}

/**
 * Componente especializado para seleção de funcionários
 * Utiliza o componente genérico FormAsyncSelect com configurações específicas para funcionários
 * Inclui mapeamento personalizado para exibir o departamento junto ao nome
 */
export function EmployeeSelector({
  name,
  label,
  width,
  placeholder = 'Selecione um funcionário',
  additionalOnChange,
  showDepartment = true,
}: Props) {
  return (
    <FormAsyncSelect<Employee>
      name={name}
      label={label}
      width={width}
      placeholder={placeholder}
      route="/employee"
      icon={UserRound}
      minChars={2}
      emptyMessage="Nenhum funcionário encontrado"
      loadingMessage="Buscando funcionários..."
      additionalOnChange={additionalOnChange}
      // Mapeamento personalizado para incluir o departamento no label
      mapFunction={
        showDepartment
          ? (employee) => ({
              value: employee.id,
              label: `${employee.name} (${employee.department})`,
              department: employee.department,
              position: employee.position,
            })
          : undefined
      }
    />
  )
}
