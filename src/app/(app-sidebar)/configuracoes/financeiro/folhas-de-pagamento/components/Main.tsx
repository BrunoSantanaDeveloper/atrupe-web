'use client'

// PROVISÓRIO nos valores: a API ainda devolve um tipo só por item (acréscimo
// OU desconto) e não devolve o comportamento. A tela mostra a estrutura
// decidida em ALT-18 e ALT-19, no layout do Figma "Atrupe Pro, ELite e Full"
// (nó 23825-34010), lendo o mock `src/actions/payroll-structure.ts`. Os
// diálogos de item de custo continuam falando com a API, porque tratam do
// cadastro do item, não do valor por colaborador.

// React
import { Fragment, useEffect, useMemo, useState } from 'react'

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
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { NewItemDialog } from './NewItem'
import { ManageItemsDialog } from './ManageItems'
import { EditPayrollItem } from './EditPayrollItem'
import { Topbar } from '@/components/common/Topbar'
import { Avatar } from '@/components/AvatarComponent'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import {
  employeeCost,
  itemFinalCost,
  totalDiscount,
  totalIncrease,
  employeePayroll,
  payrollBehaviorLabel,
  payrollContractLabel,
  type PayrollBehavior,
  type PayrollStructureItem,
  type PayrollStructureEmployee,
} from '../types'

// Actions
import {
  setPayrollItem,
  getPayrollStructure,
} from '@/actions/payroll-structure'

// Third-party
import { toast } from 'sonner'
import { useAlertDialog } from '@/store/useAlertDialog'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl, getFirstAndLastName } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

const TODOS = 'todos'

const tiposDeCusto: { value: string; label: string }[] = [
  { value: TODOS, label: 'Todos' },
  { value: 'ONLY_INCREASE', label: payrollBehaviorLabel.ONLY_INCREASE },
  { value: 'ONLY_DISCOUNT', label: payrollBehaviorLabel.ONLY_DISCOUNT },
  {
    value: 'INCREASE_AND_DISCOUNT',
    label: payrollBehaviorLabel.INCREASE_AND_DISCOUNT,
  },
  { value: 'PROVISION', label: payrollBehaviorLabel.PROVISION },
]

// Valor vazio aparece como traço, não como R$ 0,00: o traço diz "não se
// aplica", o zero diria "calculado e deu zero", que é outra coisa
const value = (amount: number, className?: string) =>
  amount ? (
    <span className={className}>{money(amount)}</span>
  ) : (
    <span className="text-gray">—</span>
  )

// A folha mostra um colaborador por vez (decisão do time, 24/09/2026), com
// filtro de setor e de colaborador acima.
export function Main() {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-structure'],
    queryFn: () => getPayrollStructure(),
  })

  const employees = useMemo<PayrollStructureEmployee[]>(
    () => data?.data || [],
    [data],
  )

  const [sector, setSector] = useState(TODOS)
  const [employeeId, setEmployeeId] = useState('')
  const [costType, setCostType] = useState(TODOS)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState<PayrollStructureItem>()

  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['payroll-structure'] })

  const addItem = async (item: PayrollStructureItem) => {
    const res = await setPayrollItem(employeeId, item.id, true)

    if (!res.success) return toast.error(res.message)

    await refresh()
    // Acrescentar sem informar valor deixaria a linha zerada: o diálogo abre
    // em seguida para a pessoa terminar o que começou
    setEditing({ ...item, isSet: true })
  }

  // Tirar o item não apaga o item da empresa — ele volta para a lista como
  // disponível. Por isso o texto fala em "tirar", não em "excluir"
  const removeItem = (item: PayrollStructureItem) =>
    alertDialog.open({
      title: `Tirar ${item.name} deste colaborador?`,
      description:
        'O item continua cadastrado na empresa e pode ser acrescentado de novo. O valor informado aqui é perdido.',
      confirmLabel: 'Tirar',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await setPayrollItem(employeeId, item.id, false)

        if (!res.success) throw new Error(res.message)

        await refresh()
      },
      toastMsg: {
        success: 'Item tirado do colaborador',
        error: 'Erro ao tirar o item',
      },
    })

  const sectors = useMemo(() => {
    const names = Array.from(new Set(employees.map((item) => item.sectorName)))

    return [
      { value: TODOS, label: 'Todos os setores' },
      ...names.sort().map((name) => ({ value: name, label: name })),
    ]
  }, [employees])

  const visible = useMemo(
    () =>
      sector === TODOS
        ? employees
        : employees.filter((item) => item.sectorName === sector),
    [employees, sector],
  )

  // Trocar de setor pode deixar de fora quem estava selecionado: nesse caso a
  // tela cai no primeiro do setor, em vez de ficar vazia sem explicação
  useEffect(() => {
    if (visible.some((item) => item.id === employeeId)) return

    setEmployeeId(visible[0]?.id || '')
  }, [visible, employeeId])

  const employee = visible.find((item) => item.id === employeeId)

  const matches = (item: PayrollStructureItem) => {
    const byType = costType === TODOS || item.behavior === costType
    const byName = item.name.toLowerCase().includes(search.trim().toLowerCase())

    return byType && byName
  }

  const items = (employee?.items || []).filter(matches)
  const salary = items.find((item) => !item.derivedFromSalary && item.isSet)
  const derived = items.filter((item) => item.derivedFromSalary)
  const others = items.filter(
    (item) => !item.derivedFromSalary && item.id !== salary?.id,
  )

  const cost = employee ? employeeCost(employee) : 0
  const payroll = employee ? employeePayroll(employee) : 0
  const provision = cost - payroll

  const itemRow = (item: PayrollStructureItem, child = false) => (
    <TableRow key={item.id} className={cn(!item.isSet && 'text-gray')}>
      <TableCell>
        <div className={cn('flex items-center gap-2', child && 'pl-6')}>
          {child && (
            <span
              aria-hidden
              className="h-4 w-3 rounded-bl border-b border-l border-gray-300"
            />
          )}
          <div>
            <p className={cn(item.isSet ? 'text-gray-700' : 'text-gray')}>
              {item.name}
            </p>
            <p className="text-xs text-gray">
              {payrollBehaviorLabel[item.behavior]}
              {item.fixedByLaw ? ' · percentual definido em lei' : ''}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell numeric>
        {item.isSet ? value(item.increase, 'text-success-600') : '—'}
      </TableCell>
      <TableCell numeric>
        {item.isSet ? value(item.discount, 'text-error-600') : '—'}
      </TableCell>
      <TableCell numeric className="font-medium">
        {item.isSet ? value(itemFinalCost(item), 'text-gray-900') : '—'}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <PermissionGate permissions={['financial_settings:payroll:edit']}>
            {item.isSet ? (
              <>
                <ActionButton
                  Icon={IconPencil}
                  variant="neutralGhost"
                  tooltip={
                    item.fixedByLaw
                      ? 'Férias e 13º não têm percentual editável'
                      : `Editar ${item.name}`
                  }
                  disabled={item.fixedByLaw}
                  onClick={() => setEditing(item)}
                />
                <ActionButton
                  Icon={IconTrash}
                  variant="errorGhost"
                  tooltip={`Tirar ${item.name} deste colaborador`}
                  onClick={() => removeItem(item)}
                />
              </>
            ) : (
              <ActionButton
                Icon={IconPlus}
                variant="neutralGhost"
                tooltip={`Acrescentar ${item.name}`}
                onClick={() => addItem(item)}
              />
            )}
          </PermissionGate>
        </div>
      </TableCell>
    </TableRow>
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Folha de pagamento"
          previousPage="/configuracoes/financeiro"
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

        {isLoading ? (
          <Skeleton className="h-[calc(100vh-150px)]" />
        ) : (
          <Card>
            {/* Cabeçalho: quem é a pessoa, à esquerda, e como chegar até ela,
                à direita */}
            <CardContent className="flex flex-wrap items-end justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                <Avatar
                  size="lg"
                  url={employee?.avatarUrl || ''}
                  name={employee ? getFirstAndLastName(employee.name) : ''}
                />
                <div>
                  <p className="type-section-title">
                    {employee?.name || 'Nenhum colaborador neste setor'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray">
                      {employee
                        ? `${employee.code} · ${employee.roleName} · ${employee.sectorName}`
                        : 'Troque o setor para ver outra pessoa'}
                    </p>
                    {employee && (
                      <Badge variant="neutralLight">
                        {payrollContractLabel[employee.contract]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <SelectBasic
                  name="sector"
                  label="Setor"
                  value={sector}
                  options={sectors}
                  onChange={setSector}
                  className="flex-[1_0_180px]"
                />
                <SelectBasic
                  name="employee"
                  label="Colaborador"
                  value={employeeId}
                  onChange={setEmployeeId}
                  className="flex-[1_0_220px]"
                  emptyMessage="Nenhum colaborador neste setor"
                  options={visible.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                />
                <SelectBasic
                  name="costType"
                  label="Tipos de custos"
                  value={costType}
                  options={tiposDeCusto}
                  onChange={setCostType}
                  className="flex-[1_0_200px]"
                />
                <div className="flex flex-[1_0_200px] flex-col">
                  <label
                    htmlFor="payroll-search"
                    className="mb-2 text-sm font-medium text-gray-700"
                  >
                    Buscar
                  </label>
                  <Input
                    id="payroll-search"
                    value={search}
                    placeholder="Buscar por..."
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>
            </CardContent>

            {!employee ? (
              <CardContent className="px-6 pb-10 text-center text-sm text-gray">
                Escolha um setor que tenha colaboradores para ver a folha.
              </CardContent>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-full">Referência</TableHead>
                      <TableHead className="text-right">Acréscimo</TableHead>
                      <TableHead numeric>Desconto</TableHead>
                      <TableHead numeric>Custo final</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salary && (
                      <Fragment key={salary.id}>
                        {/* O salário base é o pai dos encargos: eles são
                            calculados a partir dele (ALT-18), e vê-los
                            aninhados mostra de onde saem */}
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ActionButton
                                variant="neutralGhost"
                                Icon={
                                  collapsed ? IconChevronRight : IconChevronDown
                                }
                                tooltip={
                                  collapsed
                                    ? 'Mostrar os encargos'
                                    : 'Esconder os encargos'
                                }
                                onClick={() => setCollapsed(!collapsed)}
                              />
                              <p className="font-medium text-gray-800">
                                {salary.name}
                              </p>
                              {derived.length > 0 && (
                                <Badge variant="neutralLight">
                                  {derived.length}{' '}
                                  {derived.length === 1
                                    ? 'encargo'
                                    : 'encargos'}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell numeric>
                            {value(salary.increase, 'text-success-600')}
                          </TableCell>
                          <TableCell numeric>
                            {value(salary.discount, 'text-error-600')}
                          </TableCell>
                          <TableCell numeric className="font-medium">
                            {value(itemFinalCost(salary), 'text-gray-900')}
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
                                  variant="neutralGhost"
                                  tooltip="Editar o salário base"
                                  onClick={() => setEditing(salary)}
                                />
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                        {!collapsed &&
                          derived.map((item) => itemRow(item, true))}
                      </Fragment>
                    )}

                    {others.map((item) => itemRow(item))}
                  </TableBody>
                </Table>

                {/* Total das colunas, como no Figma */}
                <div className="border-t border-gray-200 bg-gray-50">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-transparent">
                        <TableCell className="w-full font-semibold text-gray-800">
                          Total
                        </TableCell>
                        <TableCell
                          numeric
                          className="font-semibold text-success-600"
                        >
                          {money(totalIncrease(employee))}
                        </TableCell>
                        <TableCell
                          numeric
                          className="font-semibold text-error-600"
                        >
                          {money(totalDiscount(employee))}
                        </TableCell>
                        <TableCell numeric className="type-body-strong">
                          {money(cost)}
                        </TableCell>
                        <TableCell className="w-20" />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <CardFooter className="flex-wrap justify-between gap-3">
                  <p className="max-w-xl text-sm text-gray">
                    O <strong>custo do colaborador</strong> é o que alimenta o
                    custo do setor na Base de custos. A folha a pagar é menor
                    porque a provisão de férias, 13º e FGTS custa agora e é paga
                    depois.
                  </p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-gray">Sai na folha a pagar</p>
                      <p className="font-semibold text-gray-900">
                        {money(payroll)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray">Provisão do mês</p>
                      <p className="font-semibold text-gray-900">
                        {money(provision)}
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        )}

        <EditPayrollItem
          item={editing}
          employeeId={employeeId}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}

export type { PayrollBehavior }
