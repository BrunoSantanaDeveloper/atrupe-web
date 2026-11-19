'use client'

// O aviso "O que mudou" (19/11/2026): no painel, na primeira vez que o
// usuário abre depois de uma atualização marcada como destaque. Fechado, não
// abre de novo para ele; a atualização continua no sino e na página.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IconSparkles } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { formatToLocaleDate } from '@/lib/formatDate'

import {
  useReleaseActions,
  useReleaseSummary,
} from '@/hooks/queries/useReleaseNotes'
import { ReleaseNoteItems } from './ReleaseNoteItems'
import { RELEASE_NOTES_PAGE } from './ReleaseNotesBell'

export function ReleaseAnnouncement() {
  const { data: summary } = useReleaseSummary()
  const { markAnnounced } = useReleaseActions()
  const note = summary?.announce ?? null
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (note) setOpen(true)
  }, [note])

  if (!note) return null

  const close = () => {
    setOpen(false)
    markAnnounced(note.id)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon Icon={IconSparkles} tone="success" />
            <div>
              <DialogTitle>{`O que mudou: ${note.title}`}</DialogTitle>
              <DialogDescription>
                {[
                  note.version,
                  formatToLocaleDate(note.publishedAt ?? undefined),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-700">{note.summary}</p>
          <ReleaseNoteItems items={note.items} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="neutralOutline" asChild>
            <Link href={RELEASE_NOTES_PAGE} onClick={close}>
              Ver todas as novidades
            </Link>
          </Button>
          <Button type="button" onClick={close}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
