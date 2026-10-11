// Components
import { CompanySettingsClient } from './components/CompanySettingsClient'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Configurações da empresa e do sistema',
  }
}

export default function CompanySystemSettings() {
  return (
    <PermissionGate
      permissions={[
        'company_settings:company:view',
        'company_settings:sectors:view',
        'company_settings:measurement_standards:view',
        'company_settings:users:view',
        'company_settings:roles:view',
      ]}
      requireAll={false}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações da empresa.
        </div>
      }
    >
      <CompanySettingsClient />
    </PermissionGate>
  )
}
