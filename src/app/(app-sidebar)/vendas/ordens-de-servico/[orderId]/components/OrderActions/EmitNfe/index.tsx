'use client'

// React
import { useState } from 'react'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { EmitNfeDialog } from '../../../../components/OrdersTable/EmitNfeDialog'

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

  return (
    <>
      <CustomButton
        icon={IconFileInvoice}
        title="Emitir NF-e"
        onClick={() => setOpen(true)}
      />
      <EmitNfeDialog open={open} setOpen={setOpen} orderId={data.id} />
    </>
  )
}
