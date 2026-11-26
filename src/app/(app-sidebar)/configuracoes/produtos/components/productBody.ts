// O corpo que a API espera ao gravar um produto, montado a partir do produto
// lido (GET /product/:id). Usado por Duplicar e pela precificação da lista,
// que precisam gravar o produto inteiro sem passar pelo formulário.

/* eslint-disable @typescript-eslint/no-explicit-any */
export const productBodyFrom = (
  source: any,
  overrides: { name?: string; code?: string | undefined } = {},
) => ({
  name: overrides.name ?? source.name,
  code: 'code' in overrides ? overrides.code : source.code,
  categoryId: source.categoryId ?? source.category?.id ?? null,
  sectorId: source.sectorId ?? source.sector?.id ?? null,
  technicalDescription: source.technicalDescription ?? '',
  allowEditValues: source.allowEditValues ?? true,
  allowEditDescription: source.allowEditDescription ?? true,
  imageUrl: source.imageUrl || null,
  imageSize: source.imageSize || null,
  items: (source.items || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    unitKind: item.unitKind,
    unitCost: item.unitCost,
    salePrice: item.salePrice,
    width: item.width ?? null,
    height: item.height ?? null,
    length: item.length ?? null,
    weight: item.weight ?? null,
    volume: item.volume ?? null,
    distance: item.distance ?? null,
    duration: item.duration ?? null,
    // O setor da etapa de cobrança (área 9 §4.16)
    ...(item.sectorId !== undefined && { sectorId: item.sectorId ?? null }),
  })),
  productionStages: (source.productionStages || []).map((stage: any) => ({
    id: stage.id,
    isActive: stage.isActive ?? stage.isAcive ?? false,
  })),
})

// A medida do item nas unidades brutas da API (mm, mm², mg, ml…), para o
// valor de venda da medida padrão sair do valor por unidade
export const rawMeasureOf = (item: any): number => {
  switch (item?.unitKind) {
    case 'AREA':
      return (Number(item.width) || 0) * (Number(item.height) || 0)
    case 'LENGTH':
      return Number(item.length) || 0
    case 'WEIGHT':
      return Number(item.weight) || 0
    case 'CAPACITY':
      return Number(item.volume) || 0
    case 'DISTANCE':
      return Number(item.distance) || 0
    case 'DURATION':
      return Number(item.duration) || 0
    default:
      return 1
  }
}
