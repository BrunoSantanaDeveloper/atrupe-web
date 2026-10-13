'use server'

// Estrutura da folha (ALT-18, ALT-19, F-14): as rotas /financial/payroll-setup
// da API. Valores em centavos dos dois lados. As contas são do servidor (custo
// final da linha, custo do colaborador, folha a pagar e totais): a tela só lê.
//
// A página pede financial_settings:payroll:view e values:values:view; sem
// valores, a API recusa (403).

// Types
import {
  PAYROLL_BEHAVIORS,
  type PayrollBehavior,
  type PayrollContract,
  type PayrollItemUpdate,
  type PayrollStructureItem,
  type PayrollStructureEmployee,
} from '@/app/(app-sidebar)/configuracoes/financeiro/folhas-de-pagamento/types'

// Actions
import { getItem, updateItemNew } from '@/actions/_cruds'

// A lista vem em páginas de até 100 (teto da API); a tela mostra um
// colaborador por vez e filtra no navegador, então busca todas
const PAGE_SIZE = 100
const MAX_PAGES = 50

// A carga horária de referência do mês quando a resposta não trouxer (F-11)
const MONTHLY_HOURS = 220

const CONTRACTS: PayrollContract[] = ['CLT', 'PRO_LABORE', 'MEI_PJ']

type Result<T> = { success: boolean; data: T; message: string }
type ApiResult = {
  success: boolean
  // O corpo de cada rota é tipado onde é lido
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  message?: string
}

const ok = <T>(data: T): Result<T> => ({ success: true, data, message: '' })
const fail = <T>(res: ApiResult, data: T): Result<T> => ({
  success: false,
  data,
  message: res.message || 'Não foi possível concluir.',
})

// O id entra no caminho da rota: nada de "/" ou "?" vindo da tela
const seg = (id: string) => encodeURIComponent(id)

/* --------------------------------------------------------------------------
 * Formato da API
 * ------------------------------------------------------------------------ */

type ApiLine = Partial<
  Omit<PayrollStructureItem, 'behavior'> & { behavior: string }
>

type ApiEmployee = Partial<
  Omit<PayrollStructureEmployee, 'code' | 'contract' | 'items'> & {
    code: string | number | null
    contract: string | null
    items: ApiLine[]
  }
>

/* --------------------------------------------------------------------------
 * Para o formato da tela
 * ------------------------------------------------------------------------ */

const cents = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

// O servidor sempre manda um dos cinco; o que vier fora disso cai no
// acréscimo, que é o que a folha de antes fazia com o tipo
const behaviorOf = (value: unknown): PayrollBehavior =>
  PAYROLL_BEHAVIORS.includes(value as PayrollBehavior)
    ? (value as PayrollBehavior)
    : 'ONLY_INCREASE'

const toItem = (line: ApiLine): PayrollStructureItem => ({
  id: String(line.id ?? ''),
  templateId: String(line.templateId ?? ''),
  name: line.name ?? '',
  behavior: behaviorOf(line.behavior),
  increase: cents(line.increase),
  discount: cents(line.discount),
  finalCost: cents(line.finalCost),
  isSet: !!line.isSet,
  derivedFromSalary: !!line.derivedFromSalary,
  fixedByLaw: !!line.fixedByLaw,
  isBase: !!line.isBase,
  manualOverride: !!line.manualOverride,
})

const toEmployee = (employee: ApiEmployee): PayrollStructureEmployee => ({
  id: String(employee.id ?? ''),
  name: employee.name ?? '',
  // O código é o do legado: quem nasceu no sistema novo vem sem
  code:
    employee.code === null ||
    employee.code === undefined ||
    employee.code === ''
      ? null
      : String(employee.code),
  roleName: employee.roleName ?? '',
  sectorName: employee.sectorName ?? '',
  avatarUrl: employee.avatarUrl || undefined,
  contract: CONTRACTS.includes(employee.contract as PayrollContract)
    ? (employee.contract as PayrollContract)
    : null,
  baseSalary:
    typeof employee.baseSalary === 'number' ? employee.baseSalary : null,
  monthlyHours: employee.monthlyHours || MONTHLY_HOURS,
  employeeCost: cents(employee.employeeCost),
  employeePayroll: cents(employee.employeePayroll),
  totalIncrease: cents(employee.totalIncrease),
  totalDiscount: cents(employee.totalDiscount),
  employeeProvision: cents(employee.employeeProvision),
  items: (Array.isArray(employee.items) ? employee.items : []).map(toItem),
})

// A linha editada volta com os totais novos do colaborador
const toUpdate = (
  line: ApiLine & { employeeCost?: number; employeePayroll?: number },
): PayrollItemUpdate => ({
  ...toItem(line),
  employeeCost: cents(line.employeeCost),
  employeePayroll: cents(line.employeePayroll),
})

/* --------------------------------------------------------------------------
 * Actions
 * ------------------------------------------------------------------------ */

export const getPayrollStructure = async () => {
  const employees: ApiEmployee[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res: ApiResult = await getItem({
      route: '/financial/payroll-setup',
      params: { page: String(page), limit: String(PAGE_SIZE) },
    })
    if (!res.success) return fail(res, [] as PayrollStructureEmployee[])
    const rows = res.data?.data
    employees.push(...(Array.isArray(rows) ? rows : []))
    if (page >= (res.data?.lastPage ?? 1)) break
  }
  return ok(employees.map(toEmployee))
}

// Edita a linha do colaborador. Vai só o que a tela mandou: o servidor marca
// INSS e FGTS como valor à mão ao receber qualquer um dos três, e o salário
// base refaz os encargos
export const updatePayrollItem = async (
  _employeeId: string,
  itemId: string,
  values: Partial<
    Pick<PayrollStructureItem, 'behavior' | 'increase' | 'discount'>
  >,
) => {
  const res: ApiResult = await updateItemNew({
    route: `/financial/payroll-setup/${seg(itemId)}`,
    data: {
      ...(values.behavior !== undefined && { behavior: values.behavior }),
      ...(values.increase !== undefined && {
        increase: Math.round(values.increase),
      }),
      ...(values.discount !== undefined && {
        discount: Math.round(values.discount),
      }),
    },
  })
  if (!res.success) return fail<PayrollItemUpdate | null>(res, null)
  return ok<PayrollItemUpdate | null>(toUpdate(res.data ?? {}))
}

// Acrescentar ou tirar o item do colaborador. Tirar não apaga o item da
// empresa: ele volta para a lista como disponível, com os valores zerados
export const setPayrollItem = async (
  _employeeId: string,
  itemId: string,
  isSet: boolean,
) => {
  const res: ApiResult = await updateItemNew({
    route: `/financial/payroll-setup/${seg(itemId)}`,
    data: { isSet },
  })
  if (!res.success) return fail<PayrollItemUpdate | null>(res, null)
  return ok<PayrollItemUpdate | null>(toUpdate(res.data ?? {}))
}

// INSS ou FGTS com valor à mão voltam a acompanhar o salário: o servidor
// tira a marca e refaz os encargos (F-4). Outra linha recebe 400
export const resetPayrollOverride = async (itemId: string) => {
  const res: ApiResult = await updateItemNew({
    route: `/financial/payroll-setup/${seg(itemId)}`,
    data: { manualOverride: false },
  })
  if (!res.success) return fail<PayrollItemUpdate | null>(res, null)
  return ok<PayrollItemUpdate | null>(toUpdate(res.data ?? {}))
}
