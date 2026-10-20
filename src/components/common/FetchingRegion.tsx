// Lib
import { cn } from '@/lib/utils'

// Types
import type { PropsWithChildren } from 'react'

interface Props {
  // Dados anteriores na tela enquanto os novos chegam (`isPlaceholderData`)
  isFetching?: boolean
  className?: string
}

// Recarga de listagem: os dados anteriores ficam esmaecidos, com uma barra
// fina no topo, até os novos chegarem. Os dois só aparecem após 150 ms, para
// que respostas rápidas não pisquem
// (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 6)
export function FetchingRegion({
  isFetching,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div
      aria-busy={isFetching || undefined}
      className={cn('relative', className)}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden opacity-0 transition-opacity duration-base',
          isFetching && 'opacity-100 delay-150',
        )}
      >
        {isFetching && (
          <div className="h-full w-1/4 animate-progress-indeterminate bg-brand-600" />
        )}
      </div>
      <div
        className={cn(
          'transition-opacity duration-base ease-out',
          isFetching && 'pointer-events-none opacity-60 delay-150',
        )}
      >
        {children}
      </div>
    </div>
  )
}
