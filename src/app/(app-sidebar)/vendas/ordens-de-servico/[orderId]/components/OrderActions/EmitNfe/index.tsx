'use client'

// React
import { useState } from 'react'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { EmitNfeDialog } from '../../../../components/OrdersTable/EmitNfeDialog'

// Icons
import { IconFileInvoice } from '@tabler/icons-react'

// Types
import type { OrderType } from '@/types/sales/order'

interface Props {
  data: OrderType
}

export function EmitNfe({ data }: Props) {
  const [open, setOpen] = useState(false)

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
