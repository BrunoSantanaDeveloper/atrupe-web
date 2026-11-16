'use client'

// Passar a venda rápida para venda padrão (VR-11, 16/11/2026). O balcão só
// recebe à vista (dinheiro, PIX e cartão). O cliente cadastrado que pede
// boleto, ou quer faturar, segue pela venda padrão: identifica o cliente,
// troca para uma série que fatura no pedido ou na entrega, e a tela vira a do
// orçamento comum, com as condições de pagamento. O boleto segue pelo Fluxo
// financeiro.

import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormSelect } from '@/components/common/form/FormSelect'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'

import { updateItemNew } from '@/actions/_cruds'
import { useSerie } from '@/hooks/queries/useSerie'

// As séries que geram o título em A receber, onde entra o boleto
const STANDARD_BILLING = ['ON_ORDER', 'ON_DELIVERY']

const schema = z.object({
  client: z
    .object({ value: z.string(), label: z.string().optional() })
    .nullable()
    .refine((value) => !!value?.value, 'Escolha o cliente cadastrado'),
  seriesId: z.string().min(1, 'Escolha a série'),
})
type FormType = z.infer<typeof schema>

export function ToStandardSaleDialog({
  open,
  onOpenChange,
  quotationId,
  client,
  defaultClientId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotationId: string
  client?: { id: string; name: string } | null
  defaultClientId?: string | null
}) {
  const queryClient = useQueryClient()
  const { data } = useSerie(true)
  const series = useMemo(
    () =>
      (data?.data || [])
        .filter((serie) =>
          STANDARD_BILLING.includes(serie.billing?.value || ''),
        )
        .map((serie) => ({
          value: serie.id,
          label: `${serie.code} - ${serie.description}`,
        })),
    [data],
  )

  // O "Consumidor" da venda rápida não serve: o boleto pede o cadastro
  const known =
    client?.id && client.id !== defaultClientId
      ? { value: client.id, label: client.name }
      : null

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      client: known,
      seriesId: series.length === 1 ? series[0].value : '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    if (values.client?.value === defaultClientId) {
      form.setError('client', {
        message:
          'Escolha o cadastro do cliente, não o consumidor da venda rápida',
      })
      return
    }
    const res = await updateItemNew({
      route: `/sale/quotation/${quotationId}`,
      data: {
        clientId: values.client?.value,
        seriesId: values.seriesId,
        quickSale: false,
      },
    })
    if (!res.success) {
      toast.error(res.message || 'Não foi possível passar para venda padrão.')
      return
    }
    toast.success(
      'Agora é uma venda padrão: preencha as condições de pagamento e aprove.',
    )
    queryClient.invalidateQueries({ queryKey: ['quotation-data'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Passar para venda padrão</DialogTitle>
          <DialogDescription>
            Para o cliente cadastrado que quer boleto ou faturar. O balcão só
            recebe à vista; na venda padrão você escolhe as condições de
            pagamento, aprova, e o boleto segue pelo Fluxo financeiro.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={submit} className="space-y-4">
              <ClientSelector name="client" label="Cliente" width="w-full" />
              <FormSelect<FormType>
                name="seriesId"
                label="Série"
                placeholder="Série que fatura no pedido ou na entrega"
                width="w-full"
                options={series}
              />
              {!series.length && (
                <p className="text-sm text-warning-700">
                  Nenhuma série ativa fatura no pedido ou na entrega. Cadastre
                  uma em Configurações › Vendas › Séries de venda.
                </p>
              )}
              <p className="text-sm text-gray">
                A venda deixa de ser venda rápida e ganha o número da nova
                série.
              </p>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            isLoading={form.formState.isSubmitting}
            disabled={!series.length}
          >
            Passar para venda padrão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
