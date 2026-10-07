// UI component Imports
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// Larguras alternadas: linhas de esqueleto parecem texto, não uma grade
const WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-2/5', 'w-5/6']

interface TableSkeletonRowsProps {
  // Número de colunas do cabeçalho real, inclusive a de ações
  cols: number
  rows?: number
}

// Linhas de esqueleto para o <TableBody> da tabela real: o cabeçalho é o
// verdadeiro e nada troca de forma quando os dados chegam
// (design/openspec/changes/microinteracoes, Decisão 6)
export function TableSkeletonRows({ cols, rows = 8 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <TableRow key={row} className="hover:bg-transparent">
          {Array.from({ length: cols }, (_, col) => (
            <TableCell key={col}>
              <Skeleton
                className={`h-4 ${WIDTHS[(row * 3 + col) % WIDTHS.length]}`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

// Tabela inteira de esqueleto, para quando o cabeçalho real ainda não existe
// (ex.: os totais da tela ainda carregando)
export function TableSkeleton({
  cols = 5,
  rows = 8,
}: {
  cols?: number
  rows?: number
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 hover:bg-gray-50">
          {Array.from({ length: cols }, (_, col) => (
            <TableHead key={col}>
              <Skeleton className="h-4 w-16" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableSkeletonRows cols={cols} rows={rows} />
      </TableBody>
    </Table>
  )
}
