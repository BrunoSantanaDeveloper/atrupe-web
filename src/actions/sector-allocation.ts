'use server'

// PROVISÓRIO: a API ainda não tem o critério do rateio do setor entre os
// equipamentos (BC-3, BC-3.1, BC-4). Estas actions devolvem dados de exemplo
// em memória, no mesmo formato `{ success, data, message }` das actions reais.
// Rota esperada: `GET/PUT /cost-base/sector/:id/allocation`
// (openspec/analise/backend-pendente.md).

// Types
import type {
  AllocationCriterion,
  SectorAllocation,
} from '@/app/(app-sidebar)/base-de-custos/types'

// Data
import { sectors } from './cost-base-data'
import {
  configOf,
  saveConfig,
  equipmentOf,
  sectorAllocation,
} from './sector-allocation-data'

const fail = (message: string) => ({ success: false, data: null, message })

// Os setores produtivos que têm equipamento detalhado: são os que têm o que
// ratear entre equipamentos (P-15, P-16)
export const getSectorAllocations = async () => {
  const data = sectors
    .filter((sector) => sector.nature === 'PRODUCTIVE')
    .filter((sector) => equipmentOf(sector.name).length)
    .map((sector) => sectorAllocation(sector.id))
    .filter((item): item is SectorAllocation => item !== null)

  return { success: true, data, message: '' }
}

export const updateSectorAllocation = async ({
  sectorId,
  criterion,
  percentages,
}: {
  sectorId: string
  criterion: AllocationCriterion
  // Só no critério manual: o percentual de cada equipamento
  percentages?: { id: string; percentage: number }[]
}) => {
  const sector = sectors.find((item) => item.id === sectorId)
  if (!sector) return fail('Setor não encontrado')
  if (sector.nature !== 'PRODUCTIVE') {
    return fail('Só setor produtivo tem rateio entre equipamentos')
  }

  const equipment = equipmentOf(sector.name)
  if (!equipment.length) {
    return fail('Este setor não tem equipamento detalhado para ratear')
  }

  const current = configOf(sectorId)

  if (criterion !== 'MANUAL') {
    saveConfig(sectorId, {
      criterion,
      previousCriterion: null,
      manual: {},
    })

    return { success: true, data: sectorAllocation(sectorId), message: '' }
  }

  // Manual: um percentual para cada equipamento detalhado do setor, entre 0 e
  // 100, fechando 100% (BC-3.1). O fechamento é conferido pelo valor, com
  // tolerância de 1 centavo, como nos outros rateios: o percentual que vem de
  // um valor arredondado à mão pode ter mais de duas casas (BC-9)
  const manual: { [id: string]: number } = {}
  for (const asset of equipment) {
    const value = percentages?.find((item) => item.id === asset.id)?.percentage
    if (value === undefined || !Number.isFinite(value)) {
      return fail(`Informe o percentual de ${asset.name}`)
    }
    if (value < 0 || value > 100) {
      return fail(`O percentual de ${asset.name} precisa ficar entre 0 e 100%`)
    }
    manual[asset.id] = value
  }

  const values = Object.values(manual)
  const pool = sectorAllocation(sectorId)?.pool || 0
  const closed = pool
    ? Math.abs(
        values.reduce(
          (sum, value) => sum + Math.round((pool * value) / 100),
          0,
        ) - pool,
      ) <= 1
    : Math.abs(values.reduce((sum, value) => sum + value, 0) - 100) < 0.005
  if (!closed) {
    return fail('A soma dos equipamentos precisa fechar 100%')
  }

  saveConfig(sectorId, {
    criterion: 'MANUAL',
    // Guarda de onde o manual nasceu, para o custo da configuração produtiva
    // partir do mesmo ponto (ver allocationFactor)
    previousCriterion:
      current.criterion === 'MANUAL'
        ? current.previousCriterion
        : current.criterion,
    manual,
  })

  return { success: true, data: sectorAllocation(sectorId), message: '' }
}
