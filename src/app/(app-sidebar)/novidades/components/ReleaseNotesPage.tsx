'use client'

// A página Novidades (19/11/2026): cada atualização com a data, o resumo e o
// que é novo, o que melhorou e o que foi corrigido. Abrir a página conta
// como ver as novidades: o sino apaga.

import { useEffect, useRef } from 'react'
import { IconSparkles } from '@tabler/icons-react'

import { Topbar } from '@/components/common/Topbar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { formatToLocaleDate } from '@/lib/formatDate'

import { ReleaseNoteItems } from '@/components/common/ReleaseNotes/ReleaseNoteItems'
import {
  useReleaseActions,
  useReleaseNotes,
} from '@/hooks/queries/useReleaseNotes'

export function ReleaseNotesPage() {
  const { data: notes, isLoading } = useReleaseNotes()
  const { markSeen } = useReleaseActions()
  const marked = useRef(false)

  useEffect(() => {
    if (marked.current || !notes?.some((note) => !note.seen)) return
    marked.current = true
    markSeen()
  }, [notes, markSeen])

  return (
    <div className="space-y-5">
      <Topbar
        title="Novidades"
        supportText="As atualizações liberadas para o seu plano"
      />
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : notes?.length ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} id={note.id} className="scroll-mt-6">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="type-card-title">{note.title}</h2>
                      {!note.seen ? (
                        <Badge variant="successLight">Nova</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-600">{note.summary}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {[
                      note.version,
                      formatToLocaleDate(note.publishedAt ?? undefined),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <ReleaseNoteItems items={note.items} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <FeaturedIcon Icon={IconSparkles} tone="neutral" size="lg" />
            <p className="type-card-title">Nenhuma novidade por enquanto</p>
            <p className="text-sm text-gray-600">
              Quando uma atualização for liberada para o seu plano, ela aparece
              aqui e no sino do topo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
