// Components
import { ImportSettingsClient } from './components/ImportSettingsClient'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Importações',
  }
}

export default function ImportSettings() {
  return (
    <PermissionGate
      permissions={[
        'import_settings:clients:view',
        'import_settings:suppliers:view',
        'import_settings:products:view',
        'import_settings:quotations:view',
        'import_settings:financial:view',
      ]}
      requireAll={false}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de importação.
        </div>
      }
    >
      <ImportSettingsClient />
    </PermissionGate>
  )
}
