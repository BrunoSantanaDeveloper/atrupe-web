'use client'

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
import { CardContent, CardFooter } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Components
import { Skeleton } from '@/components/ui/skeleton'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { CostCriterion, AdminExpenseAccount } from '../../types'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { costCriterionObj } from '@/consts/cost-base'

// Icons
import {
  IconPencil,
  IconInfoCircle,
  IconArrowsSplit2,
} from '@tabler/icons-react'

interface Props {
  accounts: AdminExpenseAccount[]
  isLoading?: boolean
  onEdit: (account: AdminExpenseAccount) => void
  onAllocate: (account: AdminExpenseAccount) => void
}

const valueColumns: {
  key: 'lastMonth' | 'avg3' | 'avg6' | 'avg12'
  criterion: CostCriterion
  label: string
}[] = [
  { key: 'lastMonth', criterion: 'LAST_MONTH', label: 'Último mês' },
  { key: 'avg3', criterion: 'AVG_3', label: 'Média 3 meses' },
  { key: 'avg6', criterion: 'AVG_6', label: 'Média 6 meses' },
  { key: 'avg12', criterion: 'AVG_12', label: 'Média 12 meses' },
]

// Sem histórico mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const sumReference = (accounts: AdminExpenseAccount[]) =>
  accounts.reduce((sum, account) => sum + (account.referenceValue || 0), 0)

const sumAllocated = (accounts: AdminExpenseAccount[]) =>
  accounts.reduce((sum, account) => sum + account.allocatedValue, 0)

// Lista plana, sem divisão por grupo: a divisão repetia a hierarquia do plano
// de contas, que já aparece na própria linha (decisão do time em 22/09/2026)
export function AdminExpensesData({
  accounts,
  isLoading,
  onEdit,
  onAllocate,
}: Props) {
  const allocated = sumAllocated(accounts)

  return (
    <>
      <CardContent>
        <Table className="min-w-[1040px]">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[26%] min-w-[200px]">Conta</TableHead>
              {valueColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className="w-[10%] px-3 text-right whitespace-nowrap"
                >
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-[12%]">Critério</TableHead>
              <TableHead className="w-[16%] text-right">
                <span className="inline-flex items-center gap-1">
                  Custo mensal de referência
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="O que é o custo mensal de referência"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <IconInfoCircle className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Valor usado para formar a base de custos da empresa e
                        servir de base para a distribuição por setor e a
                        precificação.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </TableHead>
              <TableHead className="w-[8%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows cols={8} />
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-sm text-gray">
                        {account.chartAccount}
                      </span>
                    </div>
                  </TableCell>
                  {valueColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        'px-3 text-right whitespace-nowrap',
                        account.criterion === column.criterion
                          ? 'text-gray-900 font-medium'
                          : 'text-gray',
                      )}
                    >
                      {formatValue(account[column.key])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Badge
                      variant={costCriterionObj[account.criterion].variant}
                      className="whitespace-nowrap"
                    >
                      {costCriterionObj[account.criterion].text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        {formatValue(account.referenceValue)}
                      </span>
                      {account.criterion === 'MANUAL' ? (
                        <span className="text-xs text-gray">
                          Informado manualmente
                        </span>
                      ) : null}
                      {/* Rateio por item (BC-8): a parte de cada setor e o que
                          sobra no administrativo */}
                      {account.allocations.length ? (
                        <>
                          <span className="text-xs text-gray">
                            {account.allocations
                              .map(
                                (share) =>
                                  `${share.sectorName} ${share.percentage.toLocaleString('pt-BR')}%`,
                              )
                              .join(' · ')}
                          </span>
                          <span className="text-xs text-gray">
                            {formatValue(account.remainder)} fica no
                            administrativo · acompanha o custo de referência
                          </span>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ActionButton
                        tooltip={
                          account.allocations.length
                            ? 'Rateio entre os setores'
                            : 'Ratear entre os setores'
                        }
                        Icon={IconArrowsSplit2}
                        onClick={() => onAllocate(account)}
                        disabled={!account.referenceValue}
                      />
                      <PermissionGate permissions={['cost:base:edit']}>
                        <ActionButton
                          tooltip="Editar critério"
                          Icon={IconPencil}
                          onClick={() => onEdit(account)}
                        />
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between text-sm text-gray">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <span>
              {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
            </span>
            <span className="text-right">
              Total:{' '}
              <span className="font-semibold text-gray-900">
                {formatCurrencyToBrl(sumReference(accounts))}
              </span>
              {allocated ? (
                <span className="block text-xs">
                  {formatCurrencyToBrl(allocated)} rateados por item ·{' '}
                  {formatCurrencyToBrl(sumReference(accounts) - allocated)} no
                  administrativo
                </span>
              ) : null}
            </span>
          </>
        )}
      </CardFooter>
    </>
  )
}
