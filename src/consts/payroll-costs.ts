// Custo da folha no PRO (regras-de-negocio/areas/02-folha-de-pagamento.md).
// Separado de payroll.ts, que é do START.

// Types
import type {
  ContractType,
  PayrollChargeKey,
} from '@/app/(app-sidebar)/configuracoes/financeiro/folhas-de-pagamento/custos/types'

// Três formas de contratação na folha; o autônomo segue a regra de
// terceirizados e não entra aqui (F-10 e F-12)
export const contractTypeObj: { [key in ContractType]: string } = {
  EMPLOYEE: 'Registrado',
  MEI: 'MEI ou PJ',
  PARTNER: 'Sócio com pró-labore',
}

export const contractTypeOptions = (
  Object.keys(contractTypeObj) as ContractType[]
).map((type) => ({ value: type, label: contractTypeObj[type] }))

export const payrollChargeObj: { [key in PayrollChargeKey]: string } = {
  INSS: 'INSS',
  FGTS: 'FGTS',
  THIRTEENTH: '13º salário',
  VACATION: 'Férias',
}

// Percentuais padrão, editáveis pela empresa e por colaborador (F-1 e F-7)
export const defaultChargePercents: { [key in PayrollChargeKey]: number } = {
  INSS: 110,
  FGTS: 80,
  THIRTEENTH: 83,
  VACATION: 111,
}
