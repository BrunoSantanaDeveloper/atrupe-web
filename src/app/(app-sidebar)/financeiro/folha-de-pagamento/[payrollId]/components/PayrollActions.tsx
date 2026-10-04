'use client'

// Libs
import { useState } from 'react'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo. Os componentes
// dele chegam como undefined na renderização do servidor e derrubam a página
// com "Element type is invalid". Biblioteca e documento são carregados dentro
// do clique que gera o PDF

// Components
import { toast } from 'sonner'
import { useAlertDialog } from '@/store/useAlertDialog'
import { CustomButton } from '@/components/common/CustomButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// Actions
import { updateItemNew, getItem } from '@/actions/_cruds'

// Icons
import {
  IconArrowBackUp,
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
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [showSignature, setShowSignature] = useState(true)
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
          route: '/financial/payroll/toggle',
          data: {
            payrollId: data.id,
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

  const handleGeneratePDF = async (
    payrollData: PayrollDetailType,
    withSignature: boolean,
  ) => {
    setIsLoadingPDF(true)
    setShowPrintOptions(false)
    try {
      const result = await getItem({
        route: `/financial/payroll/${payrollData.id}/pdf-data`,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      const pdfData: PayrollPdfType = result.data

      const [{ pdf }, { PayrollPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./PayrollPdf'),
      ])

      const blob = await pdf(
        <PayrollPdf data={pdfData} showSignature={withSignature} />,
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

  return (
    <>
      <Dialog
        open={showPrintOptions}
        onOpenChange={isLoadingPDF ? undefined : setShowPrintOptions}
      >
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Opções de impressão</DialogTitle>
            <DialogDescription className="sr-only">
              Imprimir folha de pagamento
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex items-center gap-3">
              <Checkbox
                id="payroll-show-signature"
                checked={showSignature}
                onCheckedChange={(v) => setShowSignature(!!v)}
              />
              <Label htmlFor="payroll-show-signature">
                Exibir assinatura digital
              </Label>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={isLoadingPDF}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              RightIcon={IconPrinter}
              isLoading={isLoadingPDF}
              onClick={() => handleGeneratePDF(data, showSignature)}
            >
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between flex-wrap gap-4">
        <PermissionGate permissions={['financial:payroll:view']}>
          <CustomButton
            icon={IconPrinter}
            title="Imprimir"
            isLoading={isLoadingPDF}
            onClick={() => setShowPrintOptions(true)}
          />
        </PermissionGate>
        {data.status === 'OPEN' ? (
          <PermissionGate permissions={['financial:payroll:edit']}>
            <CustomButton
              icon={IconCircleCheck}
              title="Fechar folha"
              iconVariant="successLight"
              onClick={handleTogglePayroll}
            />
          </PermissionGate>
        ) : (
          // TODO: Ajustar permissão para reabrir folha
          session?.user?.role === 'Admin' && (
            <PermissionGate permissions={['financial:payroll:delete']}>
              <CustomButton
                icon={IconArrowBackUp}
                title="Reabrir folha"
                iconVariant="lightBlueBorderedLight"
                onClick={handleTogglePayroll}
              />
            </PermissionGate>
          )
        )}
      </div>
    </>
  )
}
