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
import { updateItemNew } from '@/actions/_cruds'

// Icons
import {
  IconPrinter,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Types
import { PayrollDetailType, PayrollPdfType } from '@/types/financial/payroll'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  data: PayrollDetailType
}

const mockData: PayrollPdfType = {
  company: {
    name: 'Atrupe Comunicação Visual',
    cnpj: '00.000.000/0001-00',
    email: 'atrupe.sistemas',
    logo: 'https://files-atrupe.s3.us-east-1.amazonaws.com/tesla-logo-169d25c3-1bf3-42dd-a1e9-6b42bda5d741.png',
    address: {
      street: 'Avenida Getúlio Vargas',
      number: '192',
      neighborhood: 'Vila Operária',
      city: 'Itajaí',
      state: 'SC',
    },
  },
  employeeName: 'João da Silva',
  reference: '3/25',
  items: [
    {
      id: '1',
      description: 'Salário',
      type: 'INCREASE',
      amount: 250000,
    },
    {
      id: '2',
      description: 'INSS',
      type: 'DISCOUNT',
      amount: 30000,
    },
    {
      id: '2',
      description: 'Adiantamento',
      type: 'ADVANCE',
      amount: 55000,
    },
  ],
  netSalary: 220000,
  payment: {
    dueDate: '2025-03-01',
    paidAt: '2025-03-01',
    amountPaid: 165000,
    paymentMethod: 'PIX',
  },
}

export function PayrollActions({ data }: Props) {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const { open: openAlertDialog } = useAlertDialog()
  const queryClient = useQueryClient()

  const handleClosePayroll = async () => {
    await openAlertDialog({
      title: 'Fechar folha para edições?',
      confirmLabel: 'Sim',
      Icon: IconAlertTriangle,
      iconVariant: 'warningBorderedLight',
      onConfirm: async () => {
        const result = await updateItemNew({
          route: '/financial/salary-sheets/toggle',
          data: {
            salarySheetId: data.id,
            status: 'CLOSED',
          },
        })

        if (!result.success) {
          throw new Error(result.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: 'Fechando folha...',
        success: 'Folha fechada com sucesso!',
        error: 'Erro ao fechar folha',
      },
    })
  }

  const handleGeneratePDF = async (payrollData: PayrollDetailType) => {
    console.log(payrollData)

    setIsLoadingPDF(true)
    try {
      const blob = await pdf(<PayrollPdf data={mockData} />).toBlob()

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
        {data?.status === 'OPEN' && (
          <PermissionGate permissions={['financial:payroll:edit']}>
            <CustomButton
              icon={IconCircleCheck}
              title="Fechar folha"
              iconVariant="successLight"
              onClick={handleClosePayroll}
            />
          </PermissionGate>
        )}
      </div>
    </>
  )
}
