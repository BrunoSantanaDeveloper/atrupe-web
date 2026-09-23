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

  const bases: { [key in FormulaKey]: number } = {
    FIXED: resource.quantity,
    SELLER: resource.quantity,
    PER_AREA: area * resource.quantity,
    PER_UNIT: resource.quantity,
    PER_PERIMETER: perimeter * resource.quantity,
    PER_WIDTH: simulation.width * resource.quantity,
    PER_HEIGHT: simulation.height * resource.quantity,
    PER_EXTRA: extra * resource.quantity,
    PER_TIME: resource.quantity,
  }

  return bases[resource.formula] * simulation.quantity
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
