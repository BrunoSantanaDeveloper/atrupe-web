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
    <PermissionGate
      permissions={[
        'financial_settings:bank_accounts:view',
        'financial_settings:payment_methods:view',
        'financial_settings:chart_accounts:view',
        'financial_settings:fixed_expenses:view',
        'financial_settings:credit_limits:view',
        'financial_settings:payroll:view',
      ]}
      requireAll={false}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações do financeiro.
        </div>
      }
    >
      <FinanceSettingsClient />
    </PermissionGate>
  )
}
