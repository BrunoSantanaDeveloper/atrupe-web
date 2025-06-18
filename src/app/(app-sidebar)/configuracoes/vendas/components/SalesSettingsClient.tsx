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
} from '@tabler/icons-react'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

const defaultPath = 'vendas'

export function SalesSettingsClient() {
  const { getRejectionReasonsType, getBudgetStatusType } = usePlanFeatures()

  const allSettings: CompanySettingsType[] = [
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
        ...(getRejectionReasonsType() === 'full'
          ? [
              {
                title: 'Motivos de rejeição e cancelamento',
                icon: IconAlertSquareRounded,
                description:
                  'Defina motivos para mapear rejeições e cancelamentos.',
                link: `${defaultPath}/motivos-de-rejeicao-e-cancelamento`,
              },
            ]
          : []),
        ...(getBudgetStatusType() === 'full'
          ? [
              {
                title: 'Status de orçamento',
                icon: IconStatusChange,
                description: 'Defina status para acompanhamento das propostas.',
                link: `${defaultPath}/status-de-orcamento`,
              },
            ]
          : []),
      ],
    },
  ]

  return <CompanySettingsList settings={allSettings} />
}
