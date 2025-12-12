// Component Imports
import { Products } from './components/Products'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Configurações de Produtos',
  }
}

export default function ProductsPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de produtos.
        </div>
      }
    >
      <Products searchParams={searchParams} />
    </PermissionGate>
  )
}
