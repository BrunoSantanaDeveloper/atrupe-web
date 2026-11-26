// As etapas de cobrança e os setores delas (área 9 §4.16; Maicol,
// 26/11/2026). Cada unidade de venda aponta o setor em que é feita: esse
// setor é um ícone fixo do fluxo de produção. Com uma unidade só, o setor da
// unidade é o setor do produto, quando ele é etapa de produção.

// O valor do seletor para "não passa por setor" (as ponteiras do banner)
export const NO_SECTOR = 'none'

type Unit = { sectorId?: string | null }

/** O setor gravado na unidade de venda, a partir do formulário. */
export const unitSectorOf = (
  unit: Unit,
  units: number,
  productSectorId: string | null | undefined,
  productionSectorIds: Set<string>,
): string | null => {
  if (units === 1) {
    return productSectorId && productionSectorIds.has(productSectorId)
      ? productSectorId
      : null
  }
  return unit.sectorId && unit.sectorId !== NO_SECTOR ? unit.sectorId : null
}

/** Os ícones fixos do produto: os setores das etapas de cobrança. */
export const fixedSectorIds = (
  units: Unit[] | undefined,
  productSectorId: string | null | undefined,
  productionSectorIds: Set<string>,
): string[] =>
  (units ?? [])
    .map((unit) =>
      unitSectorOf(
        unit,
        units?.length ?? 0,
        productSectorId,
        productionSectorIds,
      ),
    )
    .filter((id, index, all): id is string => !!id && all.indexOf(id) === index)
