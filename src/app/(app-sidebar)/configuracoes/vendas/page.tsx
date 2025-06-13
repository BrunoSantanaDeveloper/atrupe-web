// Component Imports
import { CompanySettingsList } from '../components/CompanySettingsList'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type Imports
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icon Imports
import {
  IconUserCircle,
  IconStatusChange,
  IconTransactionDollar,
  IconAlertSquareRounded,
} from '@tabler/icons-react'

const defaultPath = 'vendas'

export function metadata() {
  return {
    title: 'Configurações de Vendas',
  }
}

const settings: CompanySettingsType[] = [
  {
    category: 'Vendas',
    items: [
      {
        title: 'Séries de venda',
        icon: IconTransactionDollar,
        description: 'Defina os padrões básicos de vendas.',
        link: `${defaultPath}/series-de-venda`,
      },
      {
        title: 'Perfil de vendedor',
        icon: IconUserCircle,
        description: 'Gerencie os vendedores, suas comissões e permissões.',
        link: `${defaultPath}/perfil-de-vendedor`,
      },
      {
        title: 'Motivos de rejeição e cancelamento',
        icon: IconAlertSquareRounded,
        description: 'Defina motivos para mapear rejeições e cancelamentos.',
        link: `${defaultPath}/motivos-de-rejeicao-e-cancelamento`,
      },
      {
        title: 'Status de orçamento',
        icon: IconStatusChange,
        description: 'Defina status para acompanhamento das propostas.',
        link: `${defaultPath}/status-de-orcamento`,
      },
    ],
  },
]

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
      <CompanySettingsList settings={settings} />
    </PermissionGate>
  )
}
