// Espaço reservado de recurso ainda não desenvolvido (revisão de 24/09/2026)
//
// Marca, em vermelho, o lugar onde um recurso já decidido vai entrar. Serve
// para a revisão enxergar o sistema inteiro sem abrir documento: o que está
// vermelho é decisão registrada que ainda não virou tela.
//
// Temporário, como src/consts/revisao.ts: só aparece com as marcas de
// revisão ligadas (NEXT_PUBLIC_REVIEW_MARKS=on, homolog e local).
import { cn } from '@/lib/utils'
import { REVIEW_MARKS } from '@/consts/revisao'

interface Props {
  // O que vai existir ali, em uma linha
  title: string
  // O identificador da regra (CP-8, FQ-1, AP-1...), para achar a decisão
  rule?: string
  // Detalhe curto do comportamento decidido
  children?: React.ReactNode
  className?: string
}

export function ReviewTodo({ title, rule, children, className }: Props) {
  if (!REVIEW_MARKS) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-error-300 bg-error-25 p-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {rule ? (
          <span className="rounded border border-error-300 px-1.5 py-0.5 text-xs font-semibold text-error-600">
            {rule}
          </span>
        ) : null}
        <p className="text-sm font-semibold text-error-600">{title}</p>
      </div>
      {children ? (
        <div className="mt-1 text-sm text-error-600">{children}</div>
      ) : null}
    </div>
  )
}
