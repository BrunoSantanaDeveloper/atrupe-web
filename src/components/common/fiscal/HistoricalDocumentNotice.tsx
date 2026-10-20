'use client'

import { IconLock } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

/**
 * No menu de ações de uma nota do CNPJ anterior a uma transferência de
 * titularidade: no lugar das ações que a manipulariam, o motivo.
 */
export function HistoricalDocumentNotice({ reason }: { reason: string }) {
  return (
    <div
      className="flex gap-2 px-2 py-1.5 text-xs text-gray-600"
      data-nota-historica
    >
      <Icon icon={IconLock} size="sm" className="mt-0.5 text-gray-500" />
      <span>{reason}</span>
    </div>
  )
}
