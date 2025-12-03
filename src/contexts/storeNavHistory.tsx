'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

type NavigationHistoryType = {
  previousPage: string | null
  currentPage: string | null
}

export function StoreNavHistoryProvider({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMounted, setIsMounted] = useState(false)

  // Garante que o componente só executa após a montagem no cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    try {
      const fullCurrentUrl =
        searchParams.size > 0
          ? `${pathname}?${searchParams.toString()}`
          : pathname

      // Recupera o histórico existente ou inicia um novo
      const navigationHistory: NavigationHistoryType = JSON.parse(
        sessionStorage.getItem('navigationHistory') ||
          JSON.stringify({ previousPage: null, currentPage: null }),
      )

      // Atualiza apenas se a página atual for diferente
      if (navigationHistory.currentPage !== fullCurrentUrl) {
        navigationHistory.previousPage = navigationHistory.currentPage
        navigationHistory.currentPage = fullCurrentUrl

        sessionStorage.setItem(
          'navigationHistory',
          JSON.stringify(navigationHistory),
        )
      }
    } catch (error) {
      console.error('Error handling navigation history:', error)
    }
  }, [pathname, searchParams, isMounted])

  return children
}
