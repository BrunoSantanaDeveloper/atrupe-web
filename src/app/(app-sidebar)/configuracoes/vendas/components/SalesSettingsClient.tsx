'use client'

// Component Imports
import { CompanySettingsList } from '../../components/CompanySettingsList'

// Type Imports
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// Icon Imports
import {
  IconUserCircle,
  IconStatusChange,
  IconTransactionDollar,
  IconAlertSquareRounded,
  IconRoute,
} from '@tabler/icons-react'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

const defaultPath = 'vendas'

export function SalesSettingsClient() {
  const { canManageRejectionReasons, canManageBudgetStatus } = usePlanFeatures()

  const allSettings: CompanySettingsType[] = [
    {
      category: 'Vendas',
      items: [
        {
          title: 'Séries de venda',
          icon: IconTransactionDollar,
          description: 'Defina os padrões básicos de vendas.',
          link: `${defaultPath}/series-de-venda`,
          permission: 'sales_settings:series:view',
        },
        {
          title: 'Origens de contato',
          icon: IconRoute,
          description: 'Gerencie as origens de onde seus clientes chegam.',
          link: `${defaultPath}/origens-de-contato`,
        },
        {
          title: 'Perfil de vendedor',
          icon: IconUserCircle,
          description: 'Gerencie os vendedores, suas comissões e permissões.',
          link: `${defaultPath}/perfil-de-vendedor`,
          permission: 'sales_settings:seller_profile:view',
        },
        ...(canManageRejectionReasons()
          ? [
              {
                title: 'Motivos de rejeição e cancelamento',
                icon: IconAlertSquareRounded,
                description:
                  'Defina motivos para mapear rejeições e cancelamentos.',
                link: `${defaultPath}/motivos-de-rejeicao-e-cancelamento`,
                permission: 'sales_settings:rejection_reasons:view',
              },
            ]
          : []),
        ...(canManageBudgetStatus()
          ? [
              {
                title: 'Status de orçamento',
                icon: IconStatusChange,
                description: 'Defina status para acompanhamento das propostas.',
                link: `${defaultPath}/status-de-orcamento`,
                permission: 'sales_settings:quotation_status:view',
              },
            ]
          : []),
      ],
    },
  ]

  return <CompanySettingsList settings={allSettings} />
}
