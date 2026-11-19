'use client'

// As novidades do sistema (19/11/2026): o sino do topo, o aviso "O que mudou"
// do painel e a página Novidades. Rotas /release-notes da API.

import { useQuery, useQueryClient } from '@tanstack/react-query'

import { createItemNew, getItem } from '@/actions/_cruds'

export type ReleaseItemKind = 'NEW' | 'IMPROVEMENT' | 'FIX'

export type ReleaseNote = {
  id: string
  title: string
  summary: string
  version: string | null
  items: { kind: ReleaseItemKind; text: string }[]
  plans: string[]
  highlight: boolean
  publishedAt: string | null
  /** Só na lista do cliente */
  seen?: boolean
}

export type ReleaseSummary = {
  unread: number
  /** A atualização que o painel anuncia, uma vez */
  announce: ReleaseNote | null
}

export const RELEASE_SUMMARY_KEY = ['release-notes', 'summary']
export const RELEASE_LIST_KEY = ['release-notes', 'list']

/** Quantas não vistas e a atualização a anunciar no painel. */
export function useReleaseSummary() {
  return useQuery({
    queryKey: RELEASE_SUMMARY_KEY,
    queryFn: async () => {
      const res = await getItem({ route: '/release-notes/summary' })
      return res.success ? (res.data as ReleaseSummary) : null
    },
    // A novidade sai quando o Super Admin publica: confere a cada 10 min
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  })
}

/** As novidades do plano da empresa, das mais novas para as mais antigas. */
export function useReleaseNotes(enabled = true) {
  return useQuery({
    queryKey: RELEASE_LIST_KEY,
    queryFn: async () => {
      const res = await getItem({ route: '/release-notes' })
      return res.success ? ((res.data as ReleaseNote[]) ?? []) : []
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

/** Marcar vistas (o sino aberto) e anunciada (o aviso do painel fechado). */
export function useReleaseActions() {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: RELEASE_SUMMARY_KEY })
    queryClient.invalidateQueries({ queryKey: RELEASE_LIST_KEY })
  }
  return {
    markSeen: async (ids?: string[]) => {
      await createItemNew({
        route: '/release-notes/seen',
        data: ids?.length ? { ids } : {},
      })
      refresh()
    },
    markAnnounced: async (id: string) => {
      await createItemNew({
        route: `/release-notes/${id}/announced`,
        data: {},
      })
      refresh()
    },
  }
}
