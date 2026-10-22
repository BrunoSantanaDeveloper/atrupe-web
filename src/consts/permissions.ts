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
        name: 'Orçamentos',
        key: 'quotations',
      },
      {
        name: 'Evolução e rankings',
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
      // Custo e margem da venda (ORC-8): fora do perfil de vendedor
      {
        name: 'Resultado previsto da venda',
        key: 'quotation_result',
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
        name: 'Controle de caixa',
        key: 'cash_control',
      },
      // Reabrir caixa fechado (CX-3, ALT-7): restrita, com justificativa
      {
        name: 'Reabrir caixa',
        key: 'cash_control_reopen',
      },
      {
        name: 'Lançamento de despesas fixas',
        key: 'fixed_expense',
      },
      {
        name: 'Lançamento de folha de pagamento',
        key: 'payroll',
      },
      // As telas já pediam; a tela de cargos passou a conceder (PO, 14/10)
      {
        name: 'Contas a pagar',
        key: 'payable',
      },
      {
        name: 'Contas a receber',
        key: 'receivable',
      },
      {
        name: 'Frente de caixa (PDV)',
        key: 'pdv',
      },
      {
        name: 'Caixas da frente de caixa',
        key: 'checkout',
      },
      // As permissões restritas da frente de caixa (FC-15, PO 30/09/2026)
      {
        name: 'Configurar frente de caixa',
        key: 'pdv_settings',
      },
      {
        name: 'Dispensar sinal',
        key: 'pdv_down_payment',
      },
      {
        name: 'Reverter venda para faturamento',
        key: 'pdv_billing',
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
    section: 'Produção',
    key: 'production',
    items: [
      {
        name: 'Gerenciador de produção',
        key: 'production',
      },
      // Corrigir e lançar tempo no gerenciador (GP-44)
      {
        name: 'Correção de tempo',
        key: 'time_entry',
      },
      // A produtividade de cada pessoa (PCP-3)
      {
        name: 'Produtividade por pessoa',
        key: 'productivity',
      },
      {
        name: 'Agenda de entrega',
        key: 'delivery_schedule',
      },
    ],
  },
  {
    section: 'Estoque',
    key: 'stock',
    items: [
      {
        name: 'Estoque',
        key: 'stock',
      },
      {
        name: 'Entrada de nota',
        key: 'invoice_entry',
      },
    ],
  },
  {
    section: 'Relatórios',
    key: 'reports',
    items: [
      {
        name: 'Resultado por setor',
        key: 'sector_result',
      },
      {
        name: 'Relatório de vendas',
        key: 'sales',
      },
      {
        name: 'Relatório financeiro',
        key: 'financial',
      },
      {
        name: 'DFC',
        key: 'dfc',
      },
      {
        name: 'Comissões',
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
      {
        name: 'Limite de crédito do cliente',
        key: 'credit_limit',
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
      {
        name: 'Assinatura',
        key: 'subscription',
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
      // A composição por etapas, os processos e os recursos (D18)
      {
        name: 'Composição e processos',
        key: 'composition',
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
      {
        name: 'Limites de crédito',
        key: 'credit_limits',
      },
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
      {
        name: 'Motivos de rejeições e cancelamentos',
        key: 'rejection_reasons',
      },
      {
        name: 'Status de orçamento',
        key: 'quotation_status',
      },
      {
        name: 'Origens de contato',
        key: 'contact_sources',
      },
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
  {
    section: 'Cadastros fiscais',
    key: 'invoice',
    items: [
      {
        name: 'CFOP, naturezas de operação e emissores',
        key: 'nfse',
      },
    ],
  },
  {
    section: 'Importações',
    key: 'import_settings',
    items: [
      {
        name: 'Importações',
        key: 'import',
      },
      {
        name: 'Importar clientes',
        key: 'clients',
      },
      {
        name: 'Importar fornecedores',
        key: 'suppliers',
      },
      {
        name: 'Importar produtos',
        key: 'products',
      },
      {
        name: 'Importar orçamentos',
        key: 'quotations',
      },
      {
        name: 'Importar financeiro',
        key: 'financial',
      },
    ],
  },
  {
    section: 'Academy',
    key: 'academy',
    items: [
      {
        name: 'Academy',
        key: 'academy',
      },
    ],
  },
]
