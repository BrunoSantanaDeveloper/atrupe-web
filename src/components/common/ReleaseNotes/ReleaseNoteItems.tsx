'use client'

// As mudanças de uma atualização (19/11/2026), agrupadas: o que é novo, o que
// melhorou e o que foi corrigido. Usada no aviso do painel e na página
// Novidades.

import { Badge } from '@/components/ui/badge'

import type {
  ReleaseItemKind,
  ReleaseNote,
} from '@/hooks/queries/useReleaseNotes'

const KIND: Record<
  ReleaseItemKind,
  { label: string; variant: 'successLight' | 'blueLight' | 'neutralLight' }
> = {
  NEW: { label: 'Novo', variant: 'successLight' },
  IMPROVEMENT: { label: 'Melhoria', variant: 'blueLight' },
  FIX: { label: 'Correção', variant: 'neutralLight' },
}

const ORDER: ReleaseItemKind[] = ['NEW', 'IMPROVEMENT', 'FIX']

export function ReleaseNoteItems({ items }: { items: ReleaseNote['items'] }) {
  const sorted = [...(items ?? [])].sort(
    (a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind),
  )
  if (!sorted.length) return null
  return (
    <ul className="space-y-2">
      {sorted.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-sm">
          <Badge
            variant={KIND[item.kind]?.variant ?? 'neutralLight'}
            className="mt-0.5 shrink-0"
          >
            {KIND[item.kind]?.label ?? item.kind}
          </Badge>
          <span className="text-gray-700">{item.text}</span>
        </li>
      ))}
    </ul>
  )
}
