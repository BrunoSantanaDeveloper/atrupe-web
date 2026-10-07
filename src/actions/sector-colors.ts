'use server'

// PROVISÓRIO: a API do setor (`/sector`) devolve `icon`, mas não tem cor. A
// cor escolhida no cadastro de setores fica aqui, por id do setor e pelo
// nome (a composição e a produção só conhecem o nome), até a API ganhar o
// campo `color` (backend-pendente.md). Sem escolha, vale o padrão do setor
// (src/consts/sectors.ts).

import { auth } from '@/lib/auth'

const normalize = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// Por empresa: { chave → cor }, onde a chave é o id do setor ou o nome
// normalizado
const byCompany = new Map<string, Record<string, string>>()

const companyKey = async () => {
  const session = await auth()
  return session?.company?.id || 'sem-empresa'
}

export const getSectorColors = async () => {
  const key = await companyKey()
  return { success: true, data: byCompany.get(key) || {}, message: '' }
}

export const setSectorColor = async ({
  sectorId,
  name,
  color,
}: {
  sectorId: string
  name: string
  // Vazio volta ao padrão
  color: string | null
}) => {
  if (color && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { success: false, data: null, message: 'Cor inválida' }
  }
  const key = await companyKey()
  const map = { ...(byCompany.get(key) || {}) }
  const keys = [sectorId, normalize(name)].filter(Boolean)
  keys.forEach((entry) => {
    if (color) map[entry] = color.toUpperCase()
    else delete map[entry]
  })
  byCompany.set(key, map)
  return { success: true, data: map, message: '' }
}
