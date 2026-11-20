'use client'

// Reverter a venda rápida para faturamento (FC-4). Quem informa o cliente e
// define o boleto ou o faturamento é o caixa: a venda sai da fila e vai para o
// fluxo financeiro, no nome do cliente. Os campos são os mesmos do lançamento
// a receber do Fluxo financeiro, para as duas telas não divergirem.
//
// Lista Lite 19/11: o cliente da venda já vem escolhido (item 11), a lista
// mostra só as formas liberadas para ele (item 12) e, com o limite curto, a
// janela diz a entrada mínima: recebida no caixa, o restante é faturado
// (item 14). Escolher a forma não é receber: a entrada entra pelo Receber.

// React
import { useEffect, useState } from 'react'

// Third-party
import { useQuery } from '@tanstack/react-query'

// UI
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

import { AlertBanner } from '@/components/ui/alert-banner'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

// Types
import type { PendingSale } from '../types'

// Actions
import { getItem } from '@/actions/_cruds'
import { reverseToBilling } from '@/actions/cash-front'
import type { QuotationCredit } from '@/hooks/queries/useQuotationCredit'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

// Icons
import { IconAlertTriangle } from '@tabler/icons-react'

interface Props {
  sale?: PendingSale
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

type BillingValues = {
  paymentConditionId: string
  installmentQty: number
  dueDate: Date | undefined
  notes: string
}

const defaults: BillingValues = {
  paymentConditionId: '',
  installmentQty: 1,
  dueDate: undefined,
  notes: '',
}

export function BillingDialog({ sale, onDone, onOpenChange }: Props) {
  const money = useMoney()
  // A busca de cliente devolve o nome junto, que o registro da venda usa
  const [client, setClient] = useState<{ value: string; label: string } | null>(
    null,
  )
  const form = useForm<BillingValues>({ defaultValues: defaults })

  useEffect(() => {
    if (!sale) return

    // O cliente da venda (da OS ou do orçamento) já vem escolhido
    setClient(
      sale.clientId ? { value: sale.clientId, label: sale.client } : null,
    )
    form.reset(defaults)
  }, [sale, form])

  // A situação de crédito do cliente: formas liberadas e limite disponível
  const { data: credit } = useQuery({
    queryKey: ['billing-client-credit', client?.value],
    queryFn: async () => {
      const result = await getItem({
        route: `/sale/quotation/client-credit/${client?.value}`,
      })
      return result.success ? ((result.data ?? null) as QuotationCredit) : null
    },
    enabled: !!client?.value,
    staleTime: 30_000,
  })

  const allowedIds = credit?.allowedConditionIds ?? null
  const conditionId = form.watch('paymentConditionId')
  // Trocou o cliente e a forma escolhida não vale para ele: limpa
  useEffect(() => {
    if (conditionId && allowedIds && !allowedIds.includes(conditionId)) {
      form.setValue('paymentConditionId', '')
    }
  }, [allowedIds, conditionId, form])

  // O que vai a prazo: o total menos a entrada já recebida no caixa
  const paid = sale?.paid ?? 0
  const remainder = Math.max((sale?.total ?? 0) - paid, 0)
  const available =
    credit?.applies && credit.enforcing && typeof credit.available === 'number'
      ? credit.available
      : null
  // Entrada mínima para o restante caber no limite
  const minEntry =
    available !== null && remainder > available
      ? remainder - Math.max(available, 0)
      : 0
  const blockedByCredit = minEntry > 0 || !!credit?.blockClient

  const save = form.handleSubmit(async (values) => {
    if (!sale || !client) return

    const res = await reverseToBilling(sale.id, {
      client: { id: client.value, name: client.label },
      paymentConditionId: values.paymentConditionId,
      installmentQty: Number(values.installmentQty) || 1,
      dueDate: values.dueDate ? values.dueDate.toISOString() : '',
      notes: values.notes,
    })

    if (!res.success) return toast.error(res.message)

    toast.success('Venda faturada para o cliente')
    onDone()
    onOpenChange(false)
  })

  const ready =
    !!client &&
    !!form.watch('paymentConditionId') &&
    !!form.watch('dueDate') &&
    !blockedByCredit

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <Form {...form}>
          <form onSubmit={save}>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div>
                  <DialogTitle>
                    Faturar {sale?.reference} para o cliente
                  </DialogTitle>
                  <DialogDescription>
                    {paid > 0
                      ? `${money(remainder)} a prazo (de ${money(sale?.total)}, com ${money(paid)} de entrada recebida) · vai para o fluxo financeiro, no nome do cliente.`
                      : `${money(sale?.total)} · a venda sai do caixa e vai para o fluxo financeiro, no nome do cliente.`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <DialogBody>
              <div className="flex flex-wrap gap-5">
                <AsyncSelectBasic
                  route="/client"
                  width="flex-[1_0_100%]"
                  value={client}
                  onChange={setClient}
                  minChars={1}
                  label="Cliente"
                  placeholder="Busque o cliente"
                />
                {credit?.blockClient ? (
                  <AlertBanner
                    variant="error"
                    icon={IconAlertTriangle}
                    className="w-full rounded-lg border"
                    title="Este cliente está bloqueado para faturamento"
                    description="Quem pode desbloquear faz isso no cadastro do cliente. Enquanto isso, receba a venda no caixa."
                  />
                ) : minEntry > 0 ? (
                  <AlertBanner
                    variant="warning"
                    icon={IconAlertTriangle}
                    className="w-full rounded-lg border"
                    title={
                      minEntry >= remainder
                        ? 'Atenção! Limite de crédito excedido'
                        : `Entrada mínima de ${money(minEntry)}`
                    }
                    description={
                      minEntry >= remainder
                        ? `O cliente não tem limite disponível. Para concluir, receba ${money(remainder)} à vista no caixa, ou peça ao financeiro uma revisão do limite de crédito.`
                        : `O cliente tem ${money(Math.max(available ?? 0, 0))} de limite disponível. Receba pelo menos ${money(minEntry)} de entrada no caixa (Receber, valor parcial) e volte aqui para faturar o restante. Escolher a forma não conta como recebido.`
                    }
                  />
                ) : null}
                <PaymentConditionsSelectField
                  name="paymentConditionId"
                  label="Forma de pagamento"
                  width="flex-[1_0_260px]"
                  allowedIds={allowedIds}
                />
                <FormInput
                  type="number"
                  name="installmentQty"
                  label="Quantidade de parcelas"
                  width="flex-[1_0_160px]"
                  min={1}
                />
                <FormDatePickerInput
                  name="dueDate"
                  label="Data de vencimento"
                  width="flex-[1_0_260px]"
                />
                <FormTextarea name="notes" label="Observação" />
                <p className="text-sm text-gray">
                  Só cliente com cadastro aprovado e liberado para a forma
                  escolhida pode ser faturado. Pré-cadastro não fatura: complete
                  o cadastro em Cadastros antes.
                </p>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={form.formState.isSubmitting}
                disabled={!ready}
              >
                Faturar para o cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
