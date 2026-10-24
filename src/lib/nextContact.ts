// "Próximo contato" do orçamento (CRM fase 1, 24/10/2026): a data combinada
// com o cliente para retomar a negociação. Só o dia conta; o servidor filtra
// "para retomar" como nextContactAt <= fim de hoje.

import { todayLocalIso } from '@/lib/formatDate'

export type NextContactState = 'overdue' | 'today' | 'upcoming'

/** Dia local (AAAA-MM-DD) de uma data ISO vinda da API. */
export function nextContactDay(date?: string | null): string | null {
  if (!date) return null
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null
  return todayLocalIso(parsed)
}

export function nextContactState(
  date?: string | null,
  now = new Date(),
): NextContactState | null {
  const day = nextContactDay(date)
  if (!day) return null
  const today = todayLocalIso(now)
  if (day < today) return 'overdue'
  if (day === today) return 'today'
  return 'upcoming'
}

export const nextContactLabel: Record<NextContactState, string> = {
  overdue: 'Atrasado',
  today: 'Hoje',
  upcoming: 'Agendado',
}
