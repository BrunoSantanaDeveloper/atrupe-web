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
  IconFileInvoice,
  IconCircleCheck,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Hooks
import { useQueryClient } from '@tanstack/react-query'

const emitNfeSchema = z.object({
  operationNature: z.string().optional(),
  additionalInfo: z.string().optional(),
})

type EmitNfeFormType = z.infer<typeof emitNfeSchema>

interface Props {
  orderId: string
  orderStatus?: string
  tooltip?: string
}

type EmissionResult = {
  status: string
  number?: number
  series?: string
  xmlKey?: string
  danfeUrl?: string
  statusMessage?: string
} | null

export function EmitNfeButton({ orderId, orderStatus, tooltip }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emissionResult, setEmissionResult] = useState<EmissionResult>(null)

  const queryClient = useQueryClient()

  const form = useForm<EmitNfeFormType>({
    resolver: zodResolver(emitNfeSchema),
    defaultValues: {
      operationNature: 'Venda de mercadoria',
      additionalInfo: '',
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

  async function onSubmit(formData: EmitNfeFormType) {
    setIsLoading(true)
    setEmissionResult(null)

    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/emit',
        data: {
          orderId,
          operationNature: formData.operationNature,
          additionalInfo: formData.additionalInfo,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NF-e')
      }

      setEmissionResult(result.data)

      if (result.data.status === 'AUTHORIZED') {
        toast.success(
          `NF-e ${result.data.numero}/${result.data.serie} emitida com sucesso!`,
        )
        queryClient.invalidateQueries({ queryKey: ['order-list'] })
        queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      } else {
        toast.warning(`NF-e processada com status: ${result.data.status}`)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao emitir NF-e'
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
        Icon={IconFileInvoice}
        tooltip={tooltip || 'Emitir NF-e'}
        onClick={handleOpen}
      />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="outline" Icon={IconFileInvoice} />
                <span>Emitir NF-e</span>
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

                {emissionResult.number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Número/Série:</span>
                    <span className="font-medium">
                      {emissionResult.number}/{emissionResult.series}
                    </span>
                  </div>
                )}

                {emissionResult.xmlKey && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">
                      Chave de Acesso:
                    </span>
                    <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                      {emissionResult.xmlKey}
                    </p>
                  </div>
                )}

                {emissionResult.statusMessage && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                    <IconAlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      {emissionResult.statusMessage}
                    </p>
                  </div>
                )}

                {emissionResult.danfeUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(emissionResult.danfeUrl, '_blank')
                    }
                  >
                    <IconExternalLink className="w-4 h-4 mr-2" />
                    Visualizar DANFE
                  </Button>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form
                  id="emit-nfe-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <FormInput
                    name="operationNature"
                    label="Natureza da Operação"
                    placeholder="Venda de mercadoria"
                  />

                  <FormTextarea
                    name="additionalInfo"
                    label="Informações Complementares"
                    placeholder="Informações adicionais que aparecerão na nota fiscal"
                    rows={3}
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
                form="emit-nfe-form"
                RightIcon={IconCircleCheck}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Emitir NF-e
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
