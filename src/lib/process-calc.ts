// Cálculo das fórmulas do processo (D3 §9.2). Fica fora das actions porque
// arquivos 'use server' só exportam funções assíncronas.

// Types
import type {
  FormulaKey,
  ProcessResource,
  ProcessSimulation,
} from '@/app/(app-sidebar)/configuracoes/produtos/processos/types'

// Medidas em metros. A base da fórmula multiplica o custo unitário do recurso.
export const resourceAmount = (
  resource: ProcessResource,
  simulation: ProcessSimulation,
  extras: { [key: string]: number },
) => {
  const area = simulation.width * simulation.height
  const perimeter = 2 * (simulation.width + simulation.height)
  const extra = resource.extraFieldId ? extras[resource.extraFieldId] || 0 : 0

  const k = resource.quantity
  const n = simulation.quantity
  const w = simulation.width
  const h = simulation.height

  // O total da fórmula, já com a quantidade quando ela entra na conta. As
  // fórmulas "uma vez" (fixo, campo extra sozinho, tempo) não multiplicam
  const totals: { [key in FormulaKey]: number } = {
    FIXED: k,
    SELLER: k * n,
    PER_AREA: area * k * n,
    PER_UNIT: k * n,
    PER_PERIMETER: perimeter * k * n,
    PER_WIDTH: w * k * n,
    PER_HEIGHT: h * k * n,
    PER_EXTRA: extra * k * n,
    PER_TIME: k * n,
    // Quantos cabem no perímetro: nunca fração (o ilhós a cada 50 cm)
    PER_PERIMETER_DIV_EXTRA:
      extra > 0 ? Math.ceil(perimeter / extra) * k * n : 0,
    TIME_TIMES_EXTRA: k * extra,
    EQUAL_TIME: k,
    PER_WIDTH_EXTRA: w * extra * k * n,
    PER_HEIGHT_EXTRA: h * extra * k * n,
    EXTRA_ONLY: k * extra,
    PER_AREA_DIV_EXTRA: extra > 0 ? (area * k * n) / extra : 0,
    PER_PERIMETER_EXTRA: perimeter * extra * k * n,
    DIV_EXTRA: extra > 0 ? k / extra : 0,
    AREA_EXTRA: area * extra * k,
    PER_AREA_EXTRA: area * extra * k * n,
  }

  // Perda e mínimo do recurso (CP-8)
  const withLoss =
    totals[resource.formula] * (1 + (resource.lossPercent || 0) / 100)
  return resource.minimum ? Math.max(withLoss, resource.minimum) : withLoss
}

// Custo do recurso na simulação, em centavos
export const resourceCost = (
  resource: ProcessResource,
  simulation: ProcessSimulation,
  extras: { [key: string]: number },
) =>
  resource.unitCost === null
    ? null
    : Math.round(
        resource.unitCost * resourceAmount(resource, simulation, extras),
      )
