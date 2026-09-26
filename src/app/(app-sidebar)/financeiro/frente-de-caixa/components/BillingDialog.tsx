'use client'

// Reverter a venda rápida para faturamento (FC-4). O cliente que paga no fim
// do mês: a venda sai da fila do caixa e vai para o fluxo financeiro, no
// nome dele e com a forma de pagamento dele.

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
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { AsyncSelectBasic } from '@/components/common/form/AsyncSelectBasic'

// Types
import type { PendingSale } from '../types'

// Actions
import { reverseToBilling } from '@/actions/cash-front'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'
import { billingOptions } from '@/consts/cashFront'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconFileInvoice } from '@tabler/icons-react'

interface Props {
  sale?: PendingSale
  onDone: () => void
  onOpenChange: (open: boolean) => void
}

export function BillingDialog({ sale, onDone, onOpenChange }: Props) {
  const money = useMoney()
  const [client, setClient] = useState<{ value: string; label: string } | null>(
    null,
  )
  const [billing, setBilling] = useState(billingOptions[0].value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sale) {
      setClient(null)
      setBilling(billingOptions[0].value)
    }
  }, [sale])

  const save = async () => {
    if (!sale || !client) return
    setSaving(true)
    const res = await reverseToBilling(
      sale.id,
      { id: client.value, name: client.label },
      billing,
    )
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Venda faturada para o cliente')
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
            <div>
              <DialogTitle>
                Faturar {sale?.reference} para o cliente
              </DialogTitle>
              <DialogDescription>
                {money(sale?.total)} · a venda sai do caixa e vai para o fluxo
                financeiro, no nome do cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <AsyncSelectBasic
            route="/client"
            width="w-full"
            value={client}
            onChange={setClient}
            minChars={1}
            label="Cliente"
            placeholder="Busque o cliente"
          />
          <SelectBasic
            name="billing-method"
            label="Forma de pagamento"
            options={billingOptions}
            value={billing}
            onChange={setBilling}
          />
          <p className="text-sm text-gray">
            Faturar é para o cliente com cadastro completo: pré-cadastro não
            fatura. Se o cadastro estiver incompleto, complete em Cadastros
            antes.
          </p>
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
            type="button"
            isLoading={saving}
            disabled={!client}
            onClick={save}
          >
            Faturar para o cliente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
