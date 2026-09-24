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

/**
 * Como cada etapa se apresenta no card da trilha: a frase de "para quem é" e
 * o que ela entrega, como no protótipo (prototype/packages/dominio/src/planos.ts).
 *
 * O vídeo é o do site institucional, servido do próprio app (public/metodo):
 * player externo depende de licença por domínio ou de embed liberado. Só as
 * etapas que se contratam hoje têm o arquivo aqui; para as outras vale o
 * `videoUrl` cadastrado no plano, no servidor.
 */
export const PLAN_PRESENTATION: Record<
  SequencePlanType,
  {
    pitch: string
    actions: string[]
    video?: { src: string; poster: string; minutes: number }
  }
> = {
  START: {
    pitch: 'Para quem precisa sair do improviso.',
    actions: [
      'Cadastro inicial de clientes, fornecedores, colaboradores e produtos',
      'Organização financeira básica',
      'Criação do plano de contas',
      'Controle de despesas, folha de pagamento e receitas',
      'Vendas realizadas',
      'Orçamentos enviados',
      'Pagamentos recebidos/pendências financeiras',
    ],
    video: {
      src: '/metodo/plan-start.mp4',
      poster: '/metodo/plan-start.jpg',
      minutes: 5,
    },
  },
  LITE: {
    pitch: 'Para quem quer previsibilidade financeira.',
    actions: [
      'Cadastro de produtos com composições básicas',
      'Controle financeiro avançado',
      'Separação por contas bancárias',
      'Definição de limites de crédito para clientes',
      'Opção para repasse automático das taxas financeiras',
      'Introdução ao CRM (Gestão Comercial)',
      'Status das negociações em andamento',
      'Motivos dos cancelamentos registrados no sistema',
      'Gerenciador de Produção e Entrega',
      'Histórico completo dos clientes',
    ],
    video: {
      src: '/metodo/plan-lite.mp4',
      poster: '/metodo/plan-lite.jpg',
      minutes: 5,
    },
  },
  PRO: {
    pitch: 'Para quem precisa conhecer os custos.',
    actions: [
      'Cadastro detalhado de custos: mão de obra, materiais e equipamentos',
      'Identificação de trabalhos mais lucrativos e eliminação de serviços deficitários',
      'Padronização de processos de trabalho, criando fluxos claros para orçamentos e produção',
      'Delegação de funções antes centralizadas no dono da empresa baseada nesses processos',
    ],
  },
  ELITE: {
    pitch: 'Para quem precisa integrar a produção.',
    actions: [
      'Implementação do gerenciador de produção, adaptável à estrutura específica da empresa',
      'Gerenciador baseado nas composições detalhadas dos produtos criadas na Etapa 3',
      'Treinamento direcionado: cada setor aprende como usar o sistema dentro das suas funções específicas',
      'Análise avançada da produtividade, com medição precisa por setor',
      'Avaliação individual dos colaboradores com base nos tempos estimados versus realizados',
    ],
  },
  FULL: {
    pitch: 'Para quem quer controlar o estoque.',
    actions: [
      'Entrada de materiais correta no sistema',
      'Composição detalhada dos trabalhos, considerando aproveitamento e substituição de materiais na produção',
      'Integração com o gerenciamento de produção para rastrear o uso real de materiais',
      'Análise de custos estimados versus realizados, com ajustes nos processos para melhorias futuras',
    ],
  },
}

/** A etapa anterior na trilha, para o "Tudo do Start, mais:" do card. */
export const previousPlanType = (planType: string) => {
  const index = PLAN_SEQUENCE.indexOf(planType as SequencePlanType)
  return index > 0 ? PLAN_SEQUENCE[index - 1] : null
}
