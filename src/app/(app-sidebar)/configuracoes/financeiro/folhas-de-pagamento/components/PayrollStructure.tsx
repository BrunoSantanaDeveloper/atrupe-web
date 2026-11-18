'use client'

// A estrutura da folha decidida em ALT-18 e ALT-19, no layout do Figma
// "Atrupe Pro, ELite e Full" (nó 23825-34010), sobre /financial/payroll-setup
// (src/actions/payroll-structure.ts). O custo final de cada linha, o custo do
// colaborador, a folha a pagar e os totais vêm do servidor; a tela só mostra
// e filtra.

// Next
import { InfoHint } from '@/components/common/InfoHint'
import Link from 'next/link'

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
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Types
import {
  employeeCost,
  itemFinalCost,
  totalDiscount,
  totalIncrease,
  employeePayroll,
  isEditableCharge,
  employeeProvision,
  PAYROLL_BEHAVIORS,
  payrollBehaviorLabel,
  payrollContractLabel,
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
  ...PAYROLL_BEHAVIORS.map((value) => ({
    value,
    label: payrollBehaviorLabel[value],
  })),
]

// Onde ficam a forma de contratação e o salário base do colaborador
const EMPLOYEES_PATH =
  '/configuracoes/empresa-e-sistema/colaboradores-e-usuarios'

// Valor vazio aparece como traço, não como R$ 0,00: o traço diz "não se
// aplica", o zero diria "calculado e deu zero", que é outra coisa
const value = (amount: number, className?: string) =>
  amount ? (
    <span className={className}>{money(amount)}</span>
  ) : (
    <span className="text-gray">—</span>
  )

// O subtítulo da linha: o comportamento e o que muda a leitura do valor
const itemHint = (item: PayrollStructureItem) =>
  [
    payrollBehaviorLabel[item.behavior],
    item.fixedByLaw && 'percentual definido em lei',
    isEditableCharge(item) && item.manualOverride && 'valor informado à mão',
    item.behavior === 'ADVANCE' && 'fora do custo e da folha a pagar',
  ]
    .filter(Boolean)
    .join(' · ')

// O salário base é a linha marcada como base; na folha que veio sem a marca,
// o primeiro acréscimo lançado faz o papel
const salaryOf = (items: PayrollStructureItem[]) =>
  items.find((item) => item.isBase) ||
  items.find(
    (item) =>
      item.isSet &&
      !item.derivedFromSalary &&
      item.behavior === 'ONLY_INCREASE',
  )

// A folha mostra todos os colaboradores, cada um com os itens dele e o
// total; escolher uma pessoa no filtro mostra só ela, com os itens que dá
// para acrescentar (LITE part3, item 3, 28/10/2026). Antes era uma pessoa
// por vez (24/09/2026), e quem abria via só o primeiro da lista.
export function PayrollStructure() {
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
  const [employeeId, setEmployeeId] = useState(TODOS)
  const [costType, setCostType] = useState(TODOS)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState<{
    item: PayrollStructureItem
    employeeId: string
  }>()

  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['payroll-structure'] })

  const addItem = async (item: PayrollStructureItem, empId: string) => {
    const res = await setPayrollItem(empId, item.id, true)

    if (!res.success || !res.data) return toast.error(res.message)

    await refresh()
    // Acrescentar sem informar valor deixaria a linha zerada: o diálogo abre
    // em seguida, com a linha como o servidor gravou, para a pessoa terminar
    // o que começou
    if (!res.data.fixedByLaw) setEditing({ item: res.data, employeeId: empId })
  }

  // Tirar o item não apaga o item da empresa — ele volta para a lista como
  // disponível. Por isso o texto fala em "tirar", não em "excluir"
  const removeItem = (item: PayrollStructureItem, empId: string) =>
    alertDialog.open({
      title: `Tirar ${item.name} deste colaborador?`,
      description:
        'O item continua cadastrado na empresa e pode ser acrescentado de novo. O valor informado aqui é perdido.',
      confirmLabel: 'Tirar',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await setPayrollItem(empId, item.id, false)

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
  // tela volta a mostrar todos do setor
  useEffect(() => {
    if (employeeId === TODOS) return
    if (visible.some((item) => item.id === employeeId)) return

    setEmployeeId(TODOS)
  }, [visible, employeeId])

  const allMode = employeeId === TODOS
  const employee = allMode
    ? undefined
    : visible.find((item) => item.id === employeeId)

  const matches = (item: PayrollStructureItem) => {
    const byType = costType === TODOS || item.behavior === costType
    const byName = item.name.toLowerCase().includes(search.trim().toLowerCase())

    return byType && byName
  }

  // O salário base sai da lista inteira, não da filtrada: os encargos que
  // passam no filtro continuam sabendo de onde vêm
  const allItems = employee?.items || []
  const salary = salaryOf(allItems)
  const showSalary = !!salary && matches(salary)
  const derived = allItems.filter(
    (item) => item.derivedFromSalary && item.id !== salary?.id && matches(item),
  )
  const others = allItems.filter(
    (item) =>
      !item.derivedFromSalary && item.id !== salary?.id && matches(item),
  )

  const cost = employee ? employeeCost(employee) : 0
  const payroll = employee ? employeePayroll(employee) : 0
  // O que custa no mês e é pago depois, como o servidor somou
  const provision = employee ? employeeProvision(employee) : 0

  // Os encargos da CLT entram pelo cadastro do colaborador (forma de
  // contratação e salário base). Acrescentar à mão 13º e férias, ou um
  // encargo em quem não é CLT, deixaria uma linha zerada que o servidor
  // desfaz no próximo cálculo
  const lockedCharge = (
    item: PayrollStructureItem,
    emp: PayrollStructureEmployee,
  ) => item.derivedFromSalary && (item.fixedByLaw || emp.contract !== 'CLT')

  const itemActions = (
    item: PayrollStructureItem,
    emp: PayrollStructureEmployee,
  ) => {
    const isClt = emp.contract === 'CLT'
    return item.isSet ? (
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
          onClick={() => setEditing({ item, employeeId: emp.id })}
        />
        {/* O salário base e os itens da lei não saem da folha CLT */}
        {!item.isBase && (
          <ActionButton
            Icon={IconTrash}
            variant="errorGhost"
            tooltip={
              isClt && item.fixedByLaw
                ? 'Este item faz parte da folha CLT'
                : `Tirar ${item.name} deste colaborador`
            }
            disabled={isClt && item.fixedByLaw}
            onClick={() => removeItem(item, emp.id)}
          />
        )}
      </>
    ) : (
      <ActionButton
        Icon={IconPlus}
        variant="neutralGhost"
        tooltip={
          lockedCharge(item, emp)
            ? 'Os encargos da CLT saem do cadastro do colaborador'
            : `Acrescentar ${item.name}`
        }
        disabled={lockedCharge(item, emp)}
        onClick={() => addItem(item, emp.id)}
      />
    )
  }

  const itemRow = (
    item: PayrollStructureItem,
    emp: PayrollStructureEmployee,
    child = false,
  ) => (
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
            <p className="text-xs text-gray">{itemHint(item)}</p>
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
            {itemActions(item, emp)}
          </PermissionGate>
        </div>
      </TableCell>
    </TableRow>
  )

  const subtitleOf = (emp: PayrollStructureEmployee) =>
    [emp.code, emp.roleName, emp.sectorName].filter(Boolean).join(' · ')
  const subtitle = employee
    ? subtitleOf(employee)
    : allMode
      ? `${visible.length} ${visible.length === 1 ? 'pessoa' : 'pessoas'}`
      : ''

  const contractBadge = (emp: PayrollStructureEmployee) => (
    <Badge variant={emp.contract ? 'neutralLight' : 'warningLight'}>
      {emp.contract
        ? payrollContractLabel[emp.contract]
        : 'Contratação não informada'}
    </Badge>
  )

  // Na visão de todos, só os itens que a pessoa tem, com os encargos sob o
  // salário base; os disponíveis para acrescentar aparecem ao escolher ela
  const employeeRows = (emp: PayrollStructureEmployee) => {
    const set = emp.items.filter((item) => item.isSet)
    const base = salaryOf(set)
    const rows: JSX.Element[] = []
    if (base && matches(base)) rows.push(itemRow(base, emp))
    set
      .filter(
        (item) =>
          item.derivedFromSalary && item.id !== base?.id && matches(item),
      )
      .forEach((item) => rows.push(itemRow(item, emp, !!base)))
    set
      .filter(
        (item) =>
          !item.derivedFromSalary && item.id !== base?.id && matches(item),
      )
      .forEach((item) => rows.push(itemRow(item, emp)))
    return rows
  }

  const totals = visible.reduce(
    (acc, emp) => ({
      increase: acc.increase + totalIncrease(emp),
      discount: acc.discount + totalDiscount(emp),
      cost: acc.cost + employeeCost(emp),
      payroll: acc.payroll + employeePayroll(emp),
      provision: acc.provision + employeeProvision(emp),
    }),
    { increase: 0, discount: 0, cost: 0, payroll: 0, provision: 0 },
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
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
          // Mesmo formato do cartão final: pessoa e filtros, depois a tabela
          <Card>
            <CardContent className="flex flex-wrap items-end justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                <Skeleton className="size-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
            <TableSkeleton cols={5} />
          </Card>
        ) : data && !data.success ? (
          <Card>
            <CardContent className="px-6 py-10 text-center text-sm text-gray">
              {data.message}
            </CardContent>
          </Card>
        ) : (
          <Card>
            {/* Cabeçalho: quem é a pessoa, à esquerda, e como chegar até ela,
                à direita */}
            <CardContent className="flex flex-wrap items-end justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                {employee && (
                  <Avatar
                    size="lg"
                    url={employee.avatarUrl || ''}
                    name={getFirstAndLastName(employee.name)}
                  />
                )}
                <div>
                  <p className="type-section-title">
                    {employee?.name ||
                      (allMode && visible.length
                        ? 'Todos os colaboradores'
                        : 'Nenhum colaborador neste setor')}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {subtitle && (
                      <p className="text-sm text-gray">{subtitle}</p>
                    )}
                    {employee && contractBadge(employee)}
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
                  options={[
                    { value: TODOS, label: 'Todos' },
                    ...visible.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
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

            {/* Sem a forma de contratação, o servidor não gera INSS, FGTS,
                13º nem férias: o caminho para resolver fica à vista */}
            {employee && !employee.contract && (
              <CardContent className="px-6 pb-4 text-sm text-gray">
                Os encargos da CLT saem da forma de contratação e do salário
                base, no{' '}
                <Link
                  href={EMPLOYEES_PATH}
                  className="font-medium text-brand-700 hover:underline"
                >
                  cadastro do colaborador
                </Link>
                .
              </CardContent>
            )}

            {allMode && visible.length ? (
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
                    {visible.map((emp) => (
                      <Fragment key={emp.id}>
                        <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                size="xs"
                                url={emp.avatarUrl || ''}
                                name={getFirstAndLastName(emp.name)}
                              />
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  className="font-medium text-gray-900 hover:text-brand-700 hover:underline"
                                  onClick={() => setEmployeeId(emp.id)}
                                >
                                  {emp.name}
                                </button>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs text-gray">
                                    {subtitleOf(emp)}
                                  </p>
                                  {contractBadge(emp)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell numeric>
                            {value(totalIncrease(emp), 'text-success-600')}
                          </TableCell>
                          <TableCell numeric>
                            {value(totalDiscount(emp), 'text-error-600')}
                          </TableCell>
                          <TableCell numeric className="type-body-strong">
                            {money(employeeCost(emp))}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                        {employeeRows(emp)}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
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
                          {money(totals.increase)}
                        </TableCell>
                        <TableCell
                          numeric
                          className="font-semibold text-error-600"
                        >
                          {money(totals.discount)}
                        </TableCell>
                        <TableCell numeric className="type-body-strong">
                          {money(totals.cost)}
                        </TableCell>
                        <TableCell className="w-20" />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <CardFooter className="flex-wrap justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray">
                    Como funciona
                    <InfoHint title="Custo dos colaboradores">
                      <p>
                        O custo dos colaboradores é o que alimenta o custo dos
                        setores na Base de custos.
                      </p>
                      <p>
                        Para acrescentar um item a alguém, clique no nome da
                        pessoa.
                      </p>
                    </InfoHint>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-gray">Sai na folha a pagar</p>
                      <p className="font-semibold text-gray-900">
                        {money(totals.payroll)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray">Provisão do mês</p>
                      <p className="font-semibold text-gray-900">
                        {money(totals.provision)}
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </>
            ) : !employee ? (
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
                    {salary && showSalary ? (
                      <Fragment key={salary.id}>
                        {/* O salário base é o pai dos encargos: eles são
                            calculados a partir dele (ALT-18), e vê-los
                            aninhados mostra de onde saem */}
                        <TableRow className={cn(!salary.isSet && 'text-gray')}>
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
                            {salary.isSet
                              ? value(salary.increase, 'text-success-600')
                              : '—'}
                          </TableCell>
                          <TableCell numeric>
                            {salary.isSet
                              ? value(salary.discount, 'text-error-600')
                              : '—'}
                          </TableCell>
                          <TableCell numeric className="font-medium">
                            {salary.isSet
                              ? value(itemFinalCost(salary), 'text-gray-900')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <PermissionGate
                                permissions={[
                                  'financial_settings:payroll:edit',
                                ]}
                              >
                                {itemActions(salary, employee)}
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                        {!collapsed &&
                          derived.map((item) => itemRow(item, employee, true))}
                      </Fragment>
                    ) : (
                      // O filtro tirou o salário base: os encargos que
                      // passaram aparecem soltos, em vez de sumirem com ele
                      derived.map((item) => itemRow(item, employee))
                    )}

                    {others.map((item) => itemRow(item, employee))}
                  </TableBody>
                </Table>

                {/* Total das colunas, como no Figma. O adiantamento fica de
                    fora: não é custo nem entra na folha a pagar */}
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
                  <div className="flex items-center gap-1.5 text-xs text-gray">
                    Como funciona
                    <InfoHint title="Custo do colaborador">
                      <p>
                        O custo do colaborador é o que alimenta o custo do setor
                        na Base de custos.
                      </p>
                      <p>
                        A folha a pagar é menor que o custo porque a provisão de
                        férias, 13º e FGTS é custo agora e é paga depois.
                      </p>
                    </InfoHint>
                  </div>
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
          item={editing?.item}
          employeeId={editing?.employeeId || ''}
          onOpenChange={(open) => !open && setEditing(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
