import {
  IconCoin,
  IconNews,
  IconBook,
  IconCoins,
  IconUsers,
  IconBoxSeam,
  IconBuilding,
  IconSettings,
  IconBrandAsana,
  IconCalculator,
  IconListSearch,
  IconTrendingUp,
  IconAddressBook,
  IconReportMoney,
  IconTrendingDown,
  IconBusinessplan,
  IconTruckLoading,
  IconRefreshAlert,
  IconProgressAlert,
  IconArrowsExchange,
  IconCalendarDollar,
  IconBuildingCommunity,
  IconDeviceDesktopDollar,
} from '@tabler/icons-react'
import {
  IconAtrupeLogo,
  // IconReceitaFederal,
} from '@/assets/icons/CustomIcons'
import type { SVGProps } from 'react'
import type { IconProps } from '@tabler/icons-react'

interface MainNavigationType {
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  iconColor?: string
  title: string // ** "Clientes"
  path?: string // ** "cadastros/clientes"
  query?: string // ** "?status=ACTIVE&page=1"
  counter?: number // ** 3
  action?: boolean
  permission?: string // Nova propriedade para permissões
  children?: MainNavigationType[] // ** Sub-itens de menu
}

export type SecondaryNavigationType = {
  title: string
  parentPath: string
  items: {
    icon?:
      | React.ComponentType<IconProps>
      | React.ComponentType<SVGProps<SVGSVGElement>>
    title: string
    path: string
  }[]
}

export const defaultMainNavigation: MainNavigationType[] = [
  {
    icon: IconCoin,
    title: 'Vendas',
    path: '/vendas',
    children: [
      {
        icon: IconReportMoney,
        title: 'Orçamentos',
        path: '/vendas/orcamentos',
        permission: 'sale:quotation:view',
      },
      {
        icon: IconNews,
        title: 'Ordens de Serviço',
        path: '/vendas/ordens-de-servico',
        permission: 'sale:order:view',
      },
      // {
      //   icon: IconSquareRoundedPlusFilled,
      //   title: 'Nova venda rápida',
      //   path: '#',
      //   action: true,
      //   permission: 'sale:quick:view',
      // },
    ],
  },
  {
    icon: IconCalculator,
    title: 'Financeiro',
    path: '/financeiro',
    children: [
      {
        icon: IconTrendingUp,
        title: 'A receber',
        path: '/financeiro/a-receber',
        permission: 'financial:receivable:view',
      },
      {
        icon: IconTrendingDown,
        title: 'A pagar',
        path: '/financeiro/a-pagar',
        permission: 'financial:payable:view',
      },
      {
        icon: IconArrowsExchange,
        title: 'Fluxo financeiro',
        path: '/financeiro/fluxo-financeiro',
        permission: 'financial:flow:view',
      },
      {
        icon: IconCoins,
        title: 'Controle de caixa',
        path: '/financeiro/controle-de-caixa',
        permission: 'financial:cash_control:view',
      },
      {
        icon: IconDeviceDesktopDollar,
        title: 'PDV',
        path: '/financeiro/frente-de-caixa',
        permission: 'financial:checkout:view',
      },
      {
        icon: IconCalendarDollar,
        title: 'Despesas fixas',
        path: '/financeiro/despesas-fixas',
        permission: 'financial:fixed_expense:view',
      },
      {
        icon: IconBusinessplan,
        title: 'Folha de pagamento',
        path: '/financeiro/folha-de-pagamento',
        permission: 'financial:payroll:view',
      },
    ],
  },
  {
    icon: IconListSearch,
    title: 'Produção',
    path: '/producao',
    children: [
      // {
      //   icon: IconClipboardList,
      //   title: 'Produção',
      //   path: '/producao/producao',
      // },
      // {
      //   icon: IconListCheck,
      //   title: 'Acompanhamento',
      //   path: '/producao/acompanhamento',
      // },
      {
        icon: IconTruckLoading,
        title: 'Agenda de Entrega',
        path: '/producao/agenda-de-entrega',
        permission: 'production:delivery_schedule:view',
      },
    ],
  },
  {
    icon: IconAddressBook,
    title: 'Cadastros',
    path: '/cadastros',
    children: [
      {
        icon: IconUsers,
        title: 'Clientes',
        path: '/cadastros/clientes',
        permission: 'register:client:view',
        // query: '?status=preCadastros',
      },
      {
        icon: IconBuildingCommunity,
        title: 'Fornecedores',
        path: '/cadastros/fornecedores',
        permission: 'register:supplier:view',
      },
      /* {
        icon: IconSquareRoundedPlusFilled,
        title: 'Novo cliente',
        path: '#',
        action: true,
      }, */
    ],
  },
  {
    icon: IconSettings,
    title: 'Configurações',
    path: '/configuracoes',
    children: [
      {
        icon: IconBuilding,
        title: 'Empresa e sistema',
        path: '/configuracoes/empresa-e-sistema',
        permission: 'settings:company_system:view',
      },
      // {
      //   icon: IconReceiptTax,
      //   title: 'Custos e precificação',
      //   path: '/configuracoes/custos-e-precificacao',
      // },
      {
        icon: IconBoxSeam,
        title: 'Produtos',
        path: '/configuracoes/produtos',
        permission: 'settings:products:view',
      },
      {
        icon: IconCalculator,
        title: 'Financeiro',
        path: '/configuracoes/financeiro',
        permission: 'settings:financial:view',
      },
      // {
      //   icon: IconReceitaFederal,
      //   title: 'Nota Fiscal',
      //   path: '/configuracoes/nota-fiscal',
      //   permission: 'settings:invoice:view',
      // },
      {
        icon: IconCoin,
        title: 'Vendas',
        path: '/configuracoes/vendas',
        permission: 'settings:sales:view',
      },
    ],
  },
  {
    icon: IconBook,
    title: 'Academy',
    path: '/academy',
    children: [
      {
        icon: IconAtrupeLogo,
        iconColor: 'text-[#4CBC89]',
        title: 'Start',
        path: '/academy/start',
      },
      {
        icon: IconAtrupeLogo,
        iconColor: 'text-[#6B809C]',
        title: 'Lite',
        path: '/academy/lite',
      },
      {
        icon: IconAtrupeLogo,
        iconColor: 'text-[#A87D63]',
        title: 'Pro',
        path: '/academy/pro',
      },
      {
        icon: IconAtrupeLogo,
        iconColor: 'text-[#501201]',
        title: 'Elite',
        path: '/academy/elite',
      },
      {
        icon: IconAtrupeLogo,
        iconColor: 'text-[#083B5A]',
        title: 'Full',
        path: '/academy/full',
      },
    ],
  },
]

export const adminMainNavigation: MainNavigationType[] = [
  {
    icon: IconListSearch,
    title: 'Avaliação',
    path: '/admin/avaliacao',
    children: [
      {
        icon: IconProgressAlert,
        title: 'Cadastros incompletos',
        path: '/admin/avaliacao/cadastros-incompletos',
      },
      {
        icon: IconRefreshAlert,
        title: 'Contas trials',
        path: '/admin/avaliacao/contas-trials',
      },
    ],
  },
  {
    icon: IconUsers,
    title: 'Clientes',
    path: '/admin/clientes',
    children: [
      {
        icon: IconBrandAsana,
        title: 'Gerenciar contas',
        path: '/admin/clientes/gerenciar-contas',
      },
    ],
  },
  {
    icon: IconBook,
    title: 'Academy',
    path: '/admin/academy',
    children: [
      {
        icon: IconBook,
        title: 'Academy',
        path: '/admin/academy',
      },
    ],
  },
  // {
  //   icon: IconUserScan,
  //   title: 'Usuários',
  //   path: '/admin/usuarios',
  //   children: [
  //     {
  //       icon: IconUserCog,
  //       title: 'Colaboradores',
  //       path: '/admin/usuarios/colaboradores',
  //     },
  //   ],
  // },
]

export const secondaryNavigation: SecondaryNavigationType = {
  title: 'Navegação secundária',
  parentPath: '/secondary',
  items: [
    {
      icon: IconSettings,
      title: 'Page',
      path: 'page',
    },
  ],
}

export const secondaryNavRoutes = [
  // { path: '/secondary/id', nav: secondaryNavigation },
]

export const userRoleObj: {
  [key: string]: string
} = {
  USER: 'Usuário',
  ADMIN: 'Admin',
  SELLER: 'Vendedor',
  SUPER_ADMIN: 'Super admin',
}

export function getMainNavigation(user?: { isSystemAdmin?: boolean }) {
  if (user?.isSystemAdmin) {
    return adminMainNavigation
  }

  return defaultMainNavigation
}
