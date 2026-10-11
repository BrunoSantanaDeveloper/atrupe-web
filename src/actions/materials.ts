'use server'

// PROVISÓRIO: a API ainda não tem os endpoints do cadastro de materiais
// (recurso do PRO). Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  Material,
  MaterialUnit,
  MaterialAdvanced,
  MaterialVariation,
} from '@/app/(app-sidebar)/configuracoes/produtos/materiais/types'

// Os dados ficam num módulo comum: a composição lê os materiais daqui para
// a lista de recursos e para as medidas do perfil nas fórmulas
import { materials } from './materials-data'

export const getMaterials = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()
  const status = filters?.status || 'ativos'

  const data = materials
    .filter((material) =>
      status === 'inativos' ? !material.active : material.active,
    )
    .filter(
      (material) => !filters?.sector || material.sector === filters.sector,
    )
    .filter(
      (material) =>
        !search ||
        material.name.toLowerCase().includes(search) ||
        material.code.toLowerCase().includes(search),
    )

  return { success: true, data, message: '' }
}

export const createMaterial = async ({
  name,
  sector,
  subcategory,
  unit,
  cost,
  directSale,
  productionMaterial,
  advanced,
}: {
  name: string
  sector: string
  subcategory: string
  unit: MaterialUnit
  cost: number
  directSale: boolean
  productionMaterial: boolean
  advanced?: MaterialAdvanced
}) => {
  if (!name?.trim()) {
    return { success: false, data: null, message: 'Informe o nome do material' }
  }

  const material: Material = {
    id: `material-${materials.length + 1}`,
    code: `MAT-${String(materials.length + 1).padStart(2, '0')}`,
    name,
    sector,
    subcategory,
    unit,
    directSale,
    productionMaterial,
    priceRule: 'FIXED',
    cost,
    price: null,
    variations: [],
    active: true,
    advanced,
  }

  materials.push(material)

  return { success: true, data: material, message: '' }
}

export const updateMaterial = async ({
  id,
  ...values
}: Partial<Material> & { id: string }) => {
  const material = materials.find((item) => item.id === id)

  if (!material) {
    return { success: false, data: null, message: 'Material não encontrado' }
  }

  if (values.name !== undefined && !values.name.trim()) {
    return { success: false, data: null, message: 'Informe o nome do material' }
  }

  Object.assign(material, values)

  return { success: true, data: material, message: '' }
}

// Ao criar variações, o preço do material deixa de valer: a venda passa a exigir
// a escolha da variação (MT-3). O valor nasce repetido e pode ser alterado
// linha a linha (MT-4).
export const createMaterialVariations = async ({
  materialId,
  brands,
  colors,
  cost,
  price,
}: {
  materialId: string
  brands: string[]
  colors: string[]
  cost: number
  price: number | null
}) => {
  const material = materials.find((item) => item.id === materialId)

  if (!material) {
    return { success: false, data: null, message: 'Material não encontrado' }
  }

  const combinations: MaterialVariation[] = []

  brands.forEach((brand) => {
    colors.forEach((color) => {
      const exists = material.variations.some(
        (variation) => variation.brand === brand && variation.color === color,
      )

      if (!exists) {
        combinations.push({
          id: `var-${brand}-${color}-${Date.now()}`,
          brand,
          color,
          cost,
          price,
        })
      }
    })
  })

  material.variations.push(...combinations)
  material.cost = null
  material.price = null

  return { success: true, data: combinations.length, message: '' }
}

export const updateMaterialVariation = async ({
  materialId,
  variationId,
  cost,
  price,
}: {
  materialId: string
  variationId: string
  cost: number | null
  price: number | null
}) => {
  const material = materials.find((item) => item.id === materialId)
  const variation = material?.variations.find((item) => item.id === variationId)

  if (!variation) {
    return { success: false, data: null, message: 'Variação não encontrada' }
  }

  variation.cost = cost
  variation.price = price

  return { success: true, data: variation, message: '' }
}

// Material usado em composição ou venda tem histórico: é INATIVADO, não
// excluído. Inativo, some das listas de escolha e continua nos registros
export const setMaterialActive = async ({
  id,
  active,
}: {
  id: string
  active: boolean
}) => {
  const material = materials.find((item) => item.id === id)

  if (!material) {
    return { success: false, data: null, message: 'Material não encontrado' }
  }

  material.active = active

  return { success: true, data: material, message: '' }
}

/* ---------------------------------------------------------------------------
 * Importar lista de materiais com conciliação (IMP-1, área 4). A planilha
 * que vem do SketchUp, da marcenaria ou do fornecedor entra aqui, e cada
 * linha é conciliada com o material cadastrado: o nome que já bate entra
 * como atualização; o que a pessoa vinculou à mão fica guardado como de-para
 * e, da segunda vez, o sistema já sabe. O que não existe é cadastrado na
 * hora.
 * ------------------------------------------------------------------------- */

export type ImportRow = {
  name: string
  unit: string
  sector?: string
  cost: number | null
}

export type ImportStatus = 'NEW' | 'MATCH' | 'LINKED' | 'INVALID'

export type ImportPreviewRow = ImportRow & {
  line: number
  status: ImportStatus
  // O material com que a linha foi conciliada (MATCH pelo nome, LINKED pelo
  // de-para aprendido)
  materialId: string | null
  materialName: string | null
  unitKey: MaterialUnit | null
  problem?: string
}

// O de-para aprendido: nome como veio de fora → material interno
const importLinks = new Map<string, string>()

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// A unidade como as planilhas escrevem, para a unidade do cadastro
const unitAliases: { [key: string]: MaterialUnit } = {
  m2: 'M2',
  'm²': 'M2',
  mq: 'M2',
  'metro quadrado': 'M2',
  m: 'M',
  ml: 'M',
  metro: 'M',
  'metro linear': 'M',
  un: 'UN',
  und: 'UN',
  unid: 'UN',
  unidade: 'UN',
  pc: 'UN',
  pç: 'UN',
  folha: 'UN',
  chapa: 'UN',
  kg: 'KG',
  quilo: 'KG',
  l: 'LT',
  lt: 'LT',
  litro: 'LT',
  h: 'HR',
  hr: 'HR',
  hora: 'HR',
  km: 'KM',
}

const unitOf = (value: string): MaterialUnit | null =>
  unitAliases[normalize(value)] ?? null

const classify = (row: ImportRow, line: number): ImportPreviewRow => {
  const base = {
    ...row,
    line,
    materialId: null,
    materialName: null,
    unitKey: unitOf(row.unit || ''),
  }
  if (!row.name?.trim()) {
    return { ...base, status: 'INVALID', problem: 'Linha sem nome' }
  }
  if (!base.unitKey) {
    return {
      ...base,
      status: 'INVALID',
      problem: `Unidade "${row.unit || ''}" não reconhecida (use m², m, un, kg, l)`,
    }
  }
  const key = normalize(row.name)
  const linked = importLinks.get(key)
  const match =
    (linked && materials.find((item) => item.id === linked)) ||
    materials.find((item) => normalize(item.name) === key)
  if (match) {
    return {
      ...base,
      status: linked ? 'LINKED' : 'MATCH',
      materialId: match.id,
      materialName: match.name,
    }
  }
  return { ...base, status: 'NEW' }
}

export const previewMaterialImport = async ({ rows }: { rows: ImportRow[] }) =>
  ({
    success: true,
    data: rows.map((row, index) => classify(row, index + 1)),
    message: '',
  }) as const

export const importMaterials = async ({
  rows,
}: {
  // A linha já conciliada: `materialId` é a decisão da pessoa (ou a do
  // sistema), e vazio cadastra material novo
  rows: (ImportRow & { materialId: string | null; sector?: string })[]
}) => {
  let created = 0
  let updated = 0
  rows.forEach((row) => {
    const unit = unitOf(row.unit || '')
    if (!row.name?.trim() || !unit) return
    const key = normalize(row.name)
    const target = row.materialId
      ? materials.find((item) => item.id === row.materialId)
      : undefined
    if (target) {
      // A decisão fica guardada: da próxima vez o sistema já sabe (área 4)
      if (normalize(target.name) !== key) importLinks.set(key, target.id)
      // Custo atualizado só onde ele vive: sem variação, no material
      if (row.cost !== null && !target.variations.length) target.cost = row.cost
      updated += 1
      return
    }
    materials.push({
      id: `material-${materials.length + 1}-${Date.now()}`,
      code: `MAT-${String(materials.length + 1).padStart(2, '0')}`,
      name: row.name.trim(),
      sector: row.sector?.trim() || 'Produção',
      subcategory: 'Importados',
      unit,
      directSale: false,
      productionMaterial: true,
      priceRule: 'VARIABLE',
      cost: row.cost,
      price: null,
      variations: [],
      active: true,
    })
    created += 1
  })
  return { success: true, data: { created, updated }, message: '' }
}
