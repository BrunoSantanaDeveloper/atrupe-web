'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import type { AssetRecord, AssetSaleResult } from '../../types'

// Actions
import { getAssetAccounts, sellAsset } from '@/actions/asset'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { useBankAccount } from '@/hooks/queries/useBankAccount'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons

interface Props {
  asset: AssetRecord
  open: boolean
  onOpenChange: () => void
}

// A data de hoje no fuso de quem usa, no formato do campo de data
const today = () => {
  const now = new Date()

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

// Perda em vermelho, com o sinal
function SaleResultValue({ result }: { result: number }) {
  return (
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
  )
}

// A venda dá saída no bem e gera receita no financeiro, com o valor restante e
// a conta sugeridos (P-25).
export function SellAssetModal({ asset, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  // A prévia usa a depreciação acumulada até hoje; a API refaz a conta na
  // data da venda e devolve o restante e o resultado que valeram
  const remaining = asset.acquisitionValue - (asset.depreciatedValue ?? 0)

  const [value, setValue] = useState((remaining / 100).toFixed(2))
  const [date, setDate] = useState(today)
  const [account, setAccount] = useState('')
  const [bankAccountId, setBankAccountId] = useState('none')
  const [sold, setSold] = useState<AssetSaleResult>()

  // A receita entra numa subcategoria de receita do plano de contas (nível 01)
  const { data: accountsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['asset-accounts', 'receivable'],
    queryFn: () => getAssetAccounts({ type: 'receivable' }),
    enabled: open,
  })
  const accounts = (accountsData?.data || []).map((item) => ({
    value: item.id,
    label: item.label,
  }))
  // Sugerida: a conta de venda de patrimônio, quando o plano tem uma
  const suggested = accountsData?.data?.find((item) =>
    /patrim/i.test(item.description),
  )?.id
  const financialNatureId = account || suggested || ''

  // A conta bancária é opcional: sem ela, a receita fica sem conta
  const { data: bankAccounts } = useBankAccount({
    filters: {},
    isBankRequired: false,
  })
  const banks = [
    { value: 'none', label: 'Sem conta bancária' },
    ...(bankAccounts || [])
      .filter((bank) => bank.isActive)
      .map((bank) => ({ value: bank.id, label: bank.name })),
  ]

  const received = Math.round(Number(value || 0) * 100)
  const result = received - remaining

  const close = () => {
    setSold(undefined)
    onOpenChange()
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      sellAsset({
        id: asset.id,
        value: received,
        date,
        financialNatureId,
        bankAccountId: bankAccountId === 'none' ? null : bankAccountId,
      }),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        return toast.error(response.message)
      }

      toast.success('Patrimônio vendido e receita lançada')
      queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      // O modal fica aberto com o que a API calculou na data da venda
      setSold(response.data)
    },
    onError: () => toast.error('Erro ao registrar a venda'),
  })

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Vender patrimônio</DialogTitle>
            <DialogDescription className="sr-only">
              Informe o valor recebido pela venda do bem.
            </DialogDescription>
          </div>
        </DialogHeader>
        {sold ? (
          <>
            <DialogBody className="space-y-5">
              <p className="text-sm text-gray">
                A receita foi lançada no financeiro e o bem foi inativado.
              </p>
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray">Valor recebido</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrencyToBrl(sold.received)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray">Valor restante do bem</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrencyToBrl(sold.remaining)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray">Resultado da venda</p>
                  <SaleResultValue result={sold.result} />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button onClick={close}>Fechar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogBody className="space-y-5">
              <p className="text-sm text-gray">
                A venda dá saída no bem, encerra a depreciação e gera uma
                receita no financeiro. A depreciação deixa o custo do setor no
                mês seguinte.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="sell-date" className="text-sm font-medium">
                    Data da venda
                  </label>
                  <Input
                    id="sell-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-gray">
                Sugerido: {formatCurrencyToBrl(remaining)} — valor do bem menos
                a depreciação acumulada.
              </p>

              <SelectBasic
                name="account"
                label="Conta do plano de contas"
                value={financialNatureId}
                onChange={setAccount}
                options={accounts}
                emptyMessage="Nenhuma conta de receita no plano de contas"
              />

              <SelectBasic
                name="bank-account"
                label="Conta bancária (opcional)"
                value={bankAccountId}
                onChange={setBankAccountId}
                options={banks}
              />

              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm text-gray">Resultado da venda</p>
                <SaleResultValue result={result} />
                <p className="text-sm text-gray">
                  Diferença entre o valor recebido e o valor restante do bem.
                </p>
              </div>

              {asset.setups.length > 0 && (
                <p className="text-sm text-warning-700 bg-warning-25 border border-warning-200 rounded-lg p-3">
                  Este bem tem configurações produtivas em uso. As composições
                  que dependem dele perdem o custo da máquina.
                </p>
              )}
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                isLoading={isPending}
                disabled={!financialNatureId || !date}
                onClick={() => mutate()}
              >
                Registrar venda
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
