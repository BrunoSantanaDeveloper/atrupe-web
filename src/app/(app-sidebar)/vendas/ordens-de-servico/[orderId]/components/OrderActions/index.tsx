'use client'

// React
import { useState } from 'react'

// Components
import { CancelOrder } from './CancelOrder'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Types
import { OrderType } from '@/types/sales/order'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'

interface Props {
  data: OrderType
}

export function OrderActions({ data }: Props) {
  const [openPrint, setOpenPrint] = useState(false)
  const [type, setType] = useState<'production' | 'order'>('order')

  const status = {
    notCanceled: data?.status !== 'CANCELED',
  }

  const canCancel = status.notCanceled

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <PermissionGate permissions={['sale:order:view']}>
            <CustomButton
              icon={IconPrinter}
              title="Via de produção"
              onClick={() => {
                setOpenPrint(true)
                setType('production')
              }}
            />
            <CustomButton
              icon={IconPrinter}
              title="Via do cliente"
              onClick={() => {
                setOpenPrint(true)
                setType('order')
              }}
            />
          </PermissionGate>
        </div>
        <div className="flex flex-wrap gap-4">
          {canCancel ? (
            <PermissionGate permissions={['sale:order:delete']}>
              <CancelOrder data={data} />
            </PermissionGate>
          ) : null}
        </div>
      </div>

      <PrintQuotationDialog
        type={type}
        quotationId={data?.quotation?.id}
        open={openPrint}
        onOpenChange={setOpenPrint}
      />
    </>
  )
}
