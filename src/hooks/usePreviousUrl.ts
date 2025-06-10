'use client'

import { useState, useEffect } from 'react'

type NavigationHistoryType = {
  previousPage: string | null
  currentPage: string | null
}

export function usePreviousUrl(defaultUrl: string) {
  const [previousUrl, setPreviousUrl] = useState<string>(defaultUrl)

  useEffect(() => {
    try {
      const navigationHistory = JSON.parse(
        localStorage.getItem('navigationHistory') ||
          JSON.stringify({ previousPage: null, currentPage: null }),
      ) as NavigationHistoryType

      setPreviousUrl(navigationHistory.previousPage || defaultUrl)
    } catch (error) {
      console.error('Error reading navigation history:', error)
      setPreviousUrl(defaultUrl)
    }
  }, [defaultUrl])

  return previousUrl
}
