'use server'

// PROVISÓRIO: a API ainda não tem os endpoints do cadastro de materiais
// (recurso do PRO). Dados de exemplo em memória, no formato das actions reais.

// Types
import type {
  Material,
  MaterialUnit,
  MaterialVariation,
} from '@/app/(app-sidebar)/configuracoes/produtos/materiais/types'

const materials: Material[] = [
  {
    id: 'lona-440',
    code: 'MAT-01',
    name: 'Lona 440',
    sector: 'Impressão',
    subcategory: 'Lonas',
    unit: 'M2',
    directSale: false,
    productionMaterial: true,
    priceRule: 'VARIABLE',
    cost: null,
    price: null,
    variations: [
      {
        id: 'v1',
        brand: 'Marca X',
        color: 'Branca',
        cost: 1250,
        price: 2800,
      },
      {
        id: 'v2',
        brand: 'Marca X',
        color: 'Preta',
        cost: 1250,
        price: 2800,
      },
      {
        id: 'v3',
        brand: 'Marca Y',
        color: 'Branca',
        cost: 1420,
        price: 3100,
      },
    ],
    active: true,
  },
  {
    id: 'mdf-10',
    code: 'MAT-02',
    name: 'MDF 10 mm',
    sector: 'Marcenaria',
    subcategory: 'Chapas',
    unit: 'UN',
    directSale: true,
    productionMaterial: true,
    priceRule: 'FIXED',
    cost: null,
    price: null,
    variations: [
      { id: 'v4', brand: 'Marca Y', color: 'Branco', cost: 8900, price: 9500 },
      { id: 'v5', brand: 'Marca Y', color: 'Cru', cost: 8200, price: 9000 },
    ],
    active: true,
  },
  {
    id: 'mdf-15',
    code: 'MAT-03',
    name: 'MDF 15 mm',
    sector: 'Marcenaria',
    subcategory: 'Chapas',
    unit: 'UN',
    directSale: true,
    productionMaterial: true,
    priceRule: 'FIXED',
    cost: 11200,
    price: 12500,
    variations: [],
    active: true,
  },
  {
    id: 'ilhos',
    code: 'MAT-04',
    name: 'Ilhós',
    sector: 'Produção',
    subcategory: 'Acabamentos',
    unit: 'UN',
    directSale: false,
    productionMaterial: true,
    priceRule: 'FIXED',
    cost: 12,
    price: null,
    variations: [],
    active: true,
  },
  {
    id: 'tinta-sublimatica',
    code: 'MAT-05',
    name: 'Tinta sublimática',
    sector: 'Impressão',
    subcategory: 'Tintas',
    unit: 'LT',
    directSale: false,
    productionMaterial: true,
    priceRule: 'VARIABLE',
    cost: 28000,
    price: null,
    variations: [],
    active: true,
  },
]

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
}: {
  name: string
  sector: string
  subcategory: string
  unit: MaterialUnit
  cost: number
  directSale: boolean
  productionMaterial: boolean
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
