'use client'

// Components
import { CreditLimit } from './limite-de-credito/CreditLimit'
import { CompanySettingsList } from '../components/CompanySettingsList'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Consts
import { FEATURES } from '@/consts/features'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import {
  IconTag,
  IconCoins,
  IconFoldUp,
  IconCalculator,
  IconFileDollar,
  IconBuildingBank,
  IconCreditCardPay,
  IconCalendarDollar,
} from '@tabler/icons-react'

const defaultPath = 'financeiro'

export function FinanceSettingsClient() {
  const { hasFeature, hasFinancialModule } = usePlanFeatures()

  const settings: CompanySettingsType[] = [
    {
      category: 'Financeiro',
      items: [
        {
          title: 'Configuração de Bancos e Contas',
          icon: IconBuildingBank,
          description: 'Cadastre as contas bancárias da sua empresa',
          link: `${defaultPath}/contas-bancarias`,
          permission: 'financial_settings:bank_accounts:view',
          review: 'todo',
        },
        {
          title: 'Configuração de Pagamentos',
          icon: IconCreditCardPay,
          description: 'Cadastre as condições de pagamento da sua empresa',
          link: `${defaultPath}/configuracoes-de-pagamento/condicoes-de-pagamento`,
          permission: 'financial_settings:payment_methods:view',
        },
        {
          title: 'Configuração do Plano de Contas',
          icon: IconCoins,
          description:
            'Defina a relação de códigos e classificações para registrar as movimentações financeiras da empresa',
          link: `${defaultPath}/plano-de-contas`,
          permission: 'financial_settings:chart_accounts:view',
        },
        {
          title: 'Cadastro das Despesas Fixas',
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
                title: 'Configuração do Limite de Crédito',
                icon: IconFoldUp,
                description:
                  'Defina o padrão de limite de crédito para os clientes',
                cta: <CreditLimit />,
                permission: 'financial_settings:credit_limits:edit',
              },
            ]
          : []),
        {
          title: 'Configuração da Folha de Pagamento',
          icon: IconFileDollar,
          description: 'Gerencie os custos por colaborador',
          link: `${defaultPath}/folhas-de-pagamento`,
          permission: ['financial_settings:payroll:view', 'values:values:view'],
        },
        // Recursos do PRO: aparecem só quando o plano tiver a chave
        ...(hasFeature(FEATURES.COSTS.COST_BASE)
          ? [
              {
                title: 'Base de custos',
                icon: IconCalculator,
                description:
                  'Forme o custo mensal de referência da empresa e veja quanto custa cada setor',
                link: '/base-de-custos',
                permission: ['cost:base:view', 'values:values:view'],
              },
            ]
          : []),
        ...(hasFeature(FEATURES.COSTS.PRICING_CENTER)
          ? [
              {
                title: 'Precificação',
                icon: IconTag,
                description:
                  'Reúna o preço de mão de obra, máquinas, materiais e produtos num lugar só',
                link: '/precificacao',
                permission: ['cost:pricing:view', 'values:values:view'],
              },
            ]
          : []),
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
