const defaultRoute: { [key: string]: string } = {
  // auth
  meRoute: '/user/me',

  // configurações de venda
  saleSeriesRoute: '/sale/series',
  quotationStatusRoute: '/sale/status',
  cancelReasonRoute: '/cancel-reason',
  sellerProfileRoute: '/profile',
  sellerProfileEmployeeRoute: '/profile/employees', // Colaboradores sem perfil de vendedor

  // configurações de financeiro
  bankRoute: '/bank',
  bankAccountRoute: '/bank/account',
  paymentMethodRoute: '/payment/method',
  paymentConditionRoute: '/payment/condition',
  downPaymentConditionRoute: '/payment/condition/down-condition',
  accountsPlanTotalsRoute: '/financial/nature/quantity',
  accountsPlanRoute: '/financial/nature',
  fixedExpensesConfigRoute: '/financial/scheduled-expense',
  listFixedExpensesConfigRoute:
    '/financial/scheduled-expense/by-level1/payable',
  fixedExpensesConfigTotalsRoute: '/financial/scheduled-expense/quantity',
  payrollConfigRoute: '/financial/salaries',

  // orçamentos
  sellersRoute: '/sellers',
  quotationTotalsRoute: '/sale/quotation/quantity',
  quotationRoute: '/sale/quotation',
  deliveryInfoRoute: '/quotation/delivery',
  paymentConditionsRoute: '/quotation/payment',
  commissionRoute: '/quotation/payment/commission',

  // ordem de serviço
  orderTotalsRoute: '/sale/order/quantity',
  orderRoute: '/sale/order',

  // produtos
  productTotalsRoute: '/product/quantity',
  productRoute: '/product',
  productGroupTotalsRoute: '/category/quantity',
  productGroupTotalsRouteBySector: '/category/by-sector',
  categoryRouteBySector: '/category/by-sector',
  productGroupRoute: '/category',

  // cliente
  clientTotalsRoute: '/client/quantity',
  clientRoute: '/client',
  clientCategoryRoute: '/client/category',

  // fornecedor
  supplierRoute: '/supplier',

  // financeiro
  finFlowTotalsRoute: '/financial/flow/totals',
  finFlowListRoute: '/financial/flow',
  receivableRoute: '/financial/receivable',
  payableRoute: '/financial/payable',
  creditLimitRoute: '/financial/credit-limit',
  transactionCategoryRoute: '/financial/nature/sub-category',
  bankMethodRoute: '/bank/method', // /bank/method/:methodId
  fixedExpensesListRoute: '/financial/scheduled-expense/grouped-by-supplier',

  // Controle de caixa
  cashControlTotalsRoute: '/financial/cash-control/quantity',
  cashControlRoute: '/financial/cash-control',

  // agenda de entrega
  deliveryScheduleTotalsRoute: '/sale/delivery-schedule/quantity',
  deliveryScheduleRoute: '/sale/delivery-schedule',
  productionStage: '/sale/production-stage',
  deliveryScheduleBillingRoute: '/sale/delivery-schedule/bill',
  deliveryScheduleFinishRoute: '/sale/delivery-schedule/finish',

  // colaboradores e usuários
  employeeTotalsRoute: '/employee/quantity',
  employeeRoute: '/employee',
  roleRoute: '/role',
  userRoute: '/user',

  // assinaturas e planos
  planSubscriptionRoute: '/plan/subscription',

  sectorRoute: '/sector',
  sectorWithProductsRoute: '/sector/with-products',
  contactRoute: '/contact',
  finFlowRoute: '/financial/flow',
  finCashControlRoute: '/financial/cash-control',
  finScheduledExpenseRoute: '/financial/scheduled-expense',
  finInvoiceRoute: '/financial/invoice',
  categoryRoute: '/category',
  unitOfMeasureRoute: '/unit-of-measure',
  statesRoute: '/utils/states',
  citiesRoute: '/utils/cities',
  checkCpfRoute: '/user/check/doc',
  checkCnpjRoute: '/company/check',
  checkZipcodeRoute: '/address/zipcode',

  sellerProfileTotalsRoute: '/seller/profile',
  sellerProfilesRoute: '/seller/profile',

  uploadFileRoute: '/file/upload-image',
}

export function defaultRoutes() {
  return defaultRoute
}
