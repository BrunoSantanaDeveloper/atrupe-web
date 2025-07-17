// Component Imports
import { Suppliers } from './components/Suppliers'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Fornecedores',
  }
}

export default function SuppliersPage({ searchParams }: SearchParamsType) {
  const defaultTab = 'ativos'
  const status = searchParams.status || defaultTab

  return (
    <PermissionGate
      permissions={['register:supplier:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a página de fornecedores.
        </div>
      }
    >
      <Suppliers searchParams={{ ...searchParams, status }} />
    </PermissionGate>
  )
}
