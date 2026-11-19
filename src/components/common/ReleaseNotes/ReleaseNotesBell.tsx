'use client'

// O sino das novidades (19/11/2026): no topo de cada tela, com quantas
// atualizações o usuário ainda não viu. Ao abrir, mostra as mais recentes e
// marca todas como vistas; "Ver todas" leva à página Novidades.

import { useState } from 'react'
import Link from 'next/link'
import { IconBell } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatToLocaleDate } from '@/lib/formatDate'

import {
  useReleaseActions,
  useReleaseNotes,
  useReleaseSummary,
} from '@/hooks/queries/useReleaseNotes'

export const RELEASE_NOTES_PAGE = '/novidades'

/** Quantas aparecem no sino; o resto fica na página */
const BELL_LIMIT = 6

export function ReleaseNotesBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const { data: summary } = useReleaseSummary()
  const { data: notes, isLoading } = useReleaseNotes(open)
  const { markSeen } = useReleaseActions()
  const unread = summary?.unread ?? 0

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    // Fechar o sino depois de ver: as não vistas apagam
    if (!next && unread > 0) markSeen()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="iconMd"
          variant="neutralOutline"
          aria-label={
            unread > 0
              ? `Novidades: ${unread} não vistas`
              : 'Novidades do sistema'
          }
          title="Novidades do sistema"
          className={cn('relative', className)}
        >
          <Icon icon={IconBell} size="md" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error-600 px-1 text-xs font-semibold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="font-semibold text-gray-900">Novidades do sistema</p>
          <p className="text-xs text-gray-500">
            As atualizações liberadas para o seu plano
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notes?.length ? (
            <ul className="divide-y divide-gray-100">
              {notes.slice(0, BELL_LIMIT).map((note) => (
                <li key={note.id}>
                  <Link
                    href={`${RELEASE_NOTES_PAGE}#${note.id}`}
                    onClick={() => handleOpenChange(false)}
                    className="flex gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                        note.seen ? 'bg-transparent' : 'bg-brand-600',
                      )}
                    />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-sm font-semibold text-gray-900">
                        {note.title}
                      </span>
                      <span className="block text-sm text-gray-600 line-clamp-2">
                        {note.summary}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {formatToLocaleDate(note.publishedAt ?? undefined)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              Nenhuma novidade por enquanto.
            </p>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-2 text-right">
          <Button asChild variant="link" size="sm">
            <Link
              href={RELEASE_NOTES_PAGE}
              onClick={() => handleOpenChange(false)}
            >
              Ver todas as novidades
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
