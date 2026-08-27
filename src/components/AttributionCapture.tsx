'use client'

import { useEffect } from 'react'

// Store
import { useAttributionStore } from '@/store/attributionStore'

// Captura oppref + UTMs na entrada do funil de cadastro (peça #3). Montado no
// layout de auth para cobrir tanto a entrada direta em /cadastro/inicio quanto
// a vinda do site institucional (www → app) via CTA. Não renderiza nada.
export function AttributionCapture() {
  const capture = useAttributionStore((state) => state.capture)

  useEffect(() => {
    if (typeof window === 'undefined') return
    capture(window.location.search)
  }, [capture])

  return null
}
