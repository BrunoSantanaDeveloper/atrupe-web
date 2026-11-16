'use client'

// O financeiro da locação no LITE (LC-12 e LC-3 no caixa, 16/11/2026): os
// contratos em andamento com a cobrança mensal, o aviso dos que vencem, as
// despesas do ponto ligadas ao bem e o resultado de caixa de cada bem. O
// resultado completo, com depreciação e ocupação, é do PRO.

import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ASSETS,
  PRODUCTS,
  RESERVATIONS,
  daysBetween,
  formatBrl,
  formatDate,
  today,
} from '../data'

// Avisa com esta antecedência que o contrato vai vencer
const RENEWAL_DAYS = 15

export function RentalFinance() {
  const [ended, setEnded] = useState<string[]>([])

  const contracts = RESERVATIONS.filter(
    (reservation) => reservation.status === 'APPROVED',
  ).map((reservation) => {
    const product = PRODUCTS.find((item) => item.id === reservation.productId)
    // Dias que faltam, contando hoje
    const left = daysBetween(today(), reservation.end)
    return { reservation, product, left }
  })

  const cash = ASSETS.map((asset) => {
    const paid = asset.fixedCosts.reduce(
      (sum, cost) => sum + cost.monthlyCents,
      0,
    )
    return { asset, received: asset.revenueCents, paid }
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contratos de locação</CardTitle>
          <CardDescription>
            Financeiro › Contratos de locação. Cada contrato aprovado, a
            cobrança dele em Contas a receber e o aviso de quem está para
            vencer.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Bem</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map(({ reservation, product, left }) => {
                const isEnded = ended.includes(reservation.id)
                const started = reservation.start <= today()
                // Só o contrato longo e já em andamento pede renovação
                const expiring =
                  !isEnded &&
                  started &&
                  left <= RENEWAL_DAYS &&
                  daysBetween(reservation.start, reservation.end) >= 30
                return (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium text-gray-900">
                      {product?.name}
                    </TableCell>
                    <TableCell>{reservation.client}</TableCell>
                    <TableCell>
                      {formatDate(reservation.start)} a{' '}
                      {formatDate(isEnded ? today() : reservation.end)}
                    </TableCell>
                    <TableCell>
                      {reservation.monthlyCents
                        ? `${formatBrl(reservation.monthlyCents)} por mês`
                        : 'Pela condição do orçamento'}
                    </TableCell>
                    <TableCell>
                      {isEnded ? (
                        <Badge variant="neutralLight">
                          Encerrado · parcelas futuras canceladas
                        </Badge>
                      ) : expiring ? (
                        <Badge variant="warningLight">
                          Vence em {left} {left === 1 ? 'dia' : 'dias'}
                        </Badge>
                      ) : !started ? (
                        <Badge variant="blueLight">
                          Começa em {formatDate(reservation.start)}
                        </Badge>
                      ) : (
                        <Badge variant="successLight">Em andamento</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!isEnded && (
                        <div className="flex justify-end gap-2">
                          {expiring && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                toast.success(
                                  'Na tela real, abre um novo orçamento com o mesmo bem a partir do dia seguinte ao fim.',
                                )
                              }
                            >
                              Renovar
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="neutralOutline"
                            onClick={() => {
                              setEnded((current) => [
                                ...current,
                                reservation.id,
                              ])
                              toast.success(
                                'Contrato encerrado hoje: o bem ficou livre e as parcelas que ainda não venceram foram canceladas.',
                              )
                            }}
                          >
                            Encerrar contrato
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado de caixa por bem, neste mês</CardTitle>
          <CardDescription>
            O que cada bem recebeu de locação e o que pagou de despesas do
            ponto. A despesa entra aqui quando o lançamento de Contas a pagar
            indica o bem (o aluguel do terreno, a energia do painel).
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Bem</TableHead>
                <TableHead>Despesas do ponto</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">Resultado de caixa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cash.map(({ asset, received, paid }) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium text-gray-900">
                    {asset.name}
                  </TableCell>
                  <TableCell className="text-gray">
                    {asset.fixedCosts.map((cost) => cost.name).join(', ')}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBrl(received)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBrl(paid)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold',
                      received - paid >= 0
                        ? 'text-success-700'
                        : 'text-error-700',
                    )}
                  >
                    {formatBrl(received - paid)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 text-sm text-gray">
            É o caixa do mês, sem o desgaste do bem. No Pro, o resultado por bem
            inclui a depreciação e mostra a ocupação.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
