'use client'

// A mesma peça em várias tiragens: o unitário cai porque as chapas e o acerto
// são do trabalho, e a máquina de menor custo pode mudar com a quantidade
// (OF-5). É a conta que a gráfica faz no "quanto maior a tiragem, menor o
// unitário"; no LITE, o mesmo efeito vem das faixas de preço (FQ-1).

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  formatBrl,
  formatCm,
  formatInt,
  rank,
  type OffsetJob,
  type OffsetMachine,
  type Paper,
} from '../calc'

const RUNS = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]

export function OffsetRuns({
  job,
  paper,
  machines,
  markup,
}: {
  job: OffsetJob
  paper: Paper
  machines: OffsetMachine[]
  markup: number
}) {
  const quantities = (
    RUNS.includes(job.quantity) ? RUNS : [...RUNS, job.quantity]
  ).sort((a, b) => a - b)
  const rows = quantities.map((quantity) => ({
    quantity,
    best: rank({ ...job, quantity }, paper, machines).viable[0],
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiragem × valor por peça</CardTitle>
        <CardDescription>
          Peça de {formatCm(job.width)} × {formatCm(job.height)} cm,{' '}
          {job.frontColors}x{job.backColors}, {paper.name}. A linha em verde é a
          quantidade do item.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Quantidade</TableHead>
              <TableHead>Máquina de menor custo</TableHead>
              <TableHead>Peças por folha</TableHead>
              <TableHead>Folhas inteiras</TableHead>
              <TableHead className="text-right">Custo fixo</TableHead>
              <TableHead className="text-right">Custo total</TableHead>
              <TableHead className="text-right">Custo por peça</TableHead>
              <TableHead className="text-right">Preço por peça</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ quantity, best }) =>
              best ? (
                <TableRow
                  key={quantity}
                  className={cn(quantity === job.quantity && 'bg-brand-50')}
                >
                  <TableCell className="font-medium text-gray-900">
                    {formatInt(quantity)}
                  </TableCell>
                  <TableCell>
                    {best.machine.name}
                    {best.workAndTurn && (
                      <Badge variant="blueLight" className="ml-2">
                        Tira e retira
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{best.piecesPerSheet}</TableCell>
                  <TableCell>{formatInt(best.fullSheets)}</TableCell>
                  <TableCell className="text-right">
                    {formatBrl(best.costs.platesCents + best.costs.setupCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBrl(best.costs.totalCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBrl(best.unitCents, 4)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-brand-700">
                    {formatBrl(best.unitCents * markup, 4)}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={quantity}>
                  <TableCell>{formatInt(quantity)}</TableCell>
                  <TableCell colSpan={7} className="text-gray">
                    A peça não cabe em nenhuma máquina.
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
        </Table>
        <p className="mt-3 text-sm text-gray">
          Custo fixo é o das chapas, da gravação e do preparo: não muda com a
          quantidade. No Lite, sem custo, a mesma queda de preço é cadastrada à
          mão nas faixas de quantidade do produto.
        </p>
      </CardContent>
    </Card>
  )
}
