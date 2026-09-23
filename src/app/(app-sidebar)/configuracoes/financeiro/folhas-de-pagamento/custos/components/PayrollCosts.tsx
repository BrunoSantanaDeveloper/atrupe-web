'use client'

// React / Next
import { Fragment, useState } from 'react'

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
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { EmployeeCostModal } from './EmployeeCostModal'
import { ChargePercentsModal } from './ChargePercentsModal'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { PayrollEmployee } from '../types'

// Actions
import { getPayrollCosts } from '@/actions/payroll-costs'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { contractTypeObj, payrollChargeObj } from '@/consts/payroll-costs'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconUsers,
  IconPencil,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

export function PayrollCosts({ searchParams }: SearchParamsType) {
  const [expanded, setExpanded] = useState<string[]>([])
  const [editing, setEditing] = useState<PayrollEmployee>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-costs', searchParams],
    queryFn: () => getPayrollCosts({ filters: searchParams }),
  })

  const employees = data?.data?.employees || []
  const percents = data?.data?.percents

  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  const total = employees.reduce((sum, employee) => sum + employee.totalCost, 0)

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Custos da folha"
          previousPage="/configuracoes/financeiro/folhas-de-pagamento"
          supportText="Custo completo de cada colaborador, que alimenta o custo do setor"
          primaryCta={
            <PermissionGate permissions={['financial_settings:payroll:edit']}>
              <ChargePercentsModal percents={percents} />
            </PermissionGate>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Custo por colaborador</CardTitle>
            <CardDescription>
              Informado o salário base, os encargos são calculados pelos
              percentuais da empresa e podem ser editados por colaborador. MEI e
              pró-labore não têm encargos sobre o salário.
            </CardDescription>
          </CardHeader>
          {isLoading ? (
            <TableSkeleton cols={6} rows={6} />
          ) : !employees.length ? (
            <ListDataTotalEmpty
              icon={IconUsers}
              title="Nenhum colaborador cadastrado"
              description="Cadastre os colaboradores para formar o custo de mão de obra."
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[4%]" />
                      <TableHead className="w-[26%] min-w-[180px]">
                        Colaborador
                      </TableHead>
                      <TableHead className="w-[14%]">Setor</TableHead>
                      <TableHead className="w-[16%]">Contratação</TableHead>
                      <TableHead className="w-[14%] text-right">
                        Salário base
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Encargos
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Custo total
                      </TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => {
                      const isExpanded = expanded.includes(employee.id)
                      const chargesTotal = employee.charges.reduce(
                        (sum, charge) => sum + charge.value,
                        0,
                      )

                      return (
                        <Fragment key={employee.id}>
                          <TableRow>
                            <TableCell>
                              <ActionButton
                                Icon={
                                  isExpanded
                                    ? IconChevronDown
                                    : IconChevronRight
                                }
                                tooltip={
                                  isExpanded
                                    ? `Recolher ${employee.name}`
                                    : `Detalhar ${employee.name}`
                                }
                                onClick={() => toggle(employee.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-gray">
                                {employee.role}
                              </p>
                            </TableCell>
                            <TableCell>{employee.sector}</TableCell>
                            <TableCell>
                              <Badge variant="neutralLight">
                                {contractTypeObj[employee.contract]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrencyToBrl(employee.baseSalary)}
                            </TableCell>
                            <TableCell className="text-right">
                              {chargesTotal
                                ? formatCurrencyToBrl(chargesTotal)
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrencyToBrl(employee.totalCost)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <PermissionGate
                                  permissions={[
                                    'financial_settings:payroll:edit',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconPencil}
                                    tooltip={`Editar custo de ${employee.name}`}
                                    onClick={() => setEditing(employee)}
                                  />
                                </PermissionGate>
                              </div>
                            </TableCell>
                          </TableRow>
                          {isExpanded && (
                            <>
                              {employee.charges.map((charge) => (
                                <TableRow
                                  key={charge.key}
                                  className="bg-gray-50"
                                >
                                  <TableCell />
                                  <TableCell colSpan={4}>
                                    <span className="text-sm font-medium">
                                      {payrollChargeObj[charge.key]}
                                    </span>
                                    <span className="text-sm text-gray ml-2">
                                      {charge.override === null
                                        ? `${(charge.percent / 10)
                                            .toFixed(1)
                                            .replace('.', ',')}% do salário`
                                        : 'informado manualmente'}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="text-right text-sm"
                                    colSpan={3}
                                  >
                                    {formatCurrencyToBrl(charge.value)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {employee.benefits.map((benefit) => (
                                <TableRow
                                  key={benefit.id}
                                  className="bg-gray-50"
                                >
                                  <TableCell />
                                  <TableCell colSpan={4}>
                                    <span className="text-sm font-medium">
                                      {benefit.name}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="text-right text-sm"
                                    colSpan={3}
                                  >
                                    {formatCurrencyToBrl(benefit.value)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {!employee.charges.length &&
                                !employee.benefits.length && (
                                  <TableRow className="bg-gray-50">
                                    <TableCell />
                                    <TableCell
                                      colSpan={7}
                                      className="text-sm text-gray"
                                    >
                                      {contractTypeObj[employee.contract]} não
                                      tem encargos calculados sobre o salário: o
                                      custo é o valor contratado.
                                    </TableCell>
                                  </TableRow>
                                )}
                            </>
                          )}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-between text-sm text-gray">
                <span>
                  {employees.length}{' '}
                  {employees.length === 1 ? 'colaborador' : 'colaboradores'}
                </span>
                <span>
                  Custo total da folha:{' '}
                  <span className="font-semibold text-gray-900">
                    {formatCurrencyToBrl(total)}
                  </span>
                </span>
              </CardFooter>
            </>
          )}
        </Card>
        <EmployeeCostModal
          employee={editing}
          open={!!editing}
          onOpenChange={() => setEditing(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
