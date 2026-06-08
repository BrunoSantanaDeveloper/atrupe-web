'use client'

import Link from 'next/link'
import { IconAlertTriangle, IconEdit } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    <Popover>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">
            Motivo da rejeicao
          </p>
        </div>
        <ScrollArea className="max-h-48">
          <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-5 text-gray-700">
            {rejectionReason}
          </p>
        </ScrollArea>
        {reissueHref && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Button
              asChild
              variant="warningLight"
              size="sm"
              className="w-full"
              LeftIcon={IconEdit}
              leftIconSize={16}
            >
              <Link href={reissueHref}>Corrigir e reemitir</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
