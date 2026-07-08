'use client'

// React
import { useState } from 'react'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { InvoiceTypeSelectModal } from '@/app/(app-sidebar)/nota-fiscal/emitir/components/InvoiceTypeSelectModal'

// Icons
import { IconDownload, IconFileInvoice } from '@tabler/icons-react'

// Types
import type { OrderType } from '@/types/sales/order'

interface Props {
  data: OrderType
}

export function EmitNfe({ data }: Props) {
  const [open, setOpen] = useState(false)

  // Verificar se já existe NF-e autorizada
  const existingNfe = data.nfes?.[0]
  const existingNfce = data.nfces?.find((nfce) =>
    ['AUTHORIZED', 'CONTINGENCY'].includes(nfce.status),
  )
  const existingNfse = data.nfses?.find((nfse) => nfse.status === 'AUTHORIZED')
  const hasAuthorizedNfe = existingNfe?.status === 'AUTHORIZED'

  // Se já tem NF-e autorizada, mostrar botão para visualizar
  if (hasAuthorizedNfe && existingNfe) {
    return (
      <CustomButton
        icon={IconDownload}
        title={`DANFE ${existingNfe.numero}/${existingNfe.serie}`}
        onClick={() => {
          if (existingNfe.danfeUrl) {
            window.open(existingNfe.danfeUrl, '_blank')
          }
        }}
      />
    )
  }

  if (existingNfce) {
    return (
      <CustomButton
        icon={IconDownload}
        title={`DANFE NFC-e ${existingNfce.numero}/${existingNfce.serie}`}
        onClick={() => {
          if (existingNfce.danfeUrl) {
            window.open(existingNfce.danfeUrl, '_blank')
          }
        }}
      />
    )
  }

  if (existingNfse) {
    return (
      <CustomButton
        icon={IconDownload}
        title={`PDF NFS-e ${existingNfse.numero}/${existingNfse.serie}`}
        onClick={() => {
          if (existingNfse.pdfUrl) {
            window.open(existingNfse.pdfUrl, '_blank')
          }
        }}
      />
    )
  }

  return (
    <>
      <CustomButton
        icon={IconFileInvoice}
        title="Emitir nota fiscal"
        onClick={() => setOpen(true)}
      />
      <InvoiceTypeSelectModal
        open={open}
        onOpenChange={setOpen}
        orderId={data.id}
      />
    </>
  )
}
