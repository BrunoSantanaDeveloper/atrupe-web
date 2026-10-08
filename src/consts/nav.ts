import {
  IconRocket,
  IconCoin,
  IconFileInvoice,
  IconListCheck,
  IconClipboardList,
  IconNews,
  IconBook,
  IconCoins,
  IconGraph,
  IconUsers,
  IconUpload,
  IconBolt,
  IconBoxSeam,
  IconPackages,
  IconBuilding,
  IconSettings,
  IconChartBar,
  IconChartPie,
  IconBrandAsana,
  IconCalculator,
  IconTag,
  IconTargetArrow,
  IconListSearch,
  IconDatabaseImport,
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
  IconReceiptTax,
  IconTicket,
} from '@tabler/icons-react'
import { IconReceitaFederal } from '@/assets/icons/CustomIcons'
import type { SVGProps } from 'react'
import type { IconProps } from '@tabler/icons-react'
import type { ReviewMarkKind } from './revisao'

export interface MainNavigationType {
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  title: string // ** "Clientes"
  path?: string // ** "cadastros/clientes"
  query?: string // ** "?status=ACTIVE&page=1"
  counter?: number // ** 3
  action?: boolean
  permission?: string | string[] // Nova propriedade para permissões (string ou array para múltiplas permissões)
  requireAllPermissions?: boolean // Se true, requer todas as permissões (AND), senão requer qualquer uma (OR)
  requiredModule?: string // Módulo contratado necessário para exibir o item
  review?: ReviewMarkKind // Marcação temporária da revisão: azul = novo, vermelho = a desenvolver
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
      // Venda rápida é o mesmo orçamento, nascendo com menos perguntas: vem
      // primeiro porque é o caminho do balcão, e só aparece quando ligada em
      // Configurações › Vendas (VR-4)
      {
        icon: IconBolt,
        title: 'Venda rápida',
        path: '/vendas/orcamentos?novo=venda-rapida',
        review: 'new',
        permission: 'sale:quotation:create',
        requiredModule: 'quotation_quick_sale',
        action: true,
      },
      {
        icon: IconReportMoney,
        title: 'Orçamentos',
        path: '/vendas/orcamentos',
        permission: 'sale:quotation:view',
      },
      {
        icon: IconNews,
        title: 'Ordens de serviço',
        path: '/vendas/ordens-de-servico',
        permission: 'sale:order:view',
      },
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
        review: 'new',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
      },
      {
        icon: IconDeviceDesktopDollar,
        title: 'Frente de caixa (PDV)',
        path: '/financeiro/frente-de-caixa',
        review: 'new',
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
  // Custo e preço são o método do PRO: telas onde se define quanto custa e
  // por quanto se vende. Ficavam sem entrada no menu, alcançáveis só por
  // dentro de Configurações — que é onde se ajusta o sistema, não onde se
  // trabalha (revisao-telas.md §1)
  {
    icon: IconTargetArrow,
    title: 'Custos e preços',
    review: 'new',
    path: '/base-de-custos',
    permission: 'values:values:view',
    requiredModule: 'cost_base',
    children: [
      {
        icon: IconChartPie,
        title: 'Base de custos',
        path: '/base-de-custos',
        permission: ['cost:base:view', 'values:values:view'],
        review: 'new',
        requireAllPermissions: true,
        requiredModule: 'cost_base',
      },
      {
        icon: IconTag,
        title: 'Precificação',
        path: '/precificacao',
        review: 'new',
        permission: ['cost:pricing:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredModule: 'pricing_center',
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
        title: 'Agenda de entrega',
        path: '/producao/agenda-de-entrega',
        review: 'todo',
        permission: 'production:delivery_schedule:view',
      },
      {
        icon: IconListCheck,
        title: 'Gerenciador de produção',
        path: '/producao/gerenciador',
        review: 'new',
        permission: 'production:production:view',
        requiredModule: 'production_manager',
      },
      {
        icon: IconClipboardList,
        title: 'Projetos',
        path: '/producao/projetos',
        review: 'new',
        permission: 'production:production:view',
        requiredModule: 'production_manager',
      },
      {
        icon: IconChartBar,
        title: 'Produtividade',
        path: '/producao/produtividade',
        review: 'new',
        permission: 'production:production:view',
        requiredModule: 'productivity_tracking',
      },
    ],
  },
  {
    icon: IconFileSymlink,
    title: 'Nota fiscal',
    path: '/nota-fiscal/emitir',
    permission: 'nota_fiscal:emitir:view',
    requiredModule: 'nota_fiscal',
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
      // Produtos, materiais e processos são cadastros do dia a dia, não
      // configuração: ficavam escondidos em abas dentro de Configurações.
      // Ordem pedida pelo time (03/10/2026): materiais → processos →
      // produtos, a ordem em que a composição é montada
      {
        icon: IconPackages,
        title: 'Materiais',
        path: '/configuracoes/produtos/materiais',
        review: 'new',
        permission: 'product_settings:products:view',
        requiredModule: 'cost_base',
      },
      {
        icon: IconListCheck,
        title: 'Processos',
        path: '/configuracoes/produtos/processos',
        review: 'new',
        permission: 'product_settings:products:view',
        requiredModule: 'cost_base',
      },
      {
        icon: IconBoxSeam,
        title: 'Produtos',
        path: '/configuracoes/produtos',
        permission: 'product_settings:products:view',
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
    icon: IconBoxSeam,
    title: 'Estoque',
    path: '/estoque',
    permission: 'stock:stock:view',
    requiredModule: 'stock_control',
    children: [
      {
        icon: IconBoxSeam,
        title: 'Saldo do estoque',
        path: '/estoque',
        permission: 'stock:stock:view',
        requiredModule: 'stock_control',
        review: 'new',
      },
      {
        icon: IconFileInvoice,
        title: 'Entrada de nota',
        path: '/estoque/entrada-de-nota',
        review: 'new',
        permission: 'stock:invoice_entry:view',
        requiredModule: 'invoice_entry',
      },
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
        title: 'Nota fiscal',
        path: '/configuracoes/nota-fiscal',
        permission: 'nota_fiscal:config:view',
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
        icon: IconListCheck,
        title: 'Produção',
        path: '/configuracoes/producao',
        review: 'new',
        permission: 'production:production:view',
        requiredModule: 'production_manager',
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
        icon: IconRocket,
        title: 'Start',
        path: '/academy/start',
      },
      // {
      //   icon: IconAtrupeLogo,
      //   title: 'Lite',
      //   path: '/academy/lite',
      // },
      // {
      //   icon: IconAtrupeLogo,
      //   title: 'Pro',
      //   path: '/academy/pro',
      // },
      // {
      //   icon: IconAtrupeLogo,
      //   title: 'Elite',
      //   path: '/academy/elite',
      // },
      // {
      //   icon: IconAtrupeLogo,
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
  {
    icon: IconSettings,
    title: 'Sistema',
    path: '/admin/sistema',
    children: [
      {
        icon: IconSettings,
        title: 'Integrações',
        path: '/admin/sistema/integracoes',
      },
      {
        icon: IconReceiptTax,
        title: 'Parâmetros fiscais',
        path: '/admin/sistema/fiscal',
      },
      {
        icon: IconTicket,
        title: 'Cupons de desconto',
        path: '/admin/sistema/cupons',
      },
      {
        icon: IconLayoutGrid,
        title: 'Planos',
        path: '/admin/sistema/planos',
      },
      {
        icon: IconDatabaseImport,
        title: 'Migração do legado',
        path: '/admin/sistema/migracao',
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
