'use client'

// PROVISÓRIO no que toca aos valores: a API ainda devolve um tipo só por item
// (acréscimo OU desconto) e não devolve o comportamento. Esta tela mostra a
// estrutura decidida em ALT-18 e ALT-19, na organização do legado, lendo o
// mock `src/actions/payroll-structure.ts`. Os diálogos de item de custo
// continuam falando com a API, porque tratam do cadastro do item, não do
// valor por colaborador.

// React
import { Fragment } from 'react'

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
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { NewItemDialog } from './NewItem'
import { ManageItemsDialog } from './ManageItems'
import { Topbar } from '@/components/common/Topbar'
import { UserInfo } from '@/components/common/UserInfo'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Types
import {
  employeeCost,
  itemFinalCost,
  employeePayroll,
  payrollBehaviorLabel,
  payrollContractLabel,
  type PayrollStructureEmployee,
} from '../types'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getPayrollStructure } from '@/actions/payroll-structure'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

const money = (value: number) => formatCurrencyToBrl(value / 100)

export function Main({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-structure', searchParams],
    queryFn: () => getPayrollStructure(),
  })

  const employees: PayrollStructureEmployee[] = data?.data || []

  const totalCost = employees.reduce(
    (total, employee) => total + employeeCost(employee),
    0,
  )
  const totalPayroll = employees.reduce(
    (total, employee) => total + employeePayroll(employee),
    0,
  )

  return (
    <div className="space-y-5">
      <Topbar
        review="new"
        title="Folha de pagamento"
        previousPage="/configuracoes/financeiro"
        supportText="O custo de cada colaborador, item a item"
        secondaryCta={
          <PermissionGate permissions={['financial_settings:payroll:edit']}>
            <ManageItemsDialog />
          </PermissionGate>
        }
        primaryCta={
          <PermissionGate permissions={['financial_settings:payroll:create']}>
            <NewItemDialog />
          </PermissionGate>
        }
      />

      <Card>
        <CardContent className="px-6 py-5">
          <p className="text-sm text-gray">
            Cada item de custo diz <strong>como se comporta na folha</strong>.
            São quatro comportamentos, e é o último que permite férias, 13º e
            FGTS entrarem no custo do mês sem aparecer na folha a pagar.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            {(
              [
                ['ONLY_INCREASE', 'Salário base, insalubridade, hora extra'],
                ['ONLY_DISCOUNT', 'Hora falta'],
                [
                  'INCREASE_AND_DISCOUNT',
                  'INSS, vale transporte, ajuda de custo',
                ],
                ['PROVISION', 'FGTS, 13º salário, férias'],
              ] as const
            ).map(([behavior, exemplos]) => (
              <div
                key={behavior}
                className="rounded-lg border border-gray-200 p-3"
              >
                <p className="text-sm font-medium">
                  {payrollBehaviorLabel[behavior]}
                </p>
                <p className="mt-1 text-sm text-gray">{exemplos}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : (
          <>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-full">
                      Referência do custo
                    </TableHead>
                    <TableHead>Comportamento</TableHead>
                    <TableHead className="text-right">Acréscimo</TableHead>
                    <TableHead className="text-right">Desconto</TableHead>
                    <TableHead className="text-right">Custo final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <Fragment key={employee.id}>
                      <TableRow className="bg-gray-100">
                        <TableCell colSpan={2}>
                          <div className="flex flex-wrap items-center gap-3">
                            <UserInfo
                              name={employee.name}
                              description={`${employee.roleName} · ${employee.sectorName}`}
                            />
                            <Badge variant="neutralLight">
                              {payrollContractLabel[employee.contract]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell colSpan={2} className="text-sm text-gray">
                          Salário base {money(employee.baseSalary)} ·{' '}
                          {employee.monthlyHours} h/mês
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-xs text-gray">
                            Custo do colaborador
                          </p>
                          <p className="font-semibold text-gray-900">
                            {money(employeeCost(employee))}
                          </p>
                        </TableCell>
                      </TableRow>

                      {employee.items.map((item) => (
                        <TableRow key={`${employee.id}-${item.id}`}>
                          <TableCell className="text-gray-600">
                            {item.name}
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {payrollBehaviorLabel[item.behavior]}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right',
                              item.increase ? 'text-success-600' : 'text-gray',
                            )}
                          >
                            {item.increase ? money(item.increase) : '—'}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right',
                              item.discount ? 'text-error-600' : 'text-gray',
                            )}
                          >
                            {item.discount ? money(item.discount) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {money(itemFinalCost(item))}
                          </TableCell>
                        </TableRow>
                      ))}

                      <TableRow>
                        <TableCell colSpan={4} className="text-sm text-gray">
                          Sai na folha a pagar de {employee.name.split(' ')[0]},
                          sem as provisões
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {money(employeePayroll(employee))}
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex-wrap justify-between gap-3">
              <p className="text-sm text-gray">
                O custo do colaborador é a soma dos custos finais, e é ele que
                alimenta o custo do setor na Base de custos. A folha a pagar é
                menor porque as provisões não são pagas neste mês.
              </p>
              <div className="text-right text-sm">
                <p className="text-gray">Folha a pagar {money(totalPayroll)}</p>
                <p>
                  Custo total da mão de obra:{' '}
                  <span className="text-lg font-semibold text-gray-900">
                    {money(totalCost)}
                  </span>
                </p>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
