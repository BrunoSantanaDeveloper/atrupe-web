// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { FinanceSettingsClient } from './FinanceSettingsClient'

export function metadata() {
  return {
    title: 'Configurações de Financeiro',
  }
}

export default function FinanceSettings() {
  return (
    <PermissionGate permissions={['financial_settings:view']}>
      <FinanceSettingsClient />
    </PermissionGate>
  )
}
