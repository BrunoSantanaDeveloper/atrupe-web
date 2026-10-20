'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import type { MouseEvent } from 'react'

// Caminho marcado como ativo no clique, antes de a página nova chegar
// (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 5). Volta ao `pathname`
// real assim que ele muda.
export function usePendingPath() {
  const pathname = usePathname()
  const [pendingPath, setPendingPath] = useState<string | null>(null)

  useEffect(() => {
    setPendingPath(null)
  }, [pathname])

  // Clique com modificador abre outra aba: a página atual não muda
  const markPending = useCallback(
    (path?: string) => (event: MouseEvent) => {
      if (
        !path ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      setPendingPath(path)
    },
    [],
  )

  return { currentPath: pendingPath ?? pathname, markPending }
}
