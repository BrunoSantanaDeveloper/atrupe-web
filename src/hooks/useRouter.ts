'use client'

import { useMemo } from 'react'
import { useRouter as useNextRouter } from 'next/navigation'

import { startNavigationProgress } from '@/components/layout/NavigationProgress'

type AppRouter = ReturnType<typeof useNextRouter>

function startIfUrlChanges(href: string) {
  const url = new URL(href, window.location.href)
  if (
    url.origin === window.location.origin &&
    (url.pathname !== window.location.pathname ||
      url.search !== window.location.search)
  ) {
    startNavigationProgress()
  }
}

// O `useRouter` do Next com a barra de progresso nas navegações por código
// (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 5). Mesma API.
export function useRouter(): AppRouter {
  const router = useNextRouter()

  return useMemo(
    () => ({
      ...router,
      push: (href, options) => {
        startIfUrlChanges(href)
        router.push(href, options)
      },
      replace: (href, options) => {
        startIfUrlChanges(href)
        router.replace(href, options)
      },
    }),
    [router],
  )
}
