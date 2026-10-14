'use client'

// React
import { useState } from 'react'

// Components
import { toast } from 'sonner'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF
import { CancelOrder } from './CancelOrder'
import { EmitNfe } from './EmitNfe'
import { ReprocessApproval } from './ReprocessApproval'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { buildPdfFileName } from '@/components/common/PrintQuotation/buildPdfFileName'
// Icons
import { IconPrinter } from '@tabler/icons-react'

// Types
import { OrderType } from '@/types/sales/order'
import { PrintQuotationDialog } from '@/components/common/PrintQuotation/PrintQuotationDialog'

import { getItem } from '@/actions/_cruds'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

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

      const [{ pdf }, { GeneratePdf }] = await Promise.all([
        import('@react-pdf/renderer'),

        import('@/components/common/PrintQuotation/GeneratePdf'),
      ])

      const blob = await pdf(
        <GeneratePdf
          data={pdfData}
          type="production"
          printOptions={formData}
        />,
      ).toBlob()

      const fileName = buildPdfFileName(pdfData, 'production')

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error('Erro ao gerar PDF')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsLoadingPDF(false)
    }
  }

  const canCancel = status.notCanceled

  const { hasFeature } = usePlanFeatures()
  const hasFiscalModule = hasFeature('nota_fiscal')

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
          {hasFiscalModule && (
            <PermissionGate permissions={['nota_fiscal:emitir:create']}>
              <EmitNfe data={data} />
            </PermissionGate>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          {canCancel && data?.quotation?.id ? (
            <PermissionGate
              permissions={['sale:order:create', 'sale:quotation:edit']}
            >
              <ReprocessApproval quotationId={data.quotation.id} />
            </PermissionGate>
          ) : null}
          {canCancel ? (
            <PermissionGate permissions={['sale:order:edit']}>
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
