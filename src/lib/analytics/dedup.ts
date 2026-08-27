// Guarda de deduplicação de eventos de analytics (peça #2 da fundação).
//
// Garante que um evento associado a uma conta dispare UMA única vez, mesmo
// após F5, retorno à tela de sucesso, re-render do React/Next ou abertura em
// outra aba — o localStorage é compartilhado entre abas do mesmo domínio.
// Ver §5.2 e o critério "Deduplicação" do §9 do documento de medição.
//
// A `key` é um identificador opaco por conta — idealmente o event_id (UUID)
// gerado pelo backend na criação da conta. Nunca use e-mail/telefone em texto
// puro como chave: derive um hash (ver hashString em ./index).

const STORAGE_KEY = 'atrupe.analytics.firedEvents'

function readFired(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, number>) : {}
  } catch {
    // localStorage indisponível (modo privado, storage cheio) — sem dedup.
    return {}
  }
}

export function hasFired(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(readFired(), key)
}

export function markFired(key: string): void {
  if (typeof window === 'undefined') return
  try {
    const fired = readFired()
    fired[key] = Date.now()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fired))
  } catch {
    // Sem localStorage: degrada para "não deduplica" em vez de quebrar o fluxo.
  }
}
