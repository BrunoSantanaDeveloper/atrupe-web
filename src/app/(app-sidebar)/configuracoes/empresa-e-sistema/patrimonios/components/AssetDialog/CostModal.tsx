'use client'

// React / Next
import { useEffect, useState } from 'react'

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
import type { AssetCostItem, AssetRecord, CostNature } from '../../types'

// Actions
import {
  createAssetCost,
  updateAssetCost,
  getAssetAccounts,
} from '@/actions/asset'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort, costNatureOptions } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  asset: AssetRecord
  // Com o custo, a mesma janela edita (28/10/2026: custo errado tem conserto)
  cost?: AssetCostItem
  // Controlada de fora (a linha da tabela); sem isso, traz o próprio botão
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// As três naturezas de custo (P-6). A conta do plano de contas serve ao
// Comparativo (P-17), e o custo mensal é calculado pela regra.
export function CostModal({
  asset,
  cost: editing,
  open: openProp,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const [innerOpen, setInnerOpen] = useState(false)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : innerOpen
  const setOpen = (value: boolean) =>
    controlled ? onOpenChange?.(value) : setInnerOpen(value)
  const [name, setName] = useState('')
  const [nature, setNature] = useState<CostNature>('FIXED')
  const [unitCost, setUnitCost] = useState('')
  const [yieldAmount, setYieldAmount] = useState('1')
  const [accountId, setAccountId] = useState('none')
  const [setupId, setSetupId] = useState('')
  const [lastOccurrence, setLastOccurrence] = useState('')

  // Ao abrir para editar, os campos vêm do custo
  useEffect(() => {
    if (!open || !editing) return
    setName(editing.name)
    setNature(editing.nature)
    setUnitCost(String(editing.unitCost / 100))
    setYieldAmount(String(editing.yieldAmount))
    setAccountId(editing.financialNatureId || 'none')
    setSetupId(editing.setupId || '')
    setLastOccurrence(editing.lastOccurrence || '')
  }, [open, editing])

  // A conta é uma subcategoria de despesa do plano de contas (P-17)
  const { data: accountsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['asset-accounts', 'payable'],
    queryFn: () => getAssetAccounts({ type: 'payable' }),
    enabled: open,
  })
  const accounts = [
    { value: 'none', label: 'Sem conta' },
    ...(accountsData?.data || []).map((account) => ({
      value: account.id,
      label: account.label,
    })),
  ]

  const isFixed = nature === 'FIXED'
  // O variável da configuração produtiva aponta para uma delas e usa a
  // produtividade dela (P-19)
  const isSetup = nature === 'SETUP_VARIABLE'
  const setup = asset.setups.find((item) => item.id === setupId)
  const productivity = isSetup
    ? setup?.monthlyProductivity || 0
    : asset.monthlyProductivity || 0
  const unit = asset.unit ? assetUnitShort[asset.unit] : 'unidade'
  const cost = Math.round(Number(unitCost || 0) * 100)
  const amount = Number(yieldAmount || 1)

  const monthlyCost = isFixed
    ? Math.round(cost / (amount || 1))
    : Math.round((cost / (amount || 1)) * productivity)

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        nature,
        unitCost: cost,
        yieldAmount: amount,
        financialNatureId: accountId === 'none' ? null : accountId,
        lastOccurrence: lastOccurrence || null,
        setupId: isSetup ? setupId || null : null,
      }
      return editing
        ? updateAssetCost({
            assetId: asset.id,
            costId: editing.id,
            cost: values,
          })
        : createAssetCost({ assetId: asset.id, cost: values })
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(editing ? 'Custo atualizado' : 'Custo lançado')
      queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setName('')
      setUnitCost('')
      setSetupId('')
      setOpen(false)
    },
    onError: () =>
      toast.error(
        editing ? 'Erro ao salvar o custo' : 'Erro ao lançar o custo',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <Button
          variant="neutralOutline"
          LeftIcon={IconPlus}
          onClick={() => setOpen(true)}
        >
          Novo custo
        </Button>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>
              {editing
                ? 'Editar custo do patrimônio'
                : 'Novo custo do patrimônio'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Lance um custo fixo ou variável do bem.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="cost-name" className="text-sm font-medium">
              Nome do custo
            </label>
            <Input
              id="cost-name"
              value={name}
              placeholder="Ex.: Tinta, manutenção preventiva"
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <SelectBasic
            name="nature"
            label="Natureza do custo"
            value={nature}
            onChange={(value) => setNature(value as CostNature)}
            options={costNatureOptions}
          />

          {isSetup && (
            <SelectBasic
              name="setup"
              label="Configuração produtiva"
              value={setupId}
              onChange={setSetupId}
              options={asset.setups.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              emptyMessage="Cadastre uma configuração produtiva antes"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="cost-value" className="text-sm font-medium">
                Valor
              </label>
              <Input
                id="cost-value"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cost-yield" className="text-sm font-medium">
                {isFixed ? 'A cada quantos meses' : `Rende quantos ${unit}`}
              </label>
              <Input
                id="cost-yield"
                type="number"
                min={1}
                step="0.01"
                value={yieldAmount}
                onChange={(event) => setYieldAmount(event.target.value)}
              />
            </div>
          </div>

          <SelectBasic
            name="account"
            label="Conta do plano de contas"
            value={accountId}
            onChange={setAccountId}
            options={accounts}
          />

          <div className="space-y-1.5">
            <label htmlFor="cost-date" className="text-sm font-medium">
              Última ocorrência (opcional)
            </label>
            <Input
              id="cost-date"
              type="date"
              value={lastOccurrence}
              onChange={(event) => setLastOccurrence(event.target.value)}
            />
            <p className="text-sm text-gray">
              Serve para avisar quando a próxima troca ou pagamento se aproxima.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray">Custo mensal estimado</p>
            <p className="text-lg font-semibold text-gray-900">
              {productivity || isFixed
                ? formatCurrencyToBrl(monthlyCost)
                : 'Não calculado'}
            </p>
            <p className="text-sm text-gray">
              {isFixed
                ? 'O valor é diluído pela periodicidade informada.'
                : `Multiplicado pelo volume mensal previsto ${isSetup ? 'da configuração' : 'do bem'} (${productivity} ${unit}/mês).`}
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !unitCost || (isSetup && !setupId)}
            onClick={() => mutate()}
          >
            {editing ? 'Salvar' : 'Lançar custo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
