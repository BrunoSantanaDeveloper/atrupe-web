'use client'

// React
import { useState } from 'react'

// Components
import { SetClient } from './SetClient'
import { OpenQuotation } from './OpenQuotation'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'
import { RejectQuotation } from './RejectQuotation'
import { FinishQuotation } from './FinishQuotation'
import { ApproveQuotation } from './ApproveQuotation'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Type
import { QuotationType } from '@/types/sales/quotation'

// Icons
import { IconPrinter } from '@tabler/icons-react'

interface Props {
  data: QuotationType
}

export function QuotationActions({ data }: Props) {
  const [openPrint, setOpenPrint] = useState(false)

  const status = {
    open: data?.status === 'OPEN',
    done: data?.status === 'DONE',
    overdue: data?.status === 'OVERDUE',
    rejected: data?.status === 'REJECTED',
  }

  const canApprove = status.done || status.overdue
  const canReject = status.open || status.done || status.overdue
  const canFinish = status.open
  const canOpen = status.rejected || status.done || status.overdue
  const canSetClient = status.open && data?.quickSale

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <PermissionGate permissions={['sale:quotation:view']}>
            <CustomButton
              icon={IconPrinter}
              title={status.done ? 'Proposta' : 'Prévia da proposta'}
              onClick={() => setOpenPrint(true)}
            />
          </PermissionGate>
          {canSetClient ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <SetClient />
            </PermissionGate>
          ) : null}
          {canOpen ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <OpenQuotation data={data} />
            </PermissionGate>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4">
          {canReject ? (
            <PermissionGate permissions={['sale:quotation:delete']}>
              <RejectQuotation data={data} />
            </PermissionGate>
          ) : null}
          <PermissionGate permissions={['sale:quotation:edit']}>
            <FinishQuotation data={data} canFinish={canFinish} />
          </PermissionGate>
          {canApprove ? (
            <PermissionGate permissions={['sale:quotation:create']}>
              <ApproveQuotation data={data} />
            </PermissionGate>
          ) : null}
        </div>
      </div>
      <PrintQuotationDialog
        type="quotation"
        quotationId={data?.id}
        open={openPrint}
        onOpenChange={setOpenPrint}
      />
    </>
  )
}
