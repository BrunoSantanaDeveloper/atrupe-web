// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Séries de venda',
  }
}

export default function Page() {
  return (
    <PermissionGate
      permissions={['sales_settings:series:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as séries de venda.
        </div>
      }
    >
      <Main />
    </PermissionGate>
  )
}
