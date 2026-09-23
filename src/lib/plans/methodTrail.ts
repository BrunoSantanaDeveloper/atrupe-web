/**
 * A trilha do Método Atrupe: a ordem dos planos e o que cada etapa soma.
 *
 * Conteúdo portado do protótipo (prototype/packages/dominio/src/planos.ts).
 * A REGRA da trilha (qual plano é contratável agora) não mora aqui: vem do
 * servidor, em /subscriptions/plan-states, que cruza a sequência com a
 * disponibilidade de cada plano. Aqui fica só o que a tela mostra.
 */

export const PLAN_SEQUENCE = ['START', 'LITE', 'PRO', 'ELITE', 'FULL'] as const
export type SequencePlanType = (typeof PLAN_SEQUENCE)[number]

const sequenceIndex = (planType: string) =>
  PLAN_SEQUENCE.indexOf(planType as SequencePlanType)

/** O plano que introduz o recurso o mantém nas etapas seguintes (planos cumulativos). */
export const includesFeature = (planType: string, since: SequencePlanType) =>
  sequenceIndex(planType) >= sequenceIndex(since)

/**
 * Tabela de comparação: cada recurso entra na etapa em que o Método o
 * introduz e permanece nas seguintes, formando a "escada" do que cada etapa
 * soma.
 */
export const COMPARISON_GROUPS: {
  group: string
  rows: { label: string; since: SequencePlanType }[]
}[] = [
  {
    group: 'Cadastros e organização',
    rows: [
      {
        label: 'Clientes, fornecedores, colaboradores e produtos',
        since: 'START',
      },
      { label: 'Produtos com composições básicas', since: 'LITE' },
      {
        label: 'Custos detalhados: mão de obra, materiais e equipamentos',
        since: 'PRO',
      },
    ],
  },
  {
    group: 'Financeiro',
    rows: [
      {
        label: 'Plano de contas, despesas, folha de pagamento e receitas',
        since: 'START',
      },
      {
        label: 'Separação por contas bancárias e limites de crédito',
        since: 'LITE',
      },
      { label: 'Repasse automático das taxas financeiras', since: 'LITE' },
      { label: 'Custos estimados versus realizados', since: 'FULL' },
    ],
  },
  {
    group: 'Comercial',
    rows: [
      { label: 'Orçamentos enviados e vendas realizadas', since: 'START' },
      {
        label: 'CRM: negociações em andamento e motivos de cancelamento',
        since: 'LITE',
      },
      { label: 'Histórico completo dos clientes', since: 'LITE' },
      { label: 'Identificação dos trabalhos mais lucrativos', since: 'PRO' },
    ],
  },
  {
    group: 'Produção e entrega',
    rows: [
      { label: 'Gerenciador de produção e entrega', since: 'LITE' },
      {
        label: 'Padronização de processos e delegação de funções',
        since: 'PRO',
      },
      {
        label: 'Produção integrada por setor, com medição de produtividade',
        since: 'ELITE',
      },
      {
        label:
          'Avaliação de tempos estimados versus realizados por colaborador',
        since: 'ELITE',
      },
    ],
  },
  {
    group: 'Estoque',
    rows: [
      {
        label: 'Entrada de materiais e composição detalhada dos trabalhos',
        since: 'FULL',
      },
      { label: 'Rastreio do uso real de materiais na produção', since: 'FULL' },
    ],
  },
]

export const PAYMENT_METHOD_OPTIONS = [
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de crédito',
    hint: 'Renovação automática a cada ciclo.',
  },
  { value: 'PIX', label: 'Pix', hint: 'Você recebe o código a cada cobrança.' },
  {
    value: 'BOLETO',
    label: 'Boleto',
    hint: 'Emitido a cada ciclo, com vencimento em até 3 dias úteis.',
  },
] as const
