'use client'

// Components
import { CreditLimit } from './limite-de-credito/CreditLimit'
import { CompanySettingsList } from '../components/CompanySettingsList'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import {
  IconCoins,
  IconFoldUp,
  IconFileDollar,
  IconBuildingBank,
  IconCreditCardPay,
  IconCalendarDollar,
} from '@tabler/icons-react'

const defaultPath = 'financeiro'

export function FinanceSettingsClient() {
  const { hasFinancialModule } = usePlanFeatures()

  const settings: CompanySettingsType[] = [
    {
      category: 'Financeiro',
      items: [
        {
          title: 'Bancos e contas',
          icon: IconBuildingBank,
          description: 'Cadastre as contas bancárias da sua empresa',
          link: `${defaultPath}/contas-bancarias`,
          permission: 'financial_settings:bank_accounts:view',
          review: 'todo',
        },
        {
          title: 'Pagamentos',
          icon: IconCreditCardPay,
          description: 'Cadastre as condições de pagamento da sua empresa',
          link: `${defaultPath}/configuracoes-de-pagamento/condicoes-de-pagamento`,
          permission: 'financial_settings:payment_methods:view',
        },
        {
          title: 'Plano de contas',
          icon: IconCoins,
          description:
            'Defina a relação de códigos e classificações para registrar as movimentações financeiras da empresa',
          link: `${defaultPath}/plano-de-contas`,
          permission: 'financial_settings:chart_accounts:view',
        },
        {
          title: 'Despesas fixas',
          icon: IconCalendarDollar,
          description:
            'Cadastre as despesas regulares de acordo com a sua recorrência',
          link: `${defaultPath}/config-despesas-fixas`,
          permission: [
            'financial_settings:fixed_expenses:view',
            'values:values:view',
          ],
        },
        // Mostra limite de crédito apenas se o plano permitir
        ...(hasFinancialModule('credit_limit')
          ? [
              {
                title: 'Limite de crédito',
                icon: IconFoldUp,
                description:
                  'Defina o padrão de limite de crédito para os clientes',
                cta: <CreditLimit />,
                permission: 'financial_settings:credit_limits:edit',
              },
            ]
          : []),
        {
          title: 'Folha de pagamento',
          icon: IconFileDollar,
          description: 'Gerencie os custos por colaborador',
          link: `${defaultPath}/folhas-de-pagamento`,
          permission: ['financial_settings:payroll:view', 'values:values:view'],
        },
        // Base de custos e Precificação saíram daqui em 24/09/2026: elas têm
        // menu próprio, "Custos e preços". Não são configuração — é onde a
        // empresa descobre quanto custa e decide por quanto vende, trabalho
        // de uso frequente. Mantê-las nos dois lugares dividia a entrada e
        // sugeria que fossem ajuste de sistema
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
