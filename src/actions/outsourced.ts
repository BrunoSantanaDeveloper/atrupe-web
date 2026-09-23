'use server'

// PROVISÓRIO: a API ainda não tem os endpoints de terceirizados (recurso do
// PRO). Dados de exemplo em memória, no formato das actions reais.

// Types
import type { OutsourcedService } from '@/app/(app-sidebar)/configuracoes/produtos/terceirizados/types'

type Seed = Omit<OutsourcedService, 'margin'>

const seeds: Seed[] = [
  {
    id: 'instalacao',
    name: 'Instalação em altura',
    supplier: 'Alpinismo Industrial ME',
    unit: 'un',
    cost: 18000,
    price: 30000,
    active: true,
  },
  {
    id: 'corte-laser',
    name: 'Corte a laser em aço',
    supplier: 'Metalúrgica Sul',
    unit: 'm',
    cost: 4500,
    price: 8000,
    active: true,
  },
  {
    id: 'costura',
    name: 'Costura de lona',
    supplier: 'Costura Express',
    unit: 'm',
    cost: 900,
    price: null,
    active: true,
  },
]

const withMargin = (seed: Seed): OutsourcedService => ({
  ...seed,
  margin: seed.price
    ? Math.round(((seed.price - seed.cost) / seed.price) * 1000) / 10
    : null,
})

export const getOutsourcedServices = async ({
  filters,
}: {
  filters?: { [key: string]: string | undefined }
}) => {
  const search = filters?.search?.trim().toLowerCase()

  const data = seeds
    .filter((seed) => seed.active)
    .filter(
      (seed) =>
        !search ||
        seed.name.toLowerCase().includes(search) ||
        seed.supplier.toLowerCase().includes(search),
    )
    .map(withMargin)

  return { success: true, data, message: '' }
}

export const createOutsourcedService = async ({
  name,
  supplier,
  unit,
  cost,
  price,
}: {
  name: string
  supplier: string
  unit: string
  cost: number
  price: number | null
}) => {
  if (!name?.trim() || !supplier?.trim()) {
    return {
      success: false,
      data: null,
      message: 'Informe o fornecedor e o serviço',
    }
  }

  const seed: Seed = {
    id: `outsourced-${seeds.length + 1}`,
    name,
    supplier,
    unit,
    cost,
    price,
    active: true,
  }

  seeds.push(seed)

  return { success: true, data: withMargin(seed), message: '' }
}

export const updateOutsourcedPrice = async ({
  id,
  price,
}: {
  id: string
  price: number
}) => {
  const seed = seeds.find((item) => item.id === id)

  if (!seed) {
    return { success: false, data: null, message: 'Serviço não encontrado' }
  }

  seed.price = price

  return { success: true, data: withMargin(seed), message: '' }
}
