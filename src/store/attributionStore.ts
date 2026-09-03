import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
import type { Attribution } from '@/lib/analytics'

// Store de atribuição (peça #3): captura e persiste oppref + UTMs da URL de
// entrada e os mantém por todas as etapas do cadastro, até a confirmação.
// Ver §6 do documento de medição. NÃO armazenar dados pessoais aqui — apenas
// parâmetros de campanha (oppref, utm_*).

const UTM_PREFIX = 'utm_'

interface AttributionState extends Attribution {
  // Quando a última captura ocorreu (epoch ms), ou null se nunca capturado.
  capturedAt: number | null
  // Captura a partir da query string atual (window.location.search). Só
  // sobrescreve quando há algum parâmetro de atribuição na URL; navegação
  // interna (sem params) preserva o que foi capturado na entrada.
  capture: (search: string) => void
  clear: () => void
}

// Extrai oppref + utm_* da query string. Retorna null quando não há nenhum
// parâmetro de atribuição, para que a navegação interna não apague a captura.
function extractAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search)
  const oppref = params.get('oppref')
  const gclid = params.get('gclid')

  const utm: Record<string, string> = {}
  params.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (lowerKey.startsWith(UTM_PREFIX) && value) {
      utm[lowerKey] = value
    }
  })

  const hasAttribution = !!oppref || !!gclid || Object.keys(utm).length > 0
  if (!hasAttribution) return null

  return { oppref: oppref || null, gclid: gclid || null, utm }
}

export const useAttributionStore = create<AttributionState>()(
  persist(
    (set) => ({
      oppref: null,
      gclid: null,
      utm: {},
      capturedAt: null,

      capture: (search) => {
        const attribution = extractAttribution(search)
        if (!attribution) return // sem params → preserva a captura de entrada
        set({
          oppref: attribution.oppref,
          gclid: attribution.gclid,
          utm: attribution.utm,
          capturedAt: Date.now(),
        })
      },

      clear: () =>
        set({ oppref: null, gclid: null, utm: {}, capturedAt: null }),
    }),
    {
      name: 'attribution-storage',
    },
  ),
)
