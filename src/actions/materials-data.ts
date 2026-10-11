// PROVISÓRIO: os materiais de exemplo em memória, compartilhados entre o
// cadastro de materiais (actions/materials.ts) e a composição
// (actions/product-assembly.ts), que lista os materiais como recursos e lê
// as medidas do perfil nas fórmulas (MT-10.1). Não é 'use server' de
// propósito: módulo 'use server' só exporta funções assíncronas.

// Types
import type {
  Material,
  MaterialUnit,
} from '@/app/(app-sidebar)/configuracoes/produtos/materiais/types'

export const materials: Material[] = [
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
    // A chapa de MDF tem medida: é o que permite o aproveitamento (AP-2)
    advanced: { shape: 'SHEET', width: 2750, height: 1850, wholeSheets: true },
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
    advanced: { shape: 'SHEET', width: 2750, height: 1850, wholeSheets: true },
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
    id: 'metalon-50x30',
    code: 'MAT-06',
    name: 'Metalon 50 × 30',
    sector: 'Serralheria',
    subcategory: 'Perfis',
    unit: 'M',
    directSale: false,
    productionMaterial: true,
    priceRule: 'FIXED',
    cost: 1850,
    price: null,
    variations: [],
    active: true,
    // A porta do time (03/10/2026): 50 × 30 → X 50, Y 30
    advanced: {
      shape: 'PROFILE',
      x: 50,
      y: 30,
      barLength: 6000,
      weight: 1.9,
    },
  },
  {
    id: 'metalon-40x40',
    code: 'MAT-07',
    name: 'Metalon 40 × 40',
    sector: 'Serralheria',
    subcategory: 'Perfis',
    unit: 'M',
    directSale: false,
    productionMaterial: true,
    priceRule: 'FIXED',
    cost: 2100,
    price: null,
    variations: [],
    active: true,
    advanced: {
      shape: 'PROFILE',
      x: 40,
      y: 40,
      barLength: 6000,
      weight: 2.3,
    },
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

// A unidade como a composição mostra
const unitSymbol: { [key: string]: string } = {
  M2: 'm²',
  M: 'm',
  UN: 'un',
  KG: 'kg',
  LT: 'l',
  L: 'l',
  HR: 'h',
  KM: 'km',
}

export const materialUnitSymbol = (unit: MaterialUnit) =>
  unitSymbol[unit as string] || String(unit).toLowerCase()

// Os materiais como recursos da composição: um por variação quando houver
// (MT-3), com o custo e o preço de venda do cadastro, e as referências da
// configuração avançada que as fórmulas e o aproveitamento leem
export const materialResources = () =>
  materials
    .filter((material) => material.active && material.productionMaterial)
    .flatMap((material) => {
      const unit = materialUnitSymbol(material.unit)
      const advanced = material.advanced
      const extra = {
        ...(advanced?.shape === 'PROFILE' && advanced.x && advanced.y
          ? {
              profile: {
                x: advanced.x,
                y: advanced.y,
                barLength: advanced.barLength ?? null,
              },
            }
          : {}),
        ...(advanced?.shape === 'SHEET' && advanced.width && advanced.height
          ? {
              sheet: {
                width: advanced.width / 1000,
                height: advanced.height / 1000,
                wholeSheets: advanced.wholeSheets !== false,
              },
            }
          : {}),
        // Peso por unidade de venda do material, em quilos
        ...(advanced?.weight ? { weight: advanced.weight } : {}),
      }
      if (material.variations.length) {
        return material.variations.map((variation) => ({
          id: `mat:${material.id}:${variation.id}`,
          name: `${material.name} · ${variation.brand} ${variation.color}`.trim(),
          unit,
          unitCost: variation.cost ?? 0,
          unitSale: variation.price ?? undefined,
          ...extra,
        }))
      }
      return [
        {
          id: `mat:${material.id}`,
          name: material.name,
          unit,
          unitCost: material.cost ?? 0,
          unitSale: material.price ?? undefined,
          ...extra,
        },
      ]
    })
