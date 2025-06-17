// Component Imports
import { PermissionGate } from '@/components/common/PermissionGate'
import { SalesSettingsClient } from './components/SalesSettingsClient'

export function metadata() {
  return {
    title: 'Configurações de Vendas',
  }
}

export default function SalesSettings() {
  return (
    <PermissionGate
      permissions={[
        'sales_settings:series:view',
        'sales_settings:seller_profile:view',
        'sales_settings:rejection_reasons:view',
        'sales_settings:quotation_status:view',
      ]}
      requireAll={false}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de vendas.
        </div>
      }
    >
      <SalesSettingsClient />
    </PermissionGate>
  )
}
