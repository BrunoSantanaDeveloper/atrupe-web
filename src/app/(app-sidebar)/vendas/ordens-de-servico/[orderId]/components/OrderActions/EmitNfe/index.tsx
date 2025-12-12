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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Badge } from '@/components/ui/badge'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { CustomButton } from '@/components/common/CustomButton'

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

// Types
import type { OrderType } from '@/types/sales/order'

const emitNfeSchema = z.object({
  operationNature: z.string().optional(),
  additionalInfo: z.string().optional(),
})

type EmitNfeFormType = z.infer<typeof emitNfeSchema>

interface Props {
  data: OrderType
}

type EmissionResult = {
  status: string
  number?: number
  series?: string
  xmlKey?: string
  danfeUrl?: string
  statusMessage?: string
} | null

export function EmitNfe({ data }: Props) {
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
          orderId: data.id,
          operationNature: formData.operationNature,
          additionalInfo: formData.additionalInfo,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NF-e')
      }

      setEmissionResult(result.data)

      if (result.data.status === 'AUTORIZADA') {
        toast.success(
          `NF-e ${result.data.number}/${result.data.series} emitida com sucesso!`,
        )
        queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      } else {
        toast.warning(
          `NF-e processada com status: ${result.data.status}`,
        )
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      AUTORIZADA: { variant: 'success', label: 'Autorizada' },
      PROCESSANDO: { variant: 'warning', label: 'Processando' },
      REJEITADA: { variant: 'error', label: 'Rejeitada' },
      CANCELADA: { variant: 'neutral', label: 'Cancelada' },
      DENEGADA: { variant: 'error', label: 'Denegada' },
      ERRO: { variant: 'error', label: 'Erro' },
    }
    const config = statusConfig[status] || { variant: 'neutral', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <>
      <CustomButton
        icon={IconFileInvoice}
        title="Emitir NF-e"
        onClick={handleOpen}
      />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="primaryOutline" Icon={IconFileInvoice} />
                <div>
                  <span>Emitir Nota Fiscal</span>
                  <p className="text-sm font-normal text-gray-500">
                    Ordem #{data?.quotation?.serie?.code}-
                    {data?.quotation?.serie?.quotation}
                  </p>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>

          <DialogBody>
            {emissionResult ? (
              // Show result
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {emissionResult.status === 'AUTORIZADA' ? (
                    <FeaturedIcon
                      variant="successLight"
                      Icon={IconCircleCheck}
                    />
                  ) : (
                    <FeaturedIcon
                      variant="warningLight"
                      Icon={IconAlertTriangle}
                    />
                  )}
                  <div>
                    <p className="font-semibold">
                      {emissionResult.status === 'AUTORIZADA'
                        ? 'NF-e Emitida com Sucesso!'
                        : 'Resultado da Emissão'}
                    </p>
                    {getStatusBadge(emissionResult.status)}
                  </div>
                </div>

                {emissionResult.number && (
                  <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                    <p>
                      <strong>Número:</strong> {emissionResult.number}/
                      {emissionResult.series}
                    </p>
                    {emissionResult.xmlKey && (
                      <p className="text-xs break-all">
                        <strong>Chave:</strong> {emissionResult.xmlKey}
                      </p>
                    )}
                  </div>
                )}

                {emissionResult.statusMessage && (
                  <p className="text-sm text-gray-600">
                    {emissionResult.statusMessage}
                  </p>
                )}

                {emissionResult.danfeUrl && (
                  <Button
                    type="button"
                    variant="default"
                    className="w-full"
                    RightIcon={IconExternalLink}
                    onClick={() =>
                      window.open(emissionResult.danfeUrl, '_blank')
                    }
                  >
                    Visualizar DANFE
                  </Button>
                )}
              </div>
            ) : (
              // Show form
              <Form {...form}>
                <form
                  id="emit-nfe-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                    <p className="text-sm font-medium text-blue-800">
                      Informações da Ordem
                    </p>
                    <div className="text-sm text-blue-700">
                      <p>
                        <strong>Cliente:</strong>{' '}
                        {data?.quotation?.client?.name || 'Não informado'}
                      </p>
                      <p>
                        <strong>Valor Total:</strong> R${' '}
                        {data?.quotation?.paymentConditions?.finalValue?.toLocaleString(
                          'pt-BR',
                          { minimumFractionDigits: 2 },
                        ) || '0,00'}
                      </p>
                    </div>
                  </div>

                  <FormInput
                    control={form.control}
                    name="operationNature"
                    label="Natureza da Operação"
                    placeholder="Venda de mercadoria"
                  />

                  <FormTextarea
                    control={form.control}
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
            {emissionResult ? (
              <Button type="button" onClick={handleClose}>
                Fechar
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  form="emit-nfe-form"
                  RightIcon={IconCircleCheck}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Emitindo...' : 'Emitir NF-e'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
