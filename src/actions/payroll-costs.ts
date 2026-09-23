'use server'

// PROVISÓRIO: a API ainda não tem os endpoints do custo da folha no PRO.
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  ContractType,
  PayrollCharge,
  PayrollEmployee,
  PayrollChargeKey,
} from '@/app/(app-sidebar)/configuracoes/financeiro/folhas-de-pagamento/custos/types'

// Percentuais da empresa, editáveis (F-1 e F-4)
const companyPercents: { [key in PayrollChargeKey]: number } = {
  INSS: 110,
  FGTS: 80,
  THIRTEENTH: 83,
  VACATION: 111,
}

type Seed = {
  id: string
  name: string
  role: string
  sector: string
  contract: ContractType
  baseSalary: number
  overrides: Partial<Record<PayrollChargeKey, number>>
  benefits: { id: string; name: string; value: number }[]
}

const seeds: Seed[] = [
  {
    id: 'marcos',
    name: 'Marcos',
    role: 'Gerente de produção',
    sector: 'Produção',
    contract: 'EMPLOYEE',
    baseSalary: 300000,
    overrides: {},
    benefits: [
      { id: 'b1', name: 'Ajuda de custo', value: 13500 },
      { id: 'b2', name: 'Insalubridade', value: 30000 },
    ],
  },
  {
    id: 'allan',
    name: 'Allan',
    role: 'Designer',
    sector: 'Criação',
    contract: 'EMPLOYEE',
    baseSalary: 300000,
    overrides: { INSS: 0 },
    benefits: [],
  },
  {
    id: 'natihely',
    name: 'Natihely',
    role: 'Administrativo',
    sector: 'Administração',
    contract: 'EMPLOYEE',
    baseSalary: 500000,
    overrides: {},
    benefits: [{ id: 'b3', name: 'Ajuda de custo', value: 13500 }],
  },
  {
    id: 'joao',
    name: 'João',
    role: 'Aplicação',
    sector: 'Produção',
    contract: 'MEI',
    baseSalary: 250000,
    overrides: {},
    benefits: [],
  },
  {
    id: 'socio',
    name: 'Maicol',
    role: 'Sócio',
    sector: 'Administração',
    contract: 'PARTNER',
    baseSalary: 800000,
    overrides: {},
    benefits: [],
  },
]

// MEI e pró-labore não têm encargos calculados sobre o salário (F-9 e F-10)
const hasCharges = (contract: ContractType) => contract === 'EMPLOYEE'

const chargesOf = (seed: Seed): PayrollCharge[] => {
  if (!hasCharges(seed.contract)) return []

  return (Object.keys(companyPercents) as PayrollChargeKey[]).map((key) => {
    const percent = companyPercents[key]
    const value = Math.round((seed.baseSalary * percent) / 1000)
    const override = seed.overrides[key] ?? null

    return { key, percent, value: override ?? value, override }
  })
}

const toEmployee = (seed: Seed): PayrollEmployee => {
  const charges = chargesOf(seed)

  return {
    id: seed.id,
    name: seed.name,
    role: seed.role,
    sector: seed.sector,
    contract: seed.contract,
    baseSalary: seed.baseSalary,
    charges,
    benefits: seed.benefits,
    totalCost:
      seed.baseSalary +
      charges.reduce((sum, charge) => sum + charge.value, 0) +
      seed.benefits.reduce((sum, benefit) => sum + benefit.value, 0),
  }
}

export const getPayrollCosts = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()

  const employees = seeds
    .filter((seed) => !filters?.sector || seed.sector === filters.sector)
    .filter((seed) => !search || seed.name.toLowerCase().includes(search))
    .map(toEmployee)

  return {
    success: true,
    data: { percents: companyPercents, employees },
    message: '',
  }
}

export const updateCompanyPercents = async (
  values: Partial<Record<PayrollChargeKey, number>>,
) => {
  Object.assign(companyPercents, values)

  return { success: true, data: companyPercents, message: '' }
}

export const updateEmployeePayroll = async ({
  id,
  baseSalary,
  contract,
  overrides,
}: {
  id: string
  baseSalary?: number
  contract?: ContractType
  overrides?: Partial<Record<PayrollChargeKey, number | null>>
}) => {
  const seed = seeds.find((item) => item.id === id)

  if (!seed) {
    return { success: false, data: null, message: 'Colaborador não encontrado' }
  }

  if (baseSalary !== undefined) seed.baseSalary = baseSalary
  if (contract) seed.contract = contract

  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === null) {
        delete seed.overrides[key as PayrollChargeKey]
      } else if (value !== undefined) {
        seed.overrides[key as PayrollChargeKey] = value
      }
    })
  }

  return { success: true, data: toEmployee(seed), message: '' }
}
