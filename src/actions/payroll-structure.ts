'use server'

// PROVISÓRIO: a API ainda não devolve acréscimo e desconto separados nem o
// comportamento do item (ALT-18 e ALT-19). Dados de exemplo em memória, no
// formato das actions reais, para a tela poder ser conferida contra o legado
// antes de o backend existir.
//
// O exemplo reproduz o colaborador NATIHELY do legado, registrado em
// openspec/regras-de-negocio/legado-patrimonios-e-folha.md §6.

// Types
import type {
  PayrollBehavior,
  PayrollStructureEmployee,
} from '@/app/(app-sidebar)/configuracoes/financeiro/folhas-de-pagamento/types'

const item = (
  id: string,
  name: string,
  behavior: PayrollBehavior,
  increase: number,
  discount = 0,
) => ({ id, name, behavior, increase, discount })

const employees: PayrollStructureEmployee[] = [
  {
    id: 'e1',
    name: 'Natihely Ribeiro',
    roleName: 'Designer',
    sectorName: 'Criação',
    contract: 'CLT',
    baseSalary: 500000,
    monthlyHours: 220,
    items: [
      item('i1', 'Salário base', 'ONLY_INCREASE', 500000),
      item('i2', 'INSS', 'INCREASE_AND_DISCOUNT', 40000, 40000),
      item('i3', 'FGTS', 'PROVISION', 40000),
      item('i4', '13º salário + FGTS + INSS', 'PROVISION', 48333),
      item('i5', 'Férias + FGTS + INSS', 'PROVISION', 15000),
      item('i6', 'Ajuda de custo', 'INCREASE_AND_DISCOUNT', 15000, 1500),
      item('i7', 'Insalubridade', 'ONLY_INCREASE', 100000),
      item('i8', 'Vale transporte', 'INCREASE_AND_DISCOUNT', 10000, 25000),
      item('i9', 'Hora falta', 'ONLY_DISCOUNT', 0, 8000),
    ],
  },
  {
    id: 'e2',
    name: 'Marcos Andrade',
    roleName: 'Impressor',
    sectorName: 'Impressão',
    contract: 'CLT',
    baseSalary: 320000,
    monthlyHours: 220,
    items: [
      item('i1', 'Salário base', 'ONLY_INCREASE', 320000),
      item('i2', 'INSS', 'INCREASE_AND_DISCOUNT', 25600, 25600),
      item('i3', 'FGTS', 'PROVISION', 25600),
      item('i4', '13º salário + FGTS + INSS', 'PROVISION', 30933),
      item('i5', 'Férias + FGTS + INSS', 'PROVISION', 9600),
      item('i8', 'Vale transporte', 'INCREASE_AND_DISCOUNT', 10000, 19200),
    ],
  },
  {
    id: 'e3',
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

export const getPayrollStructure = async () => ({
  success: true,
  data: employees,
  message: '',
})
