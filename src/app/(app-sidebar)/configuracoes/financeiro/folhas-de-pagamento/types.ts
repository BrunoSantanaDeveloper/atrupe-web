// Estrutura da folha na organização do legado (ALT-18 e ALT-19), registrada em
// openspec/regras-de-negocio/legado-patrimonios-e-folha.md §6, com o layout do
// Figma "Atrupe Pro, ELite e Full — Allan" (nó 23825-34010). Os dados vêm de
// /financial/payroll-setup e /financial/payroll-templates
// (src/actions/payroll-structure.ts).

// Types
import type { EmploymentContract } from '@/types/settings/employee'

// O comportamento do item deixa de estar escrito no nome — no legado ele vem
// assim, "SALÁRIO BASE (Lança somente acrescimo)" — e vira um campo próprio.
export const PAYROLL_BEHAVIORS = [
  'ONLY_INCREASE', // entra como custo e aparece na folha
  'ONLY_DISCOUNT', // desconta do colaborador; custo final zero
  'INCREASE_AND_DISCOUNT', // os dois no mesmo item, como INSS e vale transporte
  'PROVISION', // entra no custo e NÃO aparece na folha a pagar
  'ADVANCE', // adiantamento: parte do salário paga antes; nem custo nem folha
] as const

export type PayrollBehavior = (typeof PAYROLL_BEHAVIORS)[number]

export const payrollBehaviorLabel: Record<PayrollBehavior, string> = {
  ONLY_INCREASE: 'Só acréscimo',
  ONLY_DISCOUNT: 'Só desconto',
  INCREASE_AND_DISCOUNT: 'Acréscimo e desconto',
  PROVISION: 'Provisão, sem lançamento em folha',
  ADVANCE: 'Adiantamento',
}

// Os quatro que se escolhem. O adiantamento só aparece no item que já é
// adiantamento: ele vem da folha de antes e não se cria por aqui
export const behaviorOptions = (current?: PayrollBehavior) =>
  PAYROLL_BEHAVIORS.filter(
    (value) => value !== 'ADVANCE' || current === 'ADVANCE',
  ).map((value) => ({ value, label: payrollBehaviorLabel[value] }))

// O comportamento manda nos campos, como o servidor grava: quem só acrescenta
// (e a provisão e o adiantamento) não tem desconto, e quem só desconta não
// tem acréscimo. Em vez de aceitar um valor que será zerado, o campo some
export const behaviorFields = (behavior: PayrollBehavior) => ({
  showIncrease: behavior !== 'ONLY_DISCOUNT',
  showDiscount:
    behavior === 'ONLY_DISCOUNT' || behavior === 'INCREASE_AND_DISCOUNT',
})

// Forma de contratação: decide quais encargos são calculados (ALT-18)
export type PayrollContract = EmploymentContract

export const payrollContractLabel: Record<PayrollContract, string> = {
  CLT: 'CLT',
  PRO_LABORE: 'Sócio com pró-labore',
  MEI_PJ: 'MEI ou PJ',
}

export type PayrollStructureItem = {
  id: string
  // O item de custo da empresa de que a linha saiu
  templateId: string
  name: string
  behavior: PayrollBehavior
  // Valores em centavos, como no resto do sistema
  increase: number
  discount: number
  // Calculado no servidor: acréscimo menos desconto, nunca negativo; zero
  // fora da folha e no adiantamento
  finalCost: number
  // Item que a empresa ainda não usa neste colaborador: aparece na lista com
  // valores vazios e o botão de acrescentar, como no Figma
  isSet: boolean
  // Encargo calculado a partir do salário base (ALT-18). Estes aparecem
  // aninhados no salário base, que é de onde saem
  derivedFromSalary: boolean
  // Férias e 13º são definidos em lei: o percentual não é editável (ALT-18)
  fixedByLaw: boolean
  // A linha do salário base: editar o valor muda o salário do colaborador
  isBase: boolean
  // INSS ou FGTS com valor informado à mão: deixa de acompanhar o salário
  manualOverride: boolean
}

export type PayrollStructureEmployee = {
  id: string
  name: string
  // O código do legado; quem nasceu no sistema novo não tem
  code: string | null
  roleName: string
  sectorName: string
  avatarUrl?: string
  // Sem forma de contratação, o servidor não gera os encargos da CLT
  contract: PayrollContract | null
  baseSalary: number | null
  monthlyHours: number
  // Os totais vêm calculados do servidor (centavos)
  employeeCost: number
  employeePayroll: number
  totalIncrease: number
  totalDiscount: number
  // O que custa no mês e é pago depois (férias, 13º, FGTS)
  employeeProvision: number
  items: PayrollStructureItem[]
}

// A linha editada volta com os totais novos do colaborador
export type PayrollItemUpdate = PayrollStructureItem & {
  employeeCost: number
  employeePayroll: number
}

// Os itens que o sistema mantém: o salário base e os encargos da CLT
export type PayrollSystemKey =
  | 'BASE_SALARY'
  | 'INSS'
  // O INSS da empresa (20 % fora do Simples; 0 no Simples e no MEI), item
  // próprio desde 14/10/2026
  | 'INSS_EMPLOYER'
  | 'FGTS'
  | 'THIRTEENTH'
  | 'VACATION'

// O item de custo da empresa (/financial/payroll-templates): existe uma vez
// por empresa e vira uma linha na folha de cada colaborador
export type PayrollTemplate = {
  id: string
  name: string
  behavior: PayrollBehavior
  defaultIncrease: number
  defaultDiscount: number
  derivedFromSalary: boolean
  fixedByLaw: boolean
  // Só os INSS (do colaborador e da empresa) e o FGTS: percentual com duas
  // casas
  rate: number | null
  isBase: boolean
  // Nulo nos itens que a empresa cadastrou
  systemKey: PayrollSystemKey | null
  linkedEmployees: number
  canDelete: boolean
  createdAt: string
}

// INSS e FGTS: encargos que saem do salário pela alíquota e aceitam valor à
// mão. 13º e férias também saem do salário, mas são da lei
export const isEditableCharge = (item: {
  derivedFromSalary: boolean
  fixedByLaw: boolean
}) => item.derivedFromSalary && !item.fixedByLaw

// O item da empresa marcado pelo sistema (o salário base e os encargos da
// CLT) não troca de comportamento. O salário base que veio sem a marca é
// reconhecido pelo nome no servidor (isBase)
export const isSystemItem = (item: {
  isBase: boolean
  systemKey: PayrollSystemKey | null
}) => !!item.systemKey || item.isBase

// Só os INSS e o FGTS têm alíquota, a mesma regra do servidor
export const hasRate = (item: { systemKey: PayrollSystemKey | null }) =>
  item.systemKey === 'INSS' ||
  item.systemKey === 'INSS_EMPLOYER' ||
  item.systemKey === 'FGTS'

// As contas são do servidor (contrato da folha): o custo final da linha, o
// custo do colaborador (alimenta o custo do setor na Base de custos, ALT-19),
// a folha a pagar e os totais. A tela só lê
export const itemFinalCost = (item: PayrollStructureItem) => item.finalCost

export const employeeCost = (employee: PayrollStructureEmployee) =>
  employee.employeeCost

export const employeePayroll = (employee: PayrollStructureEmployee) =>
  employee.employeePayroll

export const totalIncrease = (employee: PayrollStructureEmployee) =>
  employee.totalIncrease

export const totalDiscount = (employee: PayrollStructureEmployee) =>
  employee.totalDiscount

export const employeeProvision = (employee: PayrollStructureEmployee) =>
  employee.employeeProvision
