'use client'

// React
import { useState } from 'react'

// Components
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { CancelOrder } from './CancelOrder'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { GeneratePdf } from '@/components/common/PrintQuotation/GeneratePdf'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Types
import { OrderType } from '@/types/sales/order'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'

import { getItem } from '@/actions/_cruds'

interface Props {
  data: OrderType
}

export function OrderActions({ data }: Props) {
  const [openPrint, setOpenPrint] = useState(false)
  const [type, setType] = useState<'production' | 'order'>('order')
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)

  const status = {
    notCanceled: data?.status !== 'CANCELED',
  }

  const handleGeneratePDF = async () => {
    const formData = {
      showImages: true,
      showDimensions: true,
      showUnitValue: true,
      showDiscounts: true,
      showFinalValue: true,
      showTotalValue: true,
      showPaymentDelivery: true,
      showItemsDetails: true,
    }

    setIsLoadingPDF(true)
    try {
      // Buscar dados do PDF da API
      const result = await getItem({
        route: `sale/quotation/${data?.quotation?.id}/pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData = result.data

      const blob = await pdf(
        <GeneratePdf
          data={pdfData}
          type="production"
          printOptions={formData}
        />,
      ).toBlob()

      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsLoadingPDF(false)
    }
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
              onClick={handleGeneratePDF}
              isLoading={isLoadingPDF}
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
