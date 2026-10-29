'use client'

// A pessoa com cara no gerenciador (29/10/2026): no quadro coletivo, quem
// está disponível e quem está na tarefa aparecia só pelo nome. As iniciais
// numa cor fixa por pessoa dão identidade ao cartão arrastável e à linha da
// pessoa na tarefa. Quando o colaborador tiver foto, ela entra no lugar.

// UI
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Utils
import { cn } from '@/lib/utils'

// Seis cores dos tokens, escolhidas pelo nome: a mesma pessoa tem sempre a
// mesma cor, em qualquer tela
const COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-success-100 text-success-700',
  'bg-warning-100 text-warning-700',
  'bg-error-100 text-error-700',
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
]

export const personColor = (name: string) => {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 9973
  return COLORS[hash % COLORS.length]
}

export const initialsOf = (name: string) => {
  // Só as palavras que começam com letra: "Produção (teste)" dá "P", não "P("
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part))
  if (!parts.length) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return `${first}${last}`.toUpperCase()
}

export function PersonAvatar({
  name,
  imageUrl,
  size = 'md',
  className,
}: {
  name: string
  imageUrl?: string | null
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <Avatar
      className={cn(
        'shrink-0',
        size === 'sm' ? 'size-6 text-xs' : 'size-9 text-sm',
        className,
      )}
      title={name}
    >
      {imageUrl ? <AvatarImage src={imageUrl} alt={name} /> : null}
      <AvatarFallback className={cn('font-semibold', personColor(name))}>
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  )
}
