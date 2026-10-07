// PROVISÓRIO: os setores da Base de custos e o que forma o custo de cada um,
// compartilhados entre as abas (actions/cost-base.ts) e o rateio do setor
// entre os equipamentos (actions/sector-allocation-data.ts). Não é
// 'use server' de propósito: módulo 'use server' só exporta funções
// assíncronas.

// Types
import type {
  SectorCostItem,
  DistributionSector,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Também provisória. O padrão nasce sem distribuição, como manda o método do
// custo puro (openspec/regras-de-negocio/metodo-custo-puro.md).

export const sectors: DistributionSector[] = [
  {
    id: 'administracao',
    name: 'Administração',
    nature: 'ADMINISTRATIVE',
    percentage: 0,
    directCost: 1619099,
  },
  {
    id: 'comercial',
    name: 'Comercial',
    nature: 'ADMINISTRATIVE',
    percentage: 0,
    directCost: 480000,
  },
  {
    id: 'impressao',
    name: 'Impressão',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 183417,
  },
  {
    id: 'cnc',
    name: 'CNC',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 119583,
  },
  {
    id: 'producao',
    name: 'Produção',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 405750,
  },
  {
    id: 'criacao',
    name: 'Criação',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 362250,
  },
  {
    id: 'grafica',
    name: 'Gráfica',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 30333,
  },
  {
    id: 'frota',
    name: 'Frota',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: 20000,
  },
  {
    id: 'marcenaria',
    name: 'Marcenaria',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: null,
  },
  {
    id: 'instalacao',
    name: 'Instalação',
    nature: 'PRODUCTIVE',
    percentage: 0,
    directCost: null,
  },
]

// Os administrativos formam um total único; o percentual vive nos produtivos (BC-7)
export const administrativeCost = () =>
  sectors
    .filter((sector) => sector.nature === 'ADMINISTRATIVE')
    .reduce((sum, sector) => sum + (sector.directCost || 0), 0)

export const distributedCost = () =>
  sectors
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .reduce(
      (sum, sector) =>
        sum + Math.round((administrativeCost() * sector.percentage) / 100),
      0,
    )

export const sectorCostItems: { [key: string]: SectorCostItem[] } = {
  impressao: [
    {
      id: 'imp-1',
      name: 'Impressora Solvente',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 64167,
    },
    {
      id: 'imp-2',
      name: 'Impressora Solvente',
      origin: 'ASSETS',
      detail: 'Manutenção — a cada 6 meses',
      value: 41667,
    },
    {
      id: 'imp-3',
      name: 'Impressora Sublimática',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 23333,
    },
    {
      id: 'imp-4',
      name: 'Plotter de recorte',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 11667,
    },
    {
      id: 'imp-5',
      name: 'Impressora Offset',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 35000,
    },
    {
      id: 'imp-6',
      name: 'Móveis do setor',
      origin: 'DEPRECIATION',
      detail: 'Cadastro simplificado',
      value: 7583,
    },
  ],
  producao: [
    {
      id: 'prod-1',
      name: 'Marcos — Gerente de produção',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 405750,
    },
  ],
  criacao: [
    {
      id: 'cri-1',
      name: 'Allan — Designer',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 362250,
    },
  ],
  cnc: [
    {
      id: 'cnc-1',
      name: 'Router',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 58333,
    },
    {
      id: 'cnc-2',
      name: 'Router',
      origin: 'ASSETS',
      detail: 'Manutenção e consumíveis',
      value: 60500,
    },
    {
      id: 'cnc-3',
      name: 'Laser CO2',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 32083,
    },
    {
      id: 'cnc-4',
      name: 'Fiber',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 29167,
    },
  ],
  grafica: [
    {
      id: 'gra-1',
      name: 'Laser Color',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 30333,
    },
  ],
  frota: [
    {
      id: 'fro-1',
      name: 'Veículo',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 20000,
    },
  ],
  administracao: [
    {
      id: 'adm-1',
      name: 'Natihely — Administrativo',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 716833,
    },
    {
      id: 'adm-2',
      name: 'Despesas administrativas',
      origin: 'OTHER',
      detail: 'Aluguel, energia, contabilidade e outras contas',
      value: 875099,
    },
    {
      id: 'adm-3',
      name: 'Móveis administrativo',
      origin: 'DEPRECIATION',
      detail: 'Depreciação mensal',
      value: 16667,
    },
    {
      id: 'adm-4',
      name: 'Material de limpeza',
      origin: 'OTHER',
      detail: 'Lançamento direto no setor',
      value: 10500,
    },
  ],
  comercial: [
    {
      id: 'com-1',
      name: 'Equipe comercial',
      origin: 'LABOR',
      detail: 'Salário, encargos e benefícios',
      value: 480000,
    },
  ],
}
