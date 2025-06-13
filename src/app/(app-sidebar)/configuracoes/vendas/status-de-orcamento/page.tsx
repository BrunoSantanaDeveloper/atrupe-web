// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Status de Orçamento',
  }
}

export default function Page() {
  return (
    <PermissionGate
      permissions={['sales_settings:quotation_status:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os status de orçamento.
        </div>
      }
    >
      <Main />
    </PermissionGate>
  )
}
