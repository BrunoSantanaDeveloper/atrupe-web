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
          title: 'Configuração de Bancos e Contas',
          icon: IconBuildingBank,
          description: 'Cadastre as contas bancárias da sua empresa',
          link: `${defaultPath}/contas-bancarias`,
        },
        {
          title: 'Configuração de Pagamentos',
          icon: IconCreditCardPay,
          description: 'Cadastre as condições de pagamento da sua empresa',
          link: `${defaultPath}/configuracoes-de-pagamento/condicoes-de-pagamento`,
        },
        {
          title: 'Configuração do Plano de Contas',
          icon: IconCoins,
          description:
            'Defina a relação de códigos e classificações para registrar as movimentações financeiras da empresa',
          link: `${defaultPath}/plano-de-contas`,
        },
        {
          title: 'Cadastro das Despesas Fixas',
          icon: IconCalendarDollar,
          description:
            'Cadastre as despesas regulares de acordo com a sua recorrência',
          link: `${defaultPath}/config-despesas-fixas`,
        },
        // Mostra limite de crédito apenas se o plano permitir
        ...(hasFinancialModule('credit_limit')
          ? [
              {
                title: 'Configuração do Limite de Crédito',
                icon: IconFoldUp,
                description:
                  'Defina o padrão de limite de crédito para os clientes',
                cta: <CreditLimit />,
              },
            ]
          : []),
        {
          title: 'Configuração da Folha de Pagamento',
          icon: IconFileDollar,
          description: 'Gerencie os custos por colaborador',
          link: `${defaultPath}/folhas-de-pagamento`,
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
