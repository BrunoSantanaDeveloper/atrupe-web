'use client'

// Os focos da aba Aguardando (CRM-2, 27/10/2026): a visão do dia do
// vendedor. "Para retomar" (contato até hoje ou proposta vencendo em 2
// dias), "Sem próximo contato" (negociação parada, sem próxima ação) e
// "Vencendo". Vem do que os CRMs chamam de "deals sem próxima atividade":
// o que está parado tem que saltar aos olhos, sem quadro kanban.

import { useRouter } from '@/hooks/useRouter'
import { cn } from '@/lib/utils'
import type { SearchParamsType } from '@/types/coreTypes'

export type AwaitingFocusKey = 'retomar' | 'sem-contato' | 'vencendo'

// O foco da tela vira o parâmetro da API
export function focusParam(foco?: string): { nextContact?: string } {
  if (foco === 'retomar') return { nextContact: 'due' }
  if (foco === 'sem-contato') return { nextContact: 'none' }
  if (foco === 'vencendo') return { nextContact: 'expiring' }
  return {}
}

const options: {
  key: AwaitingFocusKey | ''
  label: string
  count: 'todos' | 'retomar' | 'semContato' | 'vencendo'
  tone?: 'error' | 'warning'
}[] = [
  { key: '', label: 'Todos', count: 'todos' },
  { key: 'retomar', label: 'Para retomar', count: 'retomar', tone: 'error' },
  {
    key: 'sem-contato',
    label: 'Sem próximo contato',
    count: 'semContato',
    tone: 'warning',
  },
  { key: 'vencendo', label: 'Vencendo', count: 'vencendo', tone: 'warning' },
]

export function AwaitingFocus({
  searchParams,
  counts,
}: SearchParamsType & {
  counts: Partial<
    Record<'todos' | 'retomar' | 'semContato' | 'vencendo', number>
  >
}) {
  const router = useRouter()
  const current = (searchParams?.foco as string) || ''

  const choose = (key: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>)
    if (key) params.set('foco', key)
    else params.delete('foco')
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-6 py-3"
      role="tablist"
      aria-label="Foco da aba Aguardando"
    >
      {options.map((option) => {
        const selected = current === option.key
        const count = counts[option.count]
        return (
          <button
            key={option.key || 'todos'}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => choose(option.key)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              selected
                ? 'border-brand-500 bg-brand-25 font-medium text-brand-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
          >
            {option.label}
            {typeof count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs font-medium',
                  selected
                    ? 'bg-brand-100 text-brand-700'
                    : option.tone === 'error' && count > 0
                      ? 'bg-error-50 text-error-700'
                      : option.tone === 'warning' && count > 0
                        ? 'bg-warning-50 text-warning-700'
                        : 'bg-gray-100 text-gray-600',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
