'use client'

import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'

export interface HelpData {
  files: string[]
  video: string
}

export function useHelpData() {
  const pathname = usePathname()

  const { data, isLoading } = useQuery({
    queryKey: ['help-data', pathname],
    queryFn: async () => {
      const response = await getItem({
        route: `/academy/help-by-page?page=${encodeURIComponent(pathname)}`,
      })
      if (response.success && response.data) {
        return response.data as HelpData
      }
      return null
    },
    staleTime: Infinity,
    enabled: !!pathname,
  })

  return {
    helpData: data ?? null,
    isLoading,
  }
}
