import {
  IconCoin,
  IconNews,
  IconBook,
  IconCoins,
  IconGraph,
  IconUsers,
  IconShare2,
  IconUpload,
  IconBoxSeam,
  IconBuilding,
  IconSettings,
  IconChartBar,
  IconBrandAsana,
  IconCalculator,
  IconListSearch,
  IconLayoutGrid,
  IconUserDollar,
  IconTrendingUp,
  IconFileSymlink,
  IconAddressBook,
  IconReportMoney,
  IconTrendingDown,
  IconBusinessplan,
  IconTruckLoading,
  IconRefreshAlert,
  IconCashBanknote,
  IconProgressAlert,
  IconActivity,
  IconArrowsExchange,
  IconCalendarDollar,
  IconBuildingCommunity,
  IconDeviceDesktopDollar,
  IconFilePlus,
} from '@tabler/icons-react'
import { IconAtrupeLogo, IconReceitaFederal } from '@/assets/icons/CustomIcons'
import type { SVGProps } from 'react'
import type { IconProps } from '@tabler/icons-react'

export interface MainNavigationType {
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  iconColor?: string
  title: string // ** "Clientes"
  path?: string // ** "cadastros/clientes"
  query?: string // ** "?status=ACTIVE&page=1"
  counter?: number // ** 3
  action?: boolean
  permission?: string | string[] // Nova propriedade para permissões (string ou array para múltiplas permissões)
  requireAllPermissions?: boolean // Se true, requer todas as permissões (AND), senão requer qualquer uma (OR)
  requiredModule?: string // Módulo contratado necessário para exibir o item
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
    permission: 'values:values:view',
    children: [
      {
        icon: IconTrendingUp,
        title: 'A receber',
        path: '/financeiro/a-receber',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconTrendingDown,
        title: 'A pagar',
        path: '/financeiro/a-pagar',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconArrowsExchange,
        title: 'Fluxo financeiro',
        path: '/financeiro/fluxo-financeiro',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconCoins,
        title: 'Controle de caixa',
        path: '/financeiro/controle-de-caixa',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconDeviceDesktopDollar,
        title: 'PDV',
        path: '/financeiro/frente-de-caixa',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconCalendarDollar,
        title: 'Despesas fixas',
        path: '/financeiro/despesas-fixas',
        permission: ['financial:fixed_expense:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconBusinessplan,
        title: 'Folha de pagamento',
        path: '/financeiro/folha-de-pagamento',
        permission: ['financial:payroll:view', 'values:values:view'],
        requireAllPermissions: true,
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
    icon: IconFileSymlink,
    title: 'Nota Fiscal',
    path: '/nota-fiscal',
    children: [
      {
        icon: IconShare2,
        title: 'Emitir Nota',
        path: '/nota-fiscal/emitir',
        permission: 'nota_fiscal:emitir:view',
        requiredModule: 'nota_fiscal',
      },
      {
        icon: IconFilePlus,
        title: 'Nota Avulsa',
        path: '/nota-fiscal/emitir/avulsa',
        permission: 'nota_fiscal:emitir:create',
        requiredModule: 'nota_fiscal',
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
    icon: IconChartBar,
    title: 'Relatórios',
    path: '/relatorios',
    permission: 'values:values:view',
    children: [
      {
        icon: IconLayoutGrid,
        title: 'Resultado por setor',
        path: '/relatorios/resultado-por-setor',
        permission: ['reports:sector_result:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconCoin,
        title: 'Vendas',
        path: '/relatorios/vendas',
        permission: ['reports:sales:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconCashBanknote,
        title: 'Financeiro',
        path: '/relatorios/financeiro',
        permission: ['reports:financial:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconGraph,
        title: 'Projeção de caixa',
        path: '/relatorios/projecao-de-caixa',
        permission: ['reports:financial:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconCoins,
        title: 'DFC',
        path: '/relatorios/dfc',
        permission: ['reports:dfc:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconUserDollar,
        title: 'Comissões',
        path: '/relatorios/comissoes',
        permission: ['reports:commission:view', 'values:values:view'],
        requireAllPermissions: true,
      },
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
        permission: [
          'company_settings:company:view',
          'company_settings:sectors:view',
          'company_settings:measurement_standards:view',
          'company_settings:users:view',
          'company_settings:roles:view',
        ],
        requireAllPermissions: false,
      },
      {
        icon: IconBoxSeam,
        title: 'Produtos',
        path: '/configuracoes/produtos',
        permission: 'product_settings:products:view',
      },
      {
        icon: IconCalculator,
        title: 'Financeiro',
        path: '/configuracoes/financeiro',
        permission: [
          'financial_settings:bank_accounts:view',
          'financial_settings:payment_methods:view',
          'financial_settings:chart_accounts:view',
          'financial_settings:fixed_expenses:view',
          'financial_settings:credit_limits:view',
          'financial_settings:payroll:view',
        ],
        requireAllPermissions: false,
      },
      {
        icon: IconReceitaFederal,
        title: 'Nota Fiscal',
        path: '/configuracoes/nota-fiscal',
        permission: 'invoice_settings:nf:view',
        requiredModule: 'nota_fiscal',
      },
      {
        icon: IconCoin,
        title: 'Vendas',
        path: '/configuracoes/vendas',
        permission: [
          'sales_settings:series:view',
          'sales_settings:seller_profile:view',
          'sales_settings:rejection_reasons:view',
          'sales_settings:quotation_status:view',
        ],
        requireAllPermissions: false,
      },
      {
        icon: IconUpload,
        title: 'Importações',
        path: '/configuracoes/importacoes',
        permission: 'import_settings:import:view',
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
      // {
      //   icon: IconAtrupeLogo,
      //   iconColor: 'text-[#6B809C]',
      //   title: 'Lite',
      //   path: '/academy/lite',
      // },
      // {
      //   icon: IconAtrupeLogo,
      //   iconColor: 'text-[#A87D63]',
      //   title: 'Pro',
      //   path: '/academy/pro',
      // },
      // {
      //   icon: IconAtrupeLogo,
      //   iconColor: 'text-[#501201]',
      //   title: 'Elite',
      //   path: '/academy/elite',
      // },
      // {
      //   icon: IconAtrupeLogo,
      //   iconColor: 'text-[#083B5A]',
      //   title: 'Full',
      //   path: '/academy/full',
      // },
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
        path: '/admin/avaliacao/contas-trial',
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
      {
        icon: IconActivity,
        title: 'Acessos',
        path: '/admin/clientes/acessos',
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
        permission: 'academy:academy:view',
      },
    ],
  },
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
