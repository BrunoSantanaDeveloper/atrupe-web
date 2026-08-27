// Camada única de despacho de analytics (peça #1 da fundação).
//
// TODO disparo de evento (GA4 via GTM, OpenAI Pixel) passa por aqui — nunca
// chame window.dataLayer/oaiq direto de componentes. Isso centraliza:
//   - consentimento: um único ponto de decisão (isTrackingAllowed)
//   - deduplicação: garantia de disparo único por conta (./dedup)
//   - debug: log opt-in por ambiente para a validação em homolog
// Ver §5.1 do documento de medição ("centralizar GA4 sign_up, Meta e OpenAI
// no mesmo handler de sucesso").
//
// NÃO enviar dados pessoais (nome, e-mail, telefone, CNPJ/CPF, endereço) em
// nenhum payload — apenas eventos e parâmetros não sensíveis.

import { hasFired, markFired } from './dedup'
import { TRACKING } from '@/config/tracking'

// --- Tipagem global dos SDKs de tag ----------------------------------------
type DataLayerEvent = Record<string, unknown>
type Oaiq = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
    oaiq?: Oaiq
  }
}

// --- Consentimento (seam) ---------------------------------------------------
// Ponto ÚNICO de decisão de consentimento. Hoje retorna true, preservando o
// comportamento atual (GTM/GA4 já disparam sem gating no projeto). Quando um
// mecanismo central de consentimento for adotado, ligue-o AQUI — não espalhe
// checagens pelos disparos (§4.2: não criar lógica paralela sem alinhamento).
export function isTrackingAllowed(): boolean {
  return true
}

// --- Debug (seam) -----------------------------------------------------------
// A flag vem da config central (peça #4): liga em não-produção para a validação
// do §8 ("debug habilitado apenas durante o teste"); silencioso em produção.
function debug(...args: unknown[]): void {
  if (TRACKING.debug) console.info('[analytics]', ...args)
}

// --- Hash não-cripto para derivar chave de dedup sem expor PII --------------
// Determinístico e síncrono (cyrb53). A saída NÃO é transmitida a lugar nenhum:
// serve apenas como chave local de deduplicação enquanto ainda não há event_id
// do backend. Nunca use e-mail/telefone em texto puro como chave (§5.2).
export function hashString(input: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

// --- Dispatchers de baixo nível --------------------------------------------
function pushToDataLayer(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(event)
  debug('dataLayer <-', event)
}

function measureOpenAI(eventName: string, eventId: string): void {
  if (typeof window === 'undefined') return
  if (typeof window.oaiq !== 'function') {
    // Pixel OpenAI ainda não instalado (peça #5). Não é erro: o disparo GA4
    // segue valendo e o OpenAI passa a funcionar assim que o pixel existir.
    debug('oaiq ausente — evento OpenAI', eventName, 'ignorado')
    return
  }
  window.oaiq(
    'measure',
    eventName,
    { type: 'customer_action' },
    { event_id: eventId },
  )
  debug('oaiq <-', eventName, { event_id: eventId })
}

function generateEventId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  // Fallback improvável (navegador antigo / contexto inseguro).
  return `evt_${hashString(`${Date.now()}_${Math.random()}`)}`
}

// --- Atribuição -------------------------------------------------------------
// Parâmetros de campanha capturados na entrada do funil (peça #3). Apenas
// dados NÃO pessoais: oppref e utm_*. Ver §6 do documento de medição.
export interface Attribution {
  oppref: string | null
  utm: Record<string, string>
}

// Achata a atribuição em chaves planas (oppref, utm_source, ...), mais fáceis
// de mapear como Data Layer Variables no GTM. Omite valores vazios.
function attributionToParams(
  attribution?: Attribution,
): Record<string, string> {
  if (!attribution) return {}
  const params: Record<string, string> = {}
  if (attribution.oppref) params.oppref = attribution.oppref
  for (const [key, value] of Object.entries(attribution.utm)) {
    if (value) params[key] = value
  }
  return params
}

// --- API pública ------------------------------------------------------------
export interface RegistrationCompletedParams {
  /**
   * Chave opaca de deduplicação por conta. Passe o event_id do backend quando
   * existir; enquanto não existir, derive de hashString(email) no chamador.
   */
  dedupKey: string
  /**
   * event_id (UUID) gerado pelo backend na criação da conta (§5.2). É enviado
   * ao OpenAI Pixel e reutilizável pela Conversions API futura. Se omitido, um
   * id client-side é gerado como fallback interino.
   */
  eventId?: string
  /**
   * Atribuição (oppref + UTMs) capturada na entrada do funil, para vincular ao
   * cadastro concluído no GA4/relatórios internos (§6.2).
   */
  attribution?: Attribution
}

/**
 * Dispara o conjunto de eventos de "cadastro concluído" — GA4 `sign_up` e
 * OpenAI `registration_completed` — exatamente uma vez por conta.
 *
 * Deve ser chamado SOMENTE no callback de sucesso do backend que confirma a
 * criação da conta (§5.1). Não chamar em etapas intermediárias, erro, timeout
 * ou reenvio.
 */
export function trackRegistrationCompleted(
  params: RegistrationCompletedParams,
): void {
  if (typeof window === 'undefined') return

  const { dedupKey, attribution } = params
  const eventId = params.eventId ?? generateEventId()

  if (!isTrackingAllowed()) {
    debug('consentimento negado — nenhum evento disparado')
    return
  }

  if (hasFired(dedupKey)) {
    debug('já disparado para', dedupKey, '— ignorando (dedup)')
    return
  }

  // Marca ANTES do disparo para fechar a janela de corrida entre abas.
  markFired(dedupKey)

  // GA4 (via GTM) — mantém o evento sign_up já usado pela Atrupe, agora com a
  // atribuição vinculada ao cadastro (§6.2).
  pushToDataLayer({
    event: 'sign_up',
    method: 'free_trial',
    ...attributionToParams(attribution),
  })

  // OpenAI Pixel — registration_completed (no-op até o pixel ser instalado).
  measureOpenAI('registration_completed', eventId)

  debug('cadastro concluído rastreado', { dedupKey, eventId, attribution })
}
