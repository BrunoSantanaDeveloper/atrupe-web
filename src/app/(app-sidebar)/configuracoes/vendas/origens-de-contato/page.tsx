// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Origens de contato',
  }
}

export default function Page() {
  return (
    <PermissionGate
      permissions={['sales_settings:contact_sources:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para ver as origens de contato.
        </div>
      }
    >
      <Main />
    </PermissionGate>
  )
}
