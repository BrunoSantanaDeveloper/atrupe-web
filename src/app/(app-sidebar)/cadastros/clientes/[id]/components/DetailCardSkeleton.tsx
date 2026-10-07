// React
import { Fragment } from 'react'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

// Primeira carga do detalhe no formato do DetailCard (ícone, título e linhas
// de rótulo e valor), no lugar de um bloco cinza único
// (design/openspec/changes/microinteracoes)
export function DetailCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="w-full pb-4">
      <CardHeader>
        <div className="flex gap-3 items-center">
          <Skeleton className="size-10 rounded-10" />
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <Separator className="my-4" />
      <CardContent>
        {Array.from({ length: rows }, (_, row) => (
          <Fragment key={row}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
              {Array.from({ length: 4 }, (_, col) => (
                <div key={col} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
            {row < rows - 1 && <Separator className="my-4" />}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  )
}
