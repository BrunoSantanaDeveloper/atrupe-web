'use client'

// As vendas rápidas de hoje (VR-9, 11/11/2026): uma tela pouco usada, para o
// vendedor e o caixa conferirem o que saiu no balcão, sem mexer na lista de
// orçamentos. Abre pelo botão "Vendas de hoje" da venda rápida e da frente
// de caixa; o botão "voltar" leva de volta a quem abriu.
//
// Limites até o backend: a lista vem da de orçamentos (criadas hoje, filtrada
// pela venda rápida no front), sem a hora da venda, sem saber se a enviada ao
// caixa já foi recebida e sem o grupo "Devolvidas pelo caixa". Com a venda
// ligada à sessão do caixa, a tela passa a mostrar o caixa aberto e, fechado
// o caixa, as vendas ficam no histórico dele.

// Next
import Link from 'next/link'

// Components
import { Topbar, type TabNavType } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { formatToWeekDate } from '@/lib/formatDate'
// Em centavos, como o formatCurrencyToBrl espera
import { getQuotationFinalValue } from '../../orcamentos/components/Quotations'

// Hooks
import { usePermissions } from '@/hooks/usePermissions'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type {
  QuotationType,
  ListQuotationsDataType,
} from '@/types/sales/quotation'

// Na venda rápida não há Aguardando: aprova ou é descartada (VR-8). A que
// ficou concluída antes disso aparece como aguardando, para não sumir
const situation: Record<
  string,
  { text: string; variant: 'neutralLight' | 'successLight' | 'errorLight' }
> = {
  OPEN: { text: 'Em digitação', variant: 'neutralLight' },
  APPROVED: { text: 'Aprovada', variant: 'successLight' },
  REJECTED: { text: 'Rejeitada no caixa', variant: 'errorLight' },
  DONE: { text: 'Aguardando', variant: 'neutralLight' },
  PENDING_PAYMENT: { text: 'Pendente de pagamento', variant: 'neutralLight' },
  OVERDUE: { text: 'Aguardando', variant: 'neutralLight' },
}

const tabStatus: Record<string, string[]> = {
  digitacao: ['OPEN'],
  aprovadas: ['APPROVED'],
  rejeitadas: ['REJECTED'],
}

// Limite da lista de um dia: a de orçamentos é paginada, e o balcão de uma
// gráfica não passa disso num dia
const DAY_LIMIT = '300'

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  // O servidor leva a data final ao fim do dia dela: agora basta
  return { startDate: start.toISOString(), endDate: new Date().toISOString() }
}

// O dia local (AAAA-MM-DD): a data do cabeçalho é lida em UTC, e depois das
// 21h o ISO de agora já é o dia seguinte
function localDay() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function TodayQuickSales({ searchParams }: SearchParamsType) {
  const aba = (searchParams?.aba as string) || 'todas'
  const { hasAllPermissions } = usePermissions()
  const canViewValues = hasAllPermissions(['values:values:view'])

  // Volta para quem abriu: a frente de caixa ou a venda rápida
  const previousPage =
    searchParams?.de === 'caixa'
      ? '/financeiro/frente-de-caixa'
      : searchParams?.venda
        ? `/vendas/orcamentos/${searchParams.venda}`
        : undefined

  // A lista de orçamentos sem situação deixa as aprovadas de fora (elas são
  // as ordens de serviço): as aprovadas vêm numa segunda consulta
  const { data, isLoading } = useQuery({
    queryKey: ['quick-sales-today'],
    queryFn: async () => {
      const filters = { ...todayRange(), page: '1', limit: DAY_LIMIT }
      const [others, approved] = await Promise.all([
        getData({ route: '/sale/quotation', filters }),
        getData({
          route: '/sale/quotation',
          filters: { ...filters, status: 'APPROVED' },
        }),
      ])
      return [...(others?.data || []), ...(approved?.data || [])]
    },
    refetchInterval: 30000,
  })

  const groups: ListQuotationsDataType[] = data || []
  const sales: QuotationType[] = groups
    .flatMap((group) => group.quotations || [])
    .filter((quotation) => quotation?.quickSale)

  const count = (key: string) =>
    sales.filter((sale) => tabStatus[key].includes(sale.status)).length
  const visible =
    aba in tabStatus
      ? sales.filter((sale) => tabStatus[aba].includes(sale.status))
      : sales

  const approved = sales.filter((sale) => sale.status === 'APPROVED')
  const approvedTotal = approved.reduce(
    (acc, sale) => acc + getQuotationFinalValue(sale),
    0,
  )

  const tabs: TabNavType[] = [
    { value: 'todas', tab: 'todas', label: 'Todas', count: sales.length },
    {
      value: 'digitacao',
      tab: 'digitacao',
      label: 'Em digitação',
      count: count('digitacao'),
    },
    {
      value: 'aprovadas',
      tab: 'aprovadas',
      label: 'Aprovadas',
      count: count('aprovadas'),
    },
    {
      value: 'rejeitadas',
      tab: 'rejeitadas',
      label: 'Rejeitadas no caixa',
      count: count('rejeitadas'),
    },
  ]

  return (
    <div className="space-y-5">
      <Topbar
        title="Vendas de hoje"
        supportText={formatToWeekDate(localDay())}
        previousPage={previousPage}
        tabs={tabs}
        activeTab={aba}
        paramName="aba"
        countsLoading={isLoading}
      />
      {!isLoading && approved.length ? (
        <p className="text-sm text-gray">
          {approved.length}{' '}
          {approved.length === 1 ? 'venda aprovada' : 'vendas aprovadas'}
          {canViewValues ? ` · ${formatCurrencyToBrl(approvedTotal)}` : ''}
        </p>
      ) : null}
      <Card className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Venda</TableHead>
                <PermissionGate permissions={['values:values:view']}>
                  <TableHead>Valor</TableHead>
                </PermissionGate>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={2 + Number(canViewValues)} />
              ) : visible.length ? (
                visible.map((sale) => {
                  const reference = `${sale?.serie?.quotation || ''}-${sale?.serie?.code || ''}`
                  const link = `/vendas/orcamentos/${sale.id}`
                  const state = situation[sale.status] || {
                    text: sale.status,
                    variant: 'neutralLight' as const,
                  }
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <p className="font-medium">
                          {sale?.client?.name || 'Cliente não informado'}
                        </p>
                        <Link
                          href={link}
                          className="text-gray hover:opacity-80 transition-opacity"
                        >
                          Venda rápida #{reference}
                        </Link>
                      </TableCell>
                      <PermissionGate permissions={['values:values:view']}>
                        <TableCell>
                          {formatCurrencyToBrl(getQuotationFinalValue(sale))}
                        </TableCell>
                      </PermissionGate>
                      <TableCell>
                        <Badge status variant={state.variant}>
                          {state.text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2 + Number(canViewValues)}
                    className="py-10 text-center text-sm text-gray"
                  >
                    {sales.length
                      ? 'Nenhuma venda nesta situação hoje.'
                      : 'Nenhuma venda rápida hoje.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
