// Components
import { CreditLimit } from './limite-de-credito/CreditLimit'
import { PermissionGate } from '@/components/common/PermissionGate'
import { CompanySettingsList } from '../components/CompanySettingsList'

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

export function metadata() {
  return {
    title: 'Configurações de Financeiro',
  }
}

const defaultPath = 'financeiro'

const settings: CompanySettingsType[] = [
  {
    category: 'Financeiro',
    items: [
      {
        title: 'Bancos e contas',
        icon: IconBuildingBank,
        description: 'Cadastre as contas bancárias da sua empresa',
        link: `${defaultPath}/contas-bancarias`,
      },
      {
        title: 'Configurações de pagamento',
        icon: IconCreditCardPay,
        description:
          'Cadastre as formas e condições de pagamento da sua empresa',
        link: `${defaultPath}/configuracoes-de-pagamento/condicoes-de-pagamento`,
      },
      {
        title: 'Plano de contas',
        icon: IconCoins,
        description:
          'Defina a relação de códigos e classificações para registrar as movimentações financeiras da empresa',
        link: `${defaultPath}/plano-de-contas`,
      },
      {
        title: 'Despesas fixas',
        icon: IconCalendarDollar,
        description:
          'Cadastre as despesas regulares de acordo com a sua recorrência',
        link: `${defaultPath}/config-despesas-fixas`,
      },
      {
        title: 'Limite de crédito',
        icon: IconFoldUp,
        description: 'Defina o padrão de limite de crédito para os clientes',
        cta: <CreditLimit />,
      },
      {
        title: 'Folha de pagamento',
        icon: IconFileDollar,
        description: 'Gerencie os custos por colaborador',
        link: `${defaultPath}/folhas-de-pagamento`,
      },
    ],
  },
]

export default function FinanceSettings() {
  return (
    <PermissionGate permissions={['financial_settings:view']}>
      <CompanySettingsList settings={settings} />
    </PermissionGate>
  )
}
