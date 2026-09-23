// Tipos do custo da folha no PRO (regras-de-negocio/areas/02-folha-de-pagamento.md).
// Valores em centavos, percentuais em décimos de ponto (110 = 11,0%).

export type ContractType = 'EMPLOYEE' | 'MEI' | 'PARTNER'

export type PayrollChargeKey = 'INSS' | 'FGTS' | 'THIRTEENTH' | 'VACATION'

export type PayrollCharge = {
  key: PayrollChargeKey
  percent: number
  // Valor calculado sobre o salário base; `override` guarda a edição manual
  value: number
  override: number | null
}

export type PayrollEmployee = {
  id: string
  name: string
  role: string
  sector: string
  contract: ContractType
  baseSalary: number
  charges: PayrollCharge[]
  benefits: { id: string; name: string; value: number }[]
  totalCost: number
}
