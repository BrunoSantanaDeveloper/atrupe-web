import {
  IconRocket,
  IconCoin,
  IconFileInvoice,
  IconListCheck,
  IconClipboardList,
  IconNews,
  IconBook,
  IconCoins,
  IconArrowsDiff,
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
  IconBuildingFactory2,
} from '@tabler/icons-react'
import { IconReceitaFederal } from '@/assets/icons/pictogramas'
import type { SVGProps } from 'react'
import type { IconProps } from '@tabler/icons-react'

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
  // Módulo contratado à parte necessário para exibir o item (hoje só
  // nota_fiscal); recurso de plano vai em requiredFeature
  requiredModule?: string
  // Recurso do plano necessário para exibir o item (com lista, basta um). A
  // composição dos planos é configurada pelo superadmin.
  requiredFeature?: string | string[]
  // Tela que ainda roda sobre dados de exemplo: o item só aparece com a flag
  // de demonstração (src/lib/demo.ts). Sai junto com a rota de DEMO_ROUTES
  demo?: boolean
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
      // primeiro porque é o caminho do balcão. Aparece com o recurso de
      // venda rápida do plano e abre o formulário da venda rápida na lista
      // de orçamentos. Com a flag de demonstração e a configuração completa,
      // o orçamento nasce direto (VR-4 do fork)
      {
        icon: IconBolt,
        title: 'Venda rápida',
        path: '/vendas/orcamentos?novo=venda-rapida',
        permission: 'sale:quotation:create',
        requiredFeature: 'quotation_quick_sale',
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
        requiredFeature: 'accounts_receivable',
      },
      {
        icon: IconTrendingDown,
        title: 'A pagar',
        path: '/financeiro/a-pagar',
        permission: ['financial:flow:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredFeature: 'accounts_payable',
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
        // A mesma chave da página (PO, 14/10/2026)
        permission: ['financial:cash_control:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredFeature: 'cash_control',
      },
      // A conciliação com o extrato em OFX (CX-6), do controle de caixa
      {
        icon: IconArrowsDiff,
        title: 'Conciliação bancária',
        path: '/financeiro/conciliacao',
        permission: ['financial:cash_control:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredFeature: 'cash_control',
      },
      {
        icon: IconDeviceDesktopDollar,
        title: 'Frente de caixa (PDV)',
        path: '/financeiro/frente-de-caixa',
        // O operador vê os valores do caixa sem a permissão de valores
        // (FC-15); a API é da Fase 7.4
        permission: 'financial:pdv:view',
        requiredFeature: 'pdv_screen',
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
    path: '/base-de-custos',
    permission: 'values:values:view',
    requiredFeature: 'cost_base',
    demo: true,
    children: [
      {
        icon: IconChartPie,
        title: 'Base de custos',
        path: '/base-de-custos',
        permission: ['cost:base:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredFeature: 'cost_base',
        demo: true,
      },
      {
        icon: IconTag,
        title: 'Precificação',
        path: '/precificacao',
        permission: ['cost:pricing:view', 'values:values:view'],
        requireAllPermissions: true,
        requiredFeature: 'pricing_center',
        demo: true,
      },
    ],
  },
  {
    icon: IconListSearch,
    title: 'Produção',
    path: '/producao',
    // A Agenda de entrega vale em todo plano (Start em diante, PO, 14/10/2026)
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
        permission: 'production:delivery_schedule:view',
      },
      {
        icon: IconListCheck,
        title: 'Gerenciador de produção',
        path: '/producao/gerenciador',
        permission: 'production:production:view',
        // A tela por setor do PRO (sector_board) ou o gerenciador do ELITE
        requiredFeature: ['production_manager', 'sector_board'],
        demo: true,
      },
      {
        icon: IconClipboardList,
        title: 'Projetos',
        path: '/producao/projetos',
        permission: 'production:production:view',
        // A tela por setor do PRO (sector_board) ou o gerenciador do ELITE
        requiredFeature: ['production_manager', 'sector_board'],
        demo: true,
      },
      {
        icon: IconChartBar,
        title: 'Produtividade',
        path: '/producao/produtividade',
        permission: 'production:production:view',
        requiredFeature: 'productivity_tracking',
        demo: true,
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
        permission: 'product_settings:products:view',
        requiredFeature: 'cost_base',
      },
      {
        icon: IconListCheck,
        title: 'Processos',
        path: '/configuracoes/produtos/processos',
        permission: 'product_settings:composition:view',
        requiredFeature: 'cost_base',
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
    requiredFeature: 'stock_control',
    demo: true,
    children: [
      {
        icon: IconBoxSeam,
        title: 'Saldo do estoque',
        path: '/estoque',
        permission: 'stock:stock:view',
        requiredFeature: 'stock_control',
        demo: true,
      },
      {
        icon: IconFileInvoice,
        title: 'Entrada de nota',
        path: '/estoque/entrada-de-nota',
        permission: 'stock:invoice_entry:view',
        requiredFeature: 'invoice_entry',
        demo: true,
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
        icon: IconBoxSeam,
        title: 'Produtos',
        path: '/relatorios/produtos',
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
          'sales_settings:contact_sources:view',
        ],
        requireAllPermissions: false,
      },
      {
        icon: IconBuildingFactory2,
        title: 'Produção',
        path: '/configuracoes/producao',
        permission: 'production:production:view',
        // A tela por setor do PRO (sector_board) ou o gerenciador do ELITE
        requiredFeature: ['production_manager', 'sector_board'],
        demo: true,
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
