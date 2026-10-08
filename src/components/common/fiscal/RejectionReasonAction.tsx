'use client'

import Link from 'next/link'
import { IconAlertTriangle, IconPencil } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface RejectionReasonActionProps {
  reason?: string | null
  reissueHref?: string
}

export function RejectionReasonAction({
  reason,
  reissueHref,
}: RejectionReasonActionProps) {
  const rejectionReason = reason?.trim() || 'Motivo nao informado pela SEFAZ.'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="errorGhost"
          size="sm"
          className="h-7 px-2"
          LeftIcon={IconAlertTriangle}
        >
          Motivo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle>Motivo da rejeicao</DialogTitle>
          <DialogDescription>
            Retorno recebido da autorizadora fiscal.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[60vh] pr-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
              {rejectionReason}
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline" size="sm">
              Fechar
            </Button>
          </DialogClose>
          {reissueHref && (
            <Button
              asChild
              variant="warningLight"
              size="sm"
              LeftIcon={IconPencil}
            >
              <Link href={reissueHref}>Corrigir e reemitir</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
