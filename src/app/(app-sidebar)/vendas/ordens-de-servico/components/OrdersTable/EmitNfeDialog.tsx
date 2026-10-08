'use client'

// React
import { useEffect, useState } from 'react'

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
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'

// Icons
import {
  IconFileInvoice,
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
import { createItemNew, getDataOld } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

const emitNfeSchema = z.object({
  operationNature: z.string().optional(),
  additionalInfo: z.string().optional(),
})

type EmitNfeFormType = z.infer<typeof emitNfeSchema>

type EmissionResult = {
  status: string
  number?: number
  series?: string
  xmlKey?: string
  danfeUrl?: string
  statusMessage?: string
} | null

async function fetchInvoicyConfig() {
  try {
    return await getDataOld({
      route: '/fiscal/invoicy/config',
    })
  } catch {
    return null
  }
}

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  orderId?: string
}

export function EmitNfeDialog({ open, setOpen, orderId }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [emissionResult, setEmissionResult] = useState<EmissionResult>(null)

  const queryClient = useQueryClient()

  const { data: configData } = useQuery({
    queryKey: ['invoicy-config'],
    queryFn: fetchInvoicyConfig,
    enabled: open,
  })

  const form = useForm<EmitNfeFormType>({
    resolver: zodResolver(emitNfeSchema),
    defaultValues: {
      operationNature: 'Venda de mercadoria',
      additionalInfo: '',
    },
  })

  const defaultAdditionalInfo = configData?.taxInfoText || ''

  useEffect(() => {
    if (!open || !defaultAdditionalInfo) return

    const currentAdditionalInfo = form.getValues('additionalInfo')
    if (!currentAdditionalInfo) {
      form.setValue('additionalInfo', defaultAdditionalInfo)
    }
  }, [defaultAdditionalInfo, form, open])

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
    if (!openDialog) {
      setEmissionResult(null)
      form.reset({
        operationNature: 'Venda de mercadoria',
        additionalInfo: defaultAdditionalInfo,
      })
    }
  }

  async function onSubmit(formData: EmitNfeFormType) {
    if (!orderId) return

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
        toast.success(`NF-e ${result.data.numero}/${result.data.serie} emitida`)
        queryClient.invalidateQueries({ queryKey: ['order-list'] })
        queryClient.invalidateQueries({ queryKey: ['order-data', orderId] })
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
      // Invalidar queries mesmo em caso de erro para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['order-list'] })
      queryClient.invalidateQueries({ queryKey: ['order-data', orderId] })
    } finally {
      setIsLoading(false)
    }
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <IconAlertTriangle
                    size={ICON_SIZE.md}
                    className="text-red-500 shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-red-700">
                    {emissionResult.statusMessage}
                  </p>
                </div>
              )}

              {emissionResult.danfeUrl && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(emissionResult.danfeUrl, '_blank')}
                >
                  <IconExternalLink size={ICON_SIZE.md} className="mr-2" />
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
            onClick={() => handleOpenChange(false)}
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
  )
}
