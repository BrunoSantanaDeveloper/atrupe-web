'use client'

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// UI
import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'

// Icons
import { IconReceipt, IconExternalLink } from '@tabler/icons-react'

// Utils
import { formatToLocaleDate } from '@/lib/formatDate'
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface Payment {
  id: string
  dueDate: string
  value: number
  status: string
  billingType: string
  paymentDate?: string | null
  confirmedDate?: string | null
  invoiceUrl?: string | null
  subscription?: {
    additionalUsers: number
    plan: { name: string; basePrice: number }
    /** Em nome de quem a cobrança foi gerada. */
    customer?: { name: string; document: string } | null
  }
}

interface PaymentsTableProps extends SearchParamsType {
  payments: Payment[]
  lastPage: number
  /**
   * O ambiente já foi transferido: cada cobrança mostra o titular que a gerou
   * — as de antes da transferência continuam no nome dele.
   */
  showHolder?: boolean
}

const paymentStatusMap: Record<
  string,
  { label: string; variant: BadgeProps['variant'] }
> = {
  PENDING: { label: 'Disponível', variant: 'blueLight' },
  CONFIRMED: { label: 'Paga', variant: 'successLight' },
  RECEIVED: { label: 'Paga', variant: 'successLight' },
  OVERDUE: { label: 'Atrasada', variant: 'errorLight' },
  REFUNDED: { label: 'Reembolsada', variant: 'warningLight' },
  CANCELED: { label: 'Cancelada', variant: 'neutralLight' },
  FAILED: { label: 'Falhou', variant: 'errorLight' },
}

export function PaymentsTable({
  payments,
  lastPage,
  searchParams,
  showHolder = false,
}: PaymentsTableProps) {
  if (!payments.length) {
    return (
      <Card>
        <CardContent>
          <ListDataTotalEmpty
            icon={IconReceipt}
            title="Nenhum pagamento encontrado"
            description="Os pagamentos da assinatura aparecerão aqui."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Vencimento</TableHead>
              <TableHead>Plano</TableHead>
              {showHolder && <TableHead>Titular</TableHead>}
              <TableHead>Usuários</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const statusInfo =
                paymentStatusMap[payment.status] || paymentStatusMap.PENDING

              const canPay =
                (payment.status === 'PENDING' ||
                  payment.status === 'OVERDUE') &&
                payment.invoiceUrl

              return (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {formatToLocaleDate(payment.dueDate)}
                  </TableCell>
                  <TableCell>
                    {payment.subscription?.plan?.name || '-'}
                  </TableCell>
                  {showHolder && (
                    <TableCell className="max-w-[220px] truncate">
                      {payment.subscription?.customer?.name || '-'}
                    </TableCell>
                  )}
                  <TableCell>
                    {payment.subscription?.additionalUsers || 0}
                  </TableCell>
                  <TableCell>
                    <Badge status variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatToLocaleDate(
                      payment.confirmedDate || payment.paymentDate || undefined,
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrencyToBrl(payment.value * 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    {canPay ? (
                      <Button
                        asChild
                        variant="successOutline"
                        size="sm"
                        RightIcon={IconExternalLink}
                      >
                        <a
                          href={payment.invoiceUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Pagar
                        </a>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <TablePagination searchParams={searchParams} lastPage={lastPage} />
      </CardFooter>
    </Card>
  )
}
