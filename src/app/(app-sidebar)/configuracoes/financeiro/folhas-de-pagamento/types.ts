// Estrutura da folha na organização do legado (ALT-18 e ALT-19), registrada em
// openspec/regras-de-negocio/legado-patrimonios-e-folha.md §6, com o layout do
// Figma "Atrupe Pro, ELite e Full — Allan" (nó 23825-34010).

// O comportamento do item deixa de estar escrito no nome — no legado ele vem
// assim, "SALÁRIO BASE (Lança somente acrescimo)" — e vira um campo próprio.
export type PayrollBehavior =
  | 'ONLY_INCREASE' // entra como custo e aparece na folha
  | 'ONLY_DISCOUNT' // desconta do colaborador; custo final zero
  | 'INCREASE_AND_DISCOUNT' // os dois no mesmo item, como INSS e vale transporte
  | 'PROVISION' // entra no custo e NÃO aparece na folha a pagar

export const payrollBehaviorLabel: Record<PayrollBehavior, string> = {
  ONLY_INCREASE: 'Só acréscimo',
  ONLY_DISCOUNT: 'Só desconto',
  INCREASE_AND_DISCOUNT: 'Acréscimo e desconto',
  PROVISION: 'Provisão, sem lançamento em folha',
}

// Forma de contratação: decide quais encargos são calculados (ALT-18)
export type PayrollContract = 'CLT' | 'PRO_LABORE' | 'MEI_PJ'

export const payrollContractLabel: Record<PayrollContract, string> = {
  CLT: 'CLT',
  PRO_LABORE: 'Sócio com pró-labore',
  MEI_PJ: 'MEI ou PJ',
}

export type PayrollStructureItem = {
  id: string
  name: string
  behavior: PayrollBehavior
  // Valores em centavos, como no resto do sistema
  increase: number
  discount: number
  // Item que a empresa ainda não usa neste colaborador: aparece na lista com
  // valores vazios e o botão de acrescentar, como no Figma
  isSet: boolean
  // Encargo calculado a partir do salário base (ALT-18). Estes aparecem
  // aninhados no salário base, que é de onde saem
  derivedFromSalary: boolean
  // Férias e 13º são definidos em lei: o percentual não é editável (ALT-18)
  fixedByLaw: boolean
}

export type PayrollStructureEmployee = {
  id: string
  name: string
  code: string
  roleName: string
  sectorName: string
  avatarUrl?: string
  contract: PayrollContract
  baseSalary: number
  monthlyHours: number
  items: PayrollStructureItem[]
}

// O custo final do item é a diferença, nunca negativo: vale transporte com
// R$ 100 de acréscimo e R$ 250 de desconto custa zero à empresa, não -R$ 150
export const itemFinalCost = (item: PayrollStructureItem) =>
  item.isSet ? Math.max(0, item.increase - item.discount) : 0

const setItems = (employee: PayrollStructureEmployee) =>
  employee.items.filter((item) => item.isSet)

// A soma dos custos finais é o custo do colaborador, que alimenta o custo do
// setor na Base de custos (ALT-19)
export const employeeCost = (employee: PayrollStructureEmployee) =>
  setItems(employee).reduce((total, item) => total + itemFinalCost(item), 0)

// O que realmente sai na folha a pagar: a provisão fica de fora
export const employeePayroll = (employee: PayrollStructureEmployee) =>
  setItems(employee)
    .filter((item) => item.behavior !== 'PROVISION')
    .reduce((total, item) => total + item.increase - item.discount, 0)

export const totalIncrease = (employee: PayrollStructureEmployee) =>
  setItems(employee).reduce((total, item) => total + item.increase, 0)

export const totalDiscount = (employee: PayrollStructureEmployee) =>
  setItems(employee).reduce((total, item) => total + item.discount, 0)
