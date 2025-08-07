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
  },

  // Vendas e Orçamentos
  SALES: {
    QUOTATION_QUICK_SALE: 'quotation_quick_sale',
    QUOTATION_REJECTION_REASONS: 'quotation_rejection_reasons',
    QUOTATION_REQUIRE_REJECTION_REASON: 'quotation_require_rejection_reason',
    QUOTATION_STATUS_CONFIGURATION: 'quotation_status_configuration',
    QUOTATION_STATUS_COLUMN: 'quotation_status_column',
    SERVICE_ORDER_CANCELLATION_REASON: 'service_order_cancellation_reason',
    SERVICE_ORDER_CURRENT_PHASE: 'service_order_current_phase',
  },

  // Produtos e Produção
  PRODUCTS: {
    PRODUCT_COMPOSITION: 'product_composition',
    PRODUCT_PRODUCTION_STAGES: 'product_production_stages',
    DELIVERY_PRODUCTION_TABS: 'delivery_production_tabs',
    DELIVERY_PRODUCTION_STAGES: 'delivery_production_stages',
    DELIVERY_STAGE_STATUS_CHANGE: 'delivery_stage_status_change',
  },

  // Configurações Gerais
  SYSTEM: {
    SECTORS_CONFIGURATION: 'sectors_configuration',
    BASIC_MANAGEMENT: 'basic_management',
    BASIC_QUOTATIONS: 'basic_quotations',
    BASIC_SERVICE_ORDERS: 'basic_service_orders',
  },

  // Clientes e Fornecedores
  CONTACTS: {
    CLIENT_ADDITIONAL_TABS: 'client_additional_tabs',
    SUPPLIER_ADDITIONAL_TABS: 'supplier_additional_tabs',
  },
} as const

// Tipo para garantir type safety
export type FeatureKey =
  | keyof typeof FEATURES.FINANCIAL
  | keyof typeof FEATURES.SALES
  | keyof typeof FEATURES.PRODUCTS
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
  // adicionar conforme necessário...
}
