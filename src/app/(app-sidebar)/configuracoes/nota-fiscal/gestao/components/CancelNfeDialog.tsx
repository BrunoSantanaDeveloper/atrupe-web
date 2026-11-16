'use client'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import { IconAlertTriangle, IconX } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew } from '@/actions/_cruds'

interface NfeItem {
  id: string
  number: number
  series: string
}

type FiscalDocType = 'NFE' | 'NFCE' | 'NFSE'

const DOC_LABEL: Record<FiscalDocType, string> = {
  NFE: 'NF-e',
  NFCE: 'NFC-e',
  NFSE: 'NFS-e',
}

const DOC_ROUTE: Record<FiscalDocType, string> = {
  NFE: 'nfe',
  NFCE: 'nfce',
  NFSE: 'nfse',
}

// O limite de 100 vale para a NFS-e: EveMotivo e' C(100) no layout de eventos
// do InvoiCy, e o texto vai inteiro para o registro da prefeitura. NF-e e
// NFC-e seguem o limite da SEFAZ, bem maior, entao nao ganham teto aqui.
const LIMITE_JUSTIFICATIVA_NFSE = 100

const montarSchema = (docType: FiscalDocType) =>
  z.object({
    reason:
      docType === 'NFSE'
        ? z
            .string()
            .min(15, 'A justificativa deve ter pelo menos 15 caracteres')
            .max(
              LIMITE_JUSTIFICATIVA_NFSE,
              `A justificativa deve ter no máximo ${LIMITE_JUSTIFICATIVA_NFSE} caracteres`,
            )
        : z
            .string()
            .min(15, 'A justificativa deve ter pelo menos 15 caracteres'),
  })

type CancelFormType = { reason: string }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfe: NfeItem | null
  onSuccess: () => void
  docType?: FiscalDocType
}

export function CancelNfeDialog({
  open,
  onOpenChange,
  nfe,
  onSuccess,
  docType = 'NFE',
}: Props) {
  const docLabel = DOC_LABEL[docType]
  const form = useForm<CancelFormType>({
    resolver: zodResolver(montarSchema(docType)),
    defaultValues: {
      reason: '',
    },
  })

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  async function onSubmit(data: CancelFormType) {
    if (!nfe) return

    try {
      const result = await createItemNew({
        route: `/fiscal/${DOC_ROUTE[docType]}/${nfe.id}/cancel`,
        data: {
          justificativa: data.reason,
        },
      })

      if (!result.success) {
        throw new Error(result.message || `Erro ao cancelar ${docLabel}`)
      }

      toast.success(`${docLabel} cancelada com sucesso!`)

      // Cancelamento aceito fora do prazo regular de 24 horas: o backend
      // devolve o aviso porque a SEFAZ pode cobrar penalidade, e quem cancelou
      // precisa saber disso na hora.
      const avisoPrazo = (result.data as { avisoPrazo?: string } | undefined)
        ?.avisoPrazo
      if (avisoPrazo) toast.warning(avisoPrazo, { duration: 12000 })

      onSuccess()
      handleClose()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Erro ao cancelar ${docLabel}`
      toast.error(message)
    }
  }

  if (!nfe) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <span>Cancelar {docLabel}</span>
                <p className="text-sm font-normal text-gray-500">
                  {docLabel} {nfe.number}/{nfe.series}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="rounded-lg bg-yellow-50 p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> O cancelamento de {docLabel} só pode ser
              realizado dentro do prazo regulamentar após a autorização. Esta
              ação é irreversível.
            </p>
          </div>

          <Form {...form}>
            <form
              id="cancel-nfe-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <FormTextarea
                name="reason"
                label="Justificativa do Cancelamento"
                placeholder={
                  docType === 'NFSE'
                    ? `Informe o motivo do cancelamento (de 15 a ${LIMITE_JUSTIFICATIVA_NFSE} caracteres)`
                    : 'Informe o motivo do cancelamento (mínimo 15 caracteres)'
                }
                rows={4}
                {...(docType === 'NFSE'
                  ? { maxLength: LIMITE_JUSTIFICATIVA_NFSE }
                  : {})}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={handleClose}>
            Voltar
          </Button>
          <Button
            type="submit"
            form="cancel-nfe-form"
            variant="error"
            RightIcon={IconX}
            disabled={form.formState?.isSubmitting}
            isLoading={form.formState?.isSubmitting}
          >
            Cancelar {docLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
