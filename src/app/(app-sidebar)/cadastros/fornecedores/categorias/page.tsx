import { Categories } from '../../components/Categories'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return { title: 'Grupos de fornecedores' }
}

export default function SupplierCategoriesPage() {
  return (
    <PermissionGate
      permissions={['register:supplier_categories:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os grupos de fornecedores.
        </div>
      }
    >
      <Categories context="supplier" />
    </PermissionGate>
  )
}
