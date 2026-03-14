'use client'

import { useState, useEffect } from 'react'

type NavigationHistoryType = {
  previousPage: string | null
  currentPage: string | null
}

export function usePreviousUrl(defaultUrl: string, allowedPrefix?: string) {
  const [previousUrl, setPreviousUrl] = useState<string>(defaultUrl)

  useEffect(() => {
    try {
      const navigationHistory = JSON.parse(
        sessionStorage.getItem('navigationHistory') ||
          JSON.stringify({ previousPage: null, currentPage: null }),
      ) as NavigationHistoryType

      const prev = navigationHistory.previousPage
      if (prev && (!allowedPrefix || prev.startsWith(allowedPrefix))) {
        setPreviousUrl(prev)
      } else {
        setPreviousUrl(defaultUrl)
      }
    } catch (error) {
      console.error('Error reading navigation history:', error)
      setPreviousUrl(defaultUrl)
    }
  }, [defaultUrl, allowedPrefix])

  return previousUrl
}
