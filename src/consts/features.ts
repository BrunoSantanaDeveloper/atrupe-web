/**
 * Constantes centralizadas para features do sistema
 * Baseado na análise do hook usePlanFeatures e uso no projeto
 */

export const FEATURES = {
  // Módulos Financeiros
  FINANCIAL: {
    ACCOUNTS_RECEIVABLE: 'accounts_receivable',
    ACCOUNTS_PAYABLE: 'accounts_payable',
    CASH_CONTROL: 'cash_control',
    PDV_SCREEN: 'pdv_screen',
    CREDIT_LIMIT_CONFIGURATION: 'credit_limit_configuration',
    BANK_ACCOUNT_CREATION: 'bank_account_creation',
    PAYMENT_CONDITION_OPERATOR_FEE: 'payment_condition_operator_fee',
    BANK_ACCOUNT_CASH_CONTROL_SWITCH: 'bank_account_cash_control_switch',
    TRANSACTION_CANCEL_REASONS: 'transaction_cancel_reasons',
  },

  // Vendas e Orçamentos
  SALES: {
    QUOTATION_QUICK_SALE: 'quotation_quick_sale',
    QUOTATION_REJECTION_REASONS: 'quotation_rejection_reasons',
    QUOTATION_STATUS_CONFIGURATION: 'quotation_status_configuration',
    QUOTATION_STATUS_COLUMN: 'quotation_status_column',
    SERVICE_ORDER_CANCELLATION_REASON: 'service_order_cancellation_reason',
    SERVICE_ORDER_CURRENT_PHASE: 'service_order_current_phase',
    CAN_BILL_ON_DELIVERY_AND_CHECKOUT: 'can_bill_on_delivery_and_checkout',
    // Terceirizado avulso dentro do item, já no START (T-5, 24/10/2026)
    OUTSOURCED_ITEM: 'outsourced_item',
    // Acompanhamento comercial (CRM, área 13), do LITE em diante (CRM-7,
    // 29/10/2026)
    SALES_FOLLOW_UP: 'sales_follow_up',
  },

  // Produtos e Produção
  PRODUCTS: {
    PRODUCT_COMPOSITION: 'product_composition',
    PRODUCT_PRODUCTION_STAGES: 'product_production_stages',
    DELIVERY_PRODUCTION_TABS: 'delivery_production_tabs',
    DELIVERY_PRODUCTION_STAGES: 'delivery_production_stages',
    DELIVERY_STAGE_STATUS_CHANGE: 'delivery_stage_status_change',
  },

  // Custos e precificação (PRO)
  COSTS: {
    COST_BASE: 'cost_base',
    PRICING_CENTER: 'pricing_center',
  },

  // Produção (ELITE)
  PRODUCTION: {
    PRODUCTION_MANAGER: 'production_manager',
    PRODUCTIVITY_TRACKING: 'productivity_tracking',
  },

  // Estoque e compras (FULL)
  STOCK: {
    STOCK_CONTROL: 'stock_control',
    INVOICE_ENTRY: 'invoice_entry',
  },

  // Configurações Gerais
  SYSTEM: {
    SECTORS_CONFIGURATION: 'sectors_configuration',
    MULTIPLE_COMPANIES: 'multiple_companies',
  },

  // Clientes e Fornecedores
  CONTACTS: {
    CLIENT_ADDITIONAL_TABS: 'client_additional_tabs',
    SUPPLIER_ADDITIONAL_TABS: 'supplier_additional_tabs',
    CLIENT_RESPONSIBLE_MANAGEMENT: 'client_responsible_management',
  },
} as const

// Tipo para garantir type safety
export type FeatureKey =
  | keyof typeof FEATURES.FINANCIAL
  | keyof typeof FEATURES.SALES
  | keyof typeof FEATURES.PRODUCTS
  | keyof typeof FEATURES.COSTS
  | keyof typeof FEATURES.PRODUCTION
  | keyof typeof FEATURES.STOCK
  | keyof typeof FEATURES.SYSTEM
  | keyof typeof FEATURES.CONTACTS

// Helper para obter valor da feature
export function getFeature(
  category: keyof typeof FEATURES,
  key: string,
): string {
  return FEATURES[category][key as keyof (typeof FEATURES)[typeof category]]
}

// Mapeamento reverso para debug
export const FEATURE_NAMES: Record<string, string> = {
  accounts_receivable: 'Contas a Receber',
  accounts_payable: 'Contas a Pagar',
  cash_control: 'Controle de Caixa',
  pdv_screen: 'Frente de Caixa (PDV)',
  quotation_status_configuration: 'Configuração de Status de Orçamento',
  quotation_rejection_reasons: 'Motivos de Rejeição de Orçamento',
  service_order_cancellation_reason: 'Motivos de Cancelamento de OS',
  sectors_configuration: 'Configuração de Setores',
  client_additional_tabs: 'Abas Adicionais de Cliente',
  supplier_additional_tabs: 'Abas Adicionais de Fornecedor',
  product_composition: 'Composição de Produtos',
  delivery_production_tabs: 'Abas de Produção na Entrega',
  bank_account_creation: 'Criação de Contas Bancárias',
  multiple_companies: 'Mais de uma empresa',
  transaction_cancel_reasons: 'Motivo ao cancelar lançamento',
  can_bill_on_delivery_and_checkout: 'Faturar na entrega e na frente de caixa',
  cost_base: 'Base de custos',
  pricing_center: 'Precificação',
  production_manager: 'Gerenciador de produção',
  productivity_tracking: 'Produtividade',
  stock_control: 'Estoque',
  invoice_entry: 'Entrada de nota',
  // adicionar conforme necessário...
}
