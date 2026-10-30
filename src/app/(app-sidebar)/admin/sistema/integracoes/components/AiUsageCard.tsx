'use client'

// O consumo do assistente por empresa no mês (seção 9 do documento de
// 28/10/2026; só o superadmin): mensagens, tokens, custo em dólar e as
// propostas feitas e aplicadas.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconRobot } from '@tabler/icons-react'

import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { getAiUsage } from '@/actions/ai-chat'

const currentMonth = () => new Date().toISOString().slice(0, 7)
const int = (value: number) => value.toLocaleString('pt-BR')
const usd = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })
const pct = (value: number | null) =>
  value === null ? '-' : `${Math.round(value * 100)}%`

export function AiUsageCard() {
  const [month, setMonth] = useState(currentMonth())
  const { data, isLoading } = useQuery({
    queryKey: ['ai-usage', month],
    queryFn: () => getAiUsage(month),
    enabled: /^\d{4}-\d{2}$/.test(month),
  })
  const usage = data?.data

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <Icon icon={IconRobot} size="md" className="text-brand-600" />
            <CardTitle>Consumo do assistente</CardTitle>
          </div>
          <CardDescription>
            Mensagens, tokens, custo e propostas por empresa no mês. O custo é o
            do provedor, em dólar.
          </CardDescription>
        </div>
        <Input
          type="month"
          aria-label="Mês"
          className="w-[170px]"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {usage && (
          <p className="mb-3 text-sm text-gray">
            {int(usage.totals.companies)} empresa(s) ·{' '}
            {int(usage.totals.messages)} mensagens ·{' '}
            {int(usage.totals.promptTokens + usage.totals.completionTokens)}{' '}
            tokens · {usd(usage.totals.costUsd)} ·{' '}
            {int(usage.totals.actionsApplied)} de{' '}
            {int(usage.totals.actionsProposed)} propostas aplicadas
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Empresa</TableHead>
              <TableHead numeric>Mensagens</TableHead>
              <TableHead numeric>Tokens</TableHead>
              <TableHead numeric>Custo</TableHead>
              <TableHead numeric>Propostas</TableHead>
              <TableHead numeric>Aplicadas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={6} />
            ) : usage?.companies.length ? (
              usage.companies.map((row) => (
                <TableRow key={row.companyId}>
                  <TableCell>{row.companyName || row.companyId}</TableCell>
                  <TableCell className="text-right">
                    {int(row.messages)}
                  </TableCell>
                  <TableCell className="text-right">
                    {int(row.promptTokens + row.completionTokens)}
                  </TableCell>
                  <TableCell className="text-right">
                    {usd(row.costUsd)}
                  </TableCell>
                  <TableCell className="text-right">
                    {int(row.actionsProposed)}
                  </TableCell>
                  <TableCell className="text-right">
                    {int(row.actionsApplied)} ({pct(row.applyRate)})
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray">
                  {data && !data.success
                    ? data.message
                    : 'Nenhum consumo neste mês.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
