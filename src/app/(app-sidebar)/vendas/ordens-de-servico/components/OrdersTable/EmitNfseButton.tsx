'use client'

// React
import { useState } from 'react'

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
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import {
  IconFileDescription,
  IconCircleCheck,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Hooks
import { useQueryClient } from '@tanstack/react-query'

const emitNfseSchema = z.object({
  codigoServico: z.string().min(1, 'Código do serviço é obrigatório'),
  discriminacao: z.string().min(1, 'Discriminação é obrigatória'),
  aliquotaIss: z.coerce.number().min(0).max(100).optional(),
  issRetido: z.boolean().optional(),
})

type EmitNfseFormType = z.infer<typeof emitNfseSchema>

interface Props {
  orderId: string
  orderStatus?: string
  tooltip?: string
}

type EmissionResult = {
  status: string
  numero?: number
  serie?: string
  rpsNumero?: number
  rpsSerie?: string
  codigoVerificacao?: string
  pdfUrl?: string
  statusMessage?: string
} | null

export function EmitNfseButton({ orderId, orderStatus, tooltip }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emissionResult, setEmissionResult] = useState<EmissionResult>(null)

  const queryClient = useQueryClient()

  const form = useForm<EmitNfseFormType>({
    resolver: zodResolver(emitNfseSchema),
    defaultValues: {
      codigoServico: '17.01',
      discriminacao: '',
      aliquotaIss: 3,
      issRetido: false,
    },
  })

  const handleOpen = () => {
    setOpen(true)
    setEmissionResult(null)
    form.reset()
  }

  const handleClose = () => {
    setOpen(false)
    setEmissionResult(null)
    form.reset()
  }

  async function onSubmit(formData: EmitNfseFormType) {
    setIsLoading(true)
    setEmissionResult(null)

    try {
      const result = await createItemNew({
        route: '/fiscal/nfse/emit',
        data: {
          orderId,
          codigoServico: formData.codigoServico,
          discriminacao: formData.discriminacao,
          aliquotaIss: formData.aliquotaIss,
          issRetido: formData.issRetido,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFS-e')
      }

      setEmissionResult(result.data)

      if (result.data.status === 'AUTHORIZED') {
        toast.success(
          `NFS-e ${result.data.numero}/${result.data.serie} emitida`,
        )
        queryClient.invalidateQueries({ queryKey: ['order-list'] })
        queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      } else {
        toast.warning(`NFS-e processada com status: ${result.data.status}`)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao emitir NFS-e'
      toast.error(message)
      setEmissionResult({
        status: 'ERRO',
        statusMessage: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Não mostrar para ordens canceladas
  if (orderStatus === 'CANCELED') {
    return null
  }

  const statusConfig: Record<
    string,
    { variant: 'success' | 'error' | 'warning'; label: string }
  > = {
    AUTHORIZED: { variant: 'success', label: 'Autorizada' },
    ERRO: { variant: 'error', label: 'Erro' },
    REJECTED: { variant: 'error', label: 'Rejeitada' },
    PROCESSING: { variant: 'warning', label: 'Processando' },
  }

  return (
    <>
      <ActionButton
        Icon={IconFileDescription}
        tooltip={tooltip || 'Emitir NFS-e'}
        onClick={handleOpen}
      />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="outline" Icon={IconFileDescription} />
                <span>Emitir NFS-e</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            {emissionResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge
                    variant={
                      statusConfig[emissionResult.status]?.variant || 'warning'
                    }
                  >
                    {statusConfig[emissionResult.status]?.label ||
                      emissionResult.status}
                  </Badge>
                </div>

                {emissionResult.numero && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Número/Série:</span>
                    <span className="font-medium">
                      {emissionResult.numero}/{emissionResult.serie}
                    </span>
                  </div>
                )}

                {emissionResult.rpsNumero && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">RPS:</span>
                    <span className="font-medium">
                      {emissionResult.rpsNumero}/{emissionResult.rpsSerie}
                    </span>
                  </div>
                )}

                {emissionResult.codigoVerificacao && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">
                      Código de Verificação:
                    </span>
                    <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                      {emissionResult.codigoVerificacao}
                    </p>
                  </div>
                )}

                {emissionResult.statusMessage && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <IconAlertTriangle
                      aria-hidden
                      size={ICON_SIZE.md}
                      className="text-red-500 shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-red-700">
                      {emissionResult.statusMessage}
                    </p>
                  </div>
                )}

                {emissionResult.pdfUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(emissionResult.pdfUrl, '_blank')}
                  >
                    <IconExternalLink
                      aria-hidden
                      size={ICON_SIZE.md}
                      className="mr-2"
                    />
                    Visualizar PDF
                  </Button>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form
                  id="emit-nfse-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <FormInput
                    name="codigoServico"
                    label="Código do Serviço"
                    placeholder="17.01"
                  />

                  <FormInput
                    name="aliquotaIss"
                    label="Alíquota ISS (%)"
                    type="number"
                    placeholder="3"
                  />

                  <FormTextarea
                    name="discriminacao"
                    label="Discriminação do Serviço"
                    placeholder="Descrição detalhada do serviço prestado"
                    rows={4}
                  />
                </form>
              </Form>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={handleClose}
            >
              {emissionResult ? 'Fechar' : 'Cancelar'}
            </Button>
            {!emissionResult && (
              <Button
                type="submit"
                form="emit-nfse-form"
                RightIcon={IconCircleCheck}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Emitir NFS-e
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
