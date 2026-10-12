// A cor do setor, num lugar só (regra de 05/10/2026, área 9 §4.14): a cor
// escolhida no cadastro de setores (campo `color` do setor, por id ou
// nome) ou o padrão do setor conhecido. Quem tem o setor na mão usa
// `sectorColor`; quem está num componente usa o hook `useSectorColor`, que
// já carrega as escolhas.

import { sectorDefaultColor } from '@/consts/sectors'

export type SectorRef = {
  id?: string | null
  name?: string | null
  icon?: string | null
}

export type SectorColorMap = Record<string, string>

// Também usado por quem monta o mapa de cores (actions/sector-colors.ts)
export const normalizeSectorName = (value: string) =>
  value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export const sectorColor = (
  sector: SectorRef | string,
  chosen: SectorColorMap = {},
) => {
  const ref: SectorRef = typeof sector === 'string' ? { name: sector } : sector
  if (ref.id && chosen[ref.id]) return chosen[ref.id]
  if (ref.name && chosen[normalizeSectorName(ref.name)])
    return chosen[normalizeSectorName(ref.name)]
  return sectorDefaultColor(ref)
}

// Fundo claro da cor, legível sobre branco (10 % de opacidade)
export const sectorTint = (color: string) => `${color}1A`

// Borda suave (40 % de opacidade)
export const sectorEdge = (color: string) => `${color}66`
