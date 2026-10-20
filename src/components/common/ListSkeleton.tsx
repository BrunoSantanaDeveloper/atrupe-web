// UI
import { Skeleton } from '@/components/ui/skeleton'
import { CardContent, CardFooter, CardHeader } from '@/components/ui/card'

// Components
import { TableSkeleton } from './TableSkeleton'

interface Props {
  cols?: number
  rows?: number
  // Quantos filtros a barra de filtros tem (fora a busca)
  filters?: number
}

// Primeira carga de uma listagem dentro do <Card>: barra de filtros, tabela e
// paginação no formato final, no lugar do bloco cinza de tela inteira
// (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 6)
export function ListSkeleton({ cols = 6, rows = 8, filters = 1 }: Props) {
  return (
    <>
      <CardHeader className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
        <div className="flex flex-wrap gap-4 items-end">
          {Array.from({ length: filters }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-48" />
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-64" />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
      </CardHeader>
      <CardContent>
        <TableSkeleton cols={cols} rows={rows} />
      </CardContent>
      <CardFooter>
        <div aria-hidden="true" className="h-10" />
      </CardFooter>
    </>
  )
}
