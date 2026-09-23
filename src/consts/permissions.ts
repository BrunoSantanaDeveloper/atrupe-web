export const permissionsData = [
  {
    section: 'Valores',
    key: 'values',
    items: [
      {
        name: 'Valores',
        key: 'values',
      },
    ],
  },
  {
    section: 'Dashboard',
    key: 'dashboard',
    items: [
      {
        name: 'Resumo financeiro',
        key: 'financial',
      },
      {
        name: 'Resumo de vendas',
        key: 'sales',
      },
      {
        name: 'Orcamentos',
        key: 'quotations',
      },
      {
        name: 'Evolucao e rankings',
        key: 'rankings',
      },
    ],
  },
  {
    section: 'Vendas',
    key: 'sale',
    items: [
      {
        name: 'Orçamentos',
        key: 'quotation',
        exportable: true,
      },
      {
        name: 'Vendas de outros Vendedores',
        key: 'other_quotation',
      },
      {
        name: 'Ordens de serviço',
        key: 'order',
        exportable: true,
      },
    ],
  },
  {
    section: 'Financeiro',
    key: 'financial',
    items: [
      {
        name: 'Fluxo financeiro',
        key: 'flow',
        exportable: true,
      },
      {
        name: 'Lançamento de despesas fixas',
        key: 'fixed_expense',
      },
      {
        name: 'Lançamento de folha de pagamento',
        key: 'payroll',
      },
    ],
  },
  {
    section: 'Custos e precificação',
    key: 'cost',
    items: [
      {
        name: 'Base de custos',
        key: 'base',
      },
      {
        name: 'Precificação',
        key: 'pricing',
      },
    ],
  },
  {
    section: 'Relatorios',
    key: 'reports',
    items: [
      {
        name: 'Resultado por setor',
        key: 'sector_result',
      },
      {
        name: 'Relatorio de vendas',
        key: 'sales',
      },
      {
        name: 'Relatorio financeiro',
        key: 'financial',
      },
      {
        name: 'DFC',
        key: 'dfc',
      },
      {
        name: 'Comissoes',
        key: 'commission',
      },
    ],
  },
  {
    section: 'Cadastros',
    key: 'register',
    items: [
      {
        name: 'Cadastro de clientes',
        key: 'client',
        exportable: true,
      },
      {
        name: 'Cadastro de fornecedores',
        key: 'supplier',
        exportable: true,
      },
    ],
  },
  {
    section: 'Empresa e sistema',
    key: 'company_settings',
    items: [
      {
        name: 'Configuração da empresa',
        key: 'company',
      },
      {
        name: 'Padrões de medidas',
        key: 'measurement_standards',
      },
      {
        name: 'Colaboradores e usuários',
        key: 'users',
      },
      {
        name: 'Cargos',
        key: 'roles',
      },
      {
        name: 'Setores',
        key: 'sectors',
      },
    ],
  },
  {
    section: 'Configurações de produtos',
    key: 'product_settings',
    items: [
      {
        name: 'Produtos',
        key: 'products',
        exportable: true,
      },
    ],
  },
  {
    section: 'Configurações do financeiro',
    key: 'financial_settings',
    items: [
      {
        name: 'Bancos e contas bancárias',
        key: 'bank_accounts',
      },
      {
        name: 'Formas de pagamento',
        key: 'payment_methods',
      },
      {
        name: 'Plano de contas',
        key: 'chart_accounts',
      },
      {
        name: 'Despesas fixas',
        key: 'fixed_expenses',
      },
      // TODO: Reativar no plano LITE
      // {
      //   name: 'Limites de crédito',
      //   key: 'credit_limits',
      // },
      {
        name: 'Folha de pagamento',
        key: 'payroll',
      },
    ],
  },
  {
    section: 'Configurações de vendas',
    key: 'sales_settings',
    items: [
      {
        name: 'Série de vendas',
        key: 'series',
      },
      {
        name: 'Perfil de vendedor',
        key: 'seller_profile',
      },
      // TODO: Reativar no plano LITE
      // {
      //   name: 'Motivos de rejeições e cancelamentos',
      //   key: 'rejection_reasons',
      // },
      // {
      //   name: 'Status de orçamento',
      //   key: 'quotation_status',
      // },
    ],
  },
  {
    section: 'Nota Fiscal',
    key: 'nota_fiscal',
    items: [
      {
        name: 'Emitir NF-e / NFS-e / NFC-e',
        key: 'emitir',
      },
      {
        name: 'Consultar notas emitidas',
        key: 'emitidas',
      },
      {
        name: 'Cancelar nota',
        key: 'cancelar',
      },
      {
        name: 'Carta de correção (CC-e)',
        key: 'carta_correcao',
      },
      {
        name: 'Configurações fiscais',
        key: 'config',
      },
    ],
  },
]
