// Component Imports
import { ProductsGroup } from './components/ProductsGroup'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { SearchParamsType } from '@/types/coreTypes'

export default function ProductsGroupPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:materials_products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os grupos de produtos.
        </div>
      }
    >
      <ProductsGroup searchParams={searchParams} />
    </PermissionGate>
  )
}
