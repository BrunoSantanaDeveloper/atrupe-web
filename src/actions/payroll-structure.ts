'use server'

// PROVISÓRIO: a API ainda não devolve acréscimo e desconto separados nem o
// comportamento do item (ALT-18 e ALT-19). Dados de exemplo em memória, no
// formato das actions reais, para a tela poder ser conferida contra o legado
// e contra o Figma antes de o backend existir.
//
// O exemplo reproduz o colaborador NATIHELY do legado, registrado em
// openspec/regras-de-negocio/legado-patrimonios-e-folha.md §6.

// Types
import type {
  PayrollBehavior,
  PayrollStructureItem,
  PayrollStructureEmployee,
} from '@/app/(app-sidebar)/configuracoes/financeiro/folhas-de-pagamento/types'

// Flag de demonstração: sem ela, as actions não leem nem gravam o exemplo
import { DEMO_DATA, demoOff } from '@/lib/demo'

type ItemOptions = {
  derived?: boolean
  fixedByLaw?: boolean
  isSet?: boolean
}

const item = (
  id: string,
  name: string,
  behavior: PayrollBehavior,
  increase: number,
  discount = 0,
  { derived = false, fixedByLaw = false, isSet = true }: ItemOptions = {},
): PayrollStructureItem => ({
  id,
  name,
  behavior,
  increase,
  discount,
  isSet,
  derivedFromSalary: derived,
  fixedByLaw,
})

// Itens que a empresa cadastrou e ainda não usa neste colaborador: aparecem
// na lista vazios, com o botão de acrescentar
const naoUsado = (id: string, name: string, behavior: PayrollBehavior) =>
  item(id, name, behavior, 0, 0, { isSet: false })

const employees: PayrollStructureEmployee[] = [
  {
    id: 'e1',
    code: '10',
    name: 'Natihely Ribeiro',
    roleName: 'Designer',
    sectorName: 'Criação',
    contract: 'CLT',
    baseSalary: 500000,
    monthlyHours: 220,
    items: [
      item('i1', 'Salário base', 'ONLY_INCREASE', 500000),
      item('i2', 'INSS', 'INCREASE_AND_DISCOUNT', 40000, 40000, {
        derived: true,
      }),
      item('i3', 'FGTS', 'PROVISION', 40000, 0, { derived: true }),
      item('i4', '13º salário + FGTS + INSS', 'PROVISION', 48333, 0, {
        derived: true,
        fixedByLaw: true,
      }),
      item('i5', 'Férias + FGTS + INSS', 'PROVISION', 15000, 0, {
        derived: true,
        fixedByLaw: true,
      }),
      item('i6', 'Insalubridade', 'ONLY_INCREASE', 100000),
      item('i7', 'Ajuda de custo', 'INCREASE_AND_DISCOUNT', 15000, 1500),
      item('i8', 'Vale transporte', 'INCREASE_AND_DISCOUNT', 10000, 25000),
      naoUsado('i9', 'Hora extra 100%', 'ONLY_INCREASE'),
      naoUsado('i10', 'Hora extra 50%', 'ONLY_INCREASE'),
      naoUsado('i11', 'Hora falta', 'ONLY_DISCOUNT'),
    ],
  },
  {
    id: 'e2',
    code: '11',
    name: 'Marcos Andrade',
    roleName: 'Impressor',
    sectorName: 'Impressão',
    contract: 'CLT',
    baseSalary: 320000,
    monthlyHours: 220,
    items: [
      item('i1', 'Salário base', 'ONLY_INCREASE', 320000),
      item('i2', 'INSS', 'INCREASE_AND_DISCOUNT', 25600, 25600, {
        derived: true,
      }),
      item('i3', 'FGTS', 'PROVISION', 25600, 0, { derived: true }),
      item('i4', '13º salário + FGTS + INSS', 'PROVISION', 30933, 0, {
        derived: true,
        fixedByLaw: true,
      }),
      item('i5', 'Férias + FGTS + INSS', 'PROVISION', 9600, 0, {
        derived: true,
        fixedByLaw: true,
      }),
      item('i8', 'Vale transporte', 'INCREASE_AND_DISCOUNT', 10000, 19200),
      naoUsado('i9', 'Hora extra 100%', 'ONLY_INCREASE'),
      naoUsado('i11', 'Hora falta', 'ONLY_DISCOUNT'),
    ],
  },
  {
    id: 'e3',
    code: '01',
    name: 'Paula Meireles',
    roleName: 'Sócia',
    sectorName: 'Administrativo',
    contract: 'PRO_LABORE',
    baseSalary: 700000,
    monthlyHours: 220,
    // Sócio com pró-labore não tem os encargos da CLT: o custo é o combinado
    items: [item('i1', 'Pró-labore', 'ONLY_INCREASE', 700000)],
  },
]

export const getPayrollStructure = async () => {
  if (!DEMO_DATA) return { success: true, data: [], message: '' }
  return {
    success: true,
    data: employees,
    message: '',
  }
}

const find = (employeeId: string, itemId: string) =>
  employees
    .find((employee) => employee.id === employeeId)
    ?.items.find((current) => current.id === itemId)

export const updatePayrollItem = async (
  employeeId: string,
  itemId: string,
  values: Partial<
    Pick<PayrollStructureItem, 'behavior' | 'increase' | 'discount'>
  >,
) => {
  if (!DEMO_DATA) return demoOff()
  const current = find(employeeId, itemId)

  if (!current) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  // Férias e 13º são definidos em lei: o valor vem do cálculo, não da digitação
  if (current.fixedByLaw) {
    return {
      success: false,
      data: null,
      message: 'Férias e 13º são calculados por lei e não podem ser editados',
    }
  }

  Object.assign(current, values)

  // O comportamento manda no que pode ter valor: quem só acrescenta não
  // desconta, e quem só desconta não acrescenta
  if (current.behavior === 'ONLY_INCREASE') current.discount = 0
  if (current.behavior === 'ONLY_DISCOUNT') current.increase = 0

  return { success: true, data: current, message: '' }
}

// Acrescentar ou tirar o item do colaborador. Tirar não apaga o item da
// empresa: ele volta para a lista como disponível, com os valores zerados
export const setPayrollItem = async (
  employeeId: string,
  itemId: string,
  isSet: boolean,
) => {
  if (!DEMO_DATA) return demoOff()
  const current = find(employeeId, itemId)

  if (!current) {
    return { success: false, data: null, message: 'Item não encontrado' }
  }

  current.isSet = isSet

  if (!isSet) {
    current.increase = 0
    current.discount = 0
  }

  return { success: true, data: current, message: '' }
}
