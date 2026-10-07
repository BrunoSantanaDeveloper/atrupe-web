import { cn } from '@/lib/utils'

// `bg-gray-200` se distingue do fundo da página (`gray-100`) e do cartão, sem
// `mix-blend-multiply`, que escurece demais sobre fundos escuros. A animação
// atrasa a entrada para que cargas rápidas não pisquem
// (design/openspec/changes/microinteracoes, Decisão 2)
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-skeleton rounded-md bg-gray-200', className)}
      {...props}
    />
  )
}

export { Skeleton }
