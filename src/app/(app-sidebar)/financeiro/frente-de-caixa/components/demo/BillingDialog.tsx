'use client'

// Reverter a venda rápida para faturamento (FC-4). Quem informa o cliente e
// define o boleto ou o faturamento é o caixa: a venda sai da fila e vai para o
// fluxo financeiro, no nome do cliente. Os campos são os mesmos do lançamento
// a receber do Fluxo financeiro, para as duas telas não divergirem.

// React
import { useEffect, useState } from 'react'

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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { PaymentConditionsSelectField } from '@/components/common/form/global-inputs/PaymentConditionsSelectField'

// Types
import type { PendingSale } from '../../types'

// Actions
import { reverseToBilling } from '@/actions/cash-front'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

// Icons
import { IconRefreshDot } from '@tabler/icons-react'

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

    setClient(null)
    form.reset(defaults)
  }, [sale, form])

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
    !!client && !!form.watch('paymentConditionId') && !!form.watch('dueDate')

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <Form {...form}>
          <form onSubmit={save}>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconRefreshDot} />
                <div>
                  <DialogTitle>
                    Faturar {sale?.reference} para o cliente
                  </DialogTitle>
                  <DialogDescription>
                    {money(sale?.total)} · a venda sai do caixa e vai para o
                    fluxo financeiro, no nome do cliente.
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
                <PaymentConditionsSelectField
                  name="paymentConditionId"
                  label="Forma de pagamento"
                  width="flex-[1_0_260px]"
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
