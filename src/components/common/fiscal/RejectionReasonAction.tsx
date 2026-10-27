'use client'

import Link from 'next/link'
import {
  IconAlertTriangle,
  IconEdit,
  IconInfoCircle,
} from '@tabler/icons-react'

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

import { separarOrientacao } from './orientacaoRejeicao'

interface RejectionReasonActionProps {
  reason?: string | null
  reissueHref?: string
}

export function RejectionReasonAction({
  reason,
  reissueHref,
}: RejectionReasonActionProps) {
  const rejectionReason = reason?.trim() || 'Motivo nao informado pela SEFAZ.'
  const { retorno, orientacao } = separarOrientacao(rejectionReason)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="errorGhost"
          size="sm"
          className="h-7 px-2"
          LeftIcon={IconAlertTriangle}
          leftIconSize={14}
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
        <DialogBody className="max-h-[60vh] space-y-3 pr-6">
          {retorno && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {retorno}
              </p>
            </div>
          )}
          {orientacao && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <IconInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div className="space-y-1">
                <p className="font-medium">
                  O que fazer
                  {orientacao.onde ? ` — ${orientacao.onde}` : ''}
                </p>
                <p className="whitespace-pre-wrap break-words leading-6 text-blue-700">
                  {orientacao.texto}
                </p>
              </div>
            </div>
          )}
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
              LeftIcon={IconEdit}
              leftIconSize={16}
            >
              <Link href={reissueHref}>Corrigir e reemitir</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
