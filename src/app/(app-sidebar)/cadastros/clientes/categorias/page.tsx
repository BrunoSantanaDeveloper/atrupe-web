import { Categories } from '../../components/Categories'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return { title: 'Grupos de clientes' }
}

export default function ClientCategoriesPage() {
  return (
    <PermissionGate
      permissions={['register:client:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os grupos de clientes.
        </div>
      }
    >
      <Categories context="client" />
    </PermissionGate>
  )
}
