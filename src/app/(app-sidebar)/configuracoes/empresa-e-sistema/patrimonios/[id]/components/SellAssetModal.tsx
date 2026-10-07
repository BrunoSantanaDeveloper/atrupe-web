'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { Asset } from '../../types'

// Actions
import { sellAsset } from '@/actions/assets'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconShoppingCart } from '@tabler/icons-react'

interface Props {
  asset: Asset
  open: boolean
  onOpenChange: () => void
}

const accounts = [
  { value: '01.02.01.01', label: '01.02.01.01 — Venda de patrimônio' },
  { value: '01.02.01.02', label: '01.02.01.02 — Outras receitas' },
]

// A venda dá saída no bem e gera receita no financeiro, com o valor restante e
// a conta sugeridos (P-25).
export function SellAssetModal({ asset, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const remaining =
    asset.residualValue !== null
      ? asset.acquisitionValue - asset.residualValue
      : asset.acquisitionValue

  const [value, setValue] = useState((remaining / 100).toFixed(2))
  const [account, setAccount] = useState(accounts[0].value)

  const received = Math.round(Number(value || 0) * 100)
  const result = received - remaining

  const { mutate, isPending } = useMutation({
    mutationFn: () => sellAsset({ id: asset.id, value: received }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Patrimônio vendido e receita lançada')
      queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao registrar a venda'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconShoppingCart} />
            <DialogTitle>Vender patrimônio</DialogTitle>
            <DialogDescription className="sr-only">
              Informe o valor recebido pela venda do bem.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <p className="text-sm text-gray">
            A venda dá saída no bem, encerra a depreciação e gera uma receita no
            financeiro. A depreciação deixa o custo do setor no mês seguinte.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="sell-value" className="text-sm font-medium">
              Valor recebido
            </label>
            <Input
              id="sell-value"
              type="number"
              min={0}
              step="0.01"
              startAdornment={<span className="text-sm">R$</span>}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <p className="text-sm text-gray">
              Sugerido: {formatCurrencyToBrl(remaining)} — valor do bem menos a
              depreciação acumulada.
            </p>
          </div>

          <SelectBasic
            name="account"
            label="Conta do plano de contas"
            value={account}
            onChange={setAccount}
            options={accounts}
          />

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray">Resultado da venda</p>
            <p
              className={
                result < 0
                  ? 'text-lg font-semibold text-error-700'
                  : 'text-lg font-semibold text-gray-900'
              }
            >
              {result < 0 ? '-' : ''}
              {formatCurrencyToBrl(Math.abs(result))}
            </p>
            <p className="text-sm text-gray">
              Diferença entre o valor recebido e o valor restante do bem.
            </p>
          </div>

          {asset.setups.length > 0 && (
            <p className="text-sm text-warning-700 bg-warning-25 border border-warning-200 rounded-lg p-3">
              Este bem tem configurações produtivas em uso. As composições que
              dependem dele perdem o custo da máquina.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button isLoading={isPending} onClick={() => mutate()}>
            Registrar venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
