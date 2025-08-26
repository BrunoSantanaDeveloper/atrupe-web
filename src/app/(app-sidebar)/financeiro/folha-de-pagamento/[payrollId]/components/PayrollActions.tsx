'use client'

// Libs
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'

// Components
import { toast } from 'sonner'
import { PayrollPdf } from './PayrollPdf'
import { useAlertDialog } from '@/store/useAlertDialog'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import { updateItemNew, getItem } from '@/actions/_cruds'

// Icons
import {
  IconRestore,
  IconPrinter,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Types
import { PayrollDetailType, PayrollPdfType } from '@/types/financial/payroll'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface Props {
  data: PayrollDetailType
}

export function PayrollActions({ data }: Props) {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const { open: openAlertDialog } = useAlertDialog()
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const handleTogglePayroll = async () => {
    const isOpen = data.status === 'OPEN'
    const newStatus = isOpen ? 'CLOSED' : 'OPEN'
    const action = isOpen ? 'fechar' : 'abrir'
    const actionPast = isOpen ? 'fechada' : 'aberta'

    await openAlertDialog({
      title: `${action === 'fechar' ? 'Fechar' : 'Abrir'} folha ${action === 'fechar' ? 'para' : 'para'} edições?`,
      confirmLabel: 'Sim',
      Icon: IconAlertTriangle,
      iconVariant: 'warningBorderedLight',
      onConfirm: async () => {
        const result = await updateItemNew({
          route: '/financial/salary-sheets/toggle',
          data: {
            salarySheetId: data.id,
            status: newStatus,
          },
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: `${action === 'fechar' ? 'Fechando' : 'Abrindo'} folha...`,
        success: `Folha ${actionPast} com sucesso!`,
        error: `Erro ao ${action} folha`,
      },
    })
  }

  const handleGeneratePDF = async (payrollData: PayrollDetailType) => {
    setIsLoadingPDF(true)
    try {
      // Buscar dados do PDF da API
      const result = await getItem({
        route: `/financial/salary-sheets/${payrollData.id}/pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: PayrollPdfType = result.data

      const blob = await pdf(<PayrollPdf data={pdfData} />).toBlob()

      const url = URL.createObjectURL(blob)

      window.open(url, '_blank')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
      console.error('Erro ao gerar PDF:', error)
    } finally {
      setIsLoadingPDF(false)
    }
  }

  return (
    <>
      <div className="flex justify-between flex-wrap gap-4">
        <PermissionGate permissions={['financial:payroll:view']}>
          <CustomButton
            icon={IconPrinter}
            title="Imprimir"
            isLoading={isLoadingPDF}
            onClick={() => handleGeneratePDF(data)}
          />
        </PermissionGate>
        <PermissionGate permissions={['financial:payroll:edit']}>
          {data.status === 'OPEN' ? (
            <CustomButton
              icon={IconCircleCheck}
              title="Fechar folha"
              iconVariant="successLight"
              onClick={handleTogglePayroll}
            />
          ) : (
            session?.user?.role === 'Admin' && (
              <CustomButton
                icon={IconRestore}
                title="Reabrir folha"
                iconVariant="lightBlueBorderedLight"
                onClick={handleTogglePayroll}
              />
            )
          )}
        </PermissionGate>
      </div>
    </>
  )
}
