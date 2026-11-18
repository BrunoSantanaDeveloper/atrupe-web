'use client'

// O cadastro da frente de caixa (FC-15): cada frente tem a sua conferência
// do fechamento (FC-7), a tolerância da quebra, o arredondamento no balcão
// em valor ou em percentual (FC-18) e a conta da gaveta. Criar e mudar exige
// "Configurar frente de caixa", que só o administrador tem por padrão.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useMemo, useState } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { MoneyInput } from '../../_components/cash/CashCountCheck'

// Types
import type { CashFrontValues } from '../types'

// Actions
import { getCashFronts, saveCashFront } from '@/actions/cash-front'
import { getBankAccounts } from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

const NEW = 'nova'

// A frente sem conta própria usa a padrão da forma
const DEFAULT_ACCOUNT = 'padrao'

const blank: CashFrontValues = {
  name: '',
  isDefault: false,
  isActive: true,
  blindCount: false,
  shortageTolerance: null,
  roundingType: 'VALUE',
  roundingLimit: 100,
  drawerAccountId: null,
  pixAccountId: null,
  cardAccountId: null,
}

export function CashFrontSettingsDialog({
  open,
  onDone,
  onOpenChange,
}: {
  open: boolean
  onDone: () => void
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState('')
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  const { data: frontsRes } = useQuery({
    enabled: open,
    queryKey: ['cash-fronts'],
    queryFn: () => getCashFronts(),
  })
  const { data: accountsRes } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['bank-accounts'],
    queryFn: () => getBankAccounts(),
  })
  const fronts = useMemo(() => frontsRes?.data || [], [frontsRes])
  // A gaveta é sempre uma conta Caixa (caixa físico)
  const drawers = (accountsRes?.data || []).filter(
    (account) => account.isActive && account.kind === 'CASH',
  )
  // O PIX e o cartão vão para um banco ou uma operadora (CX-2)
  const receivingAccounts = [
    { value: DEFAULT_ACCOUNT, label: 'A padrão da forma' },
    ...(accountsRes?.data || [])
      .filter((account) => account.isActive && account.kind !== 'CASH')
      .map((account) => ({ value: account.id, label: account.name })),
  ]

  useEffect(() => {
    if (open && !selected && fronts.length) setSelected(fronts[0].id)
  }, [open, selected, fronts])

  useEffect(() => {
    if (selected === NEW) return setForm({ ...blank, name: '' })
    const front = fronts.find((item) => item.id === selected)
    if (front) {
      setForm({
        name: front.name,
        isDefault: front.isDefault,
        isActive: front.isActive,
        blindCount: front.blindCount,
        shortageTolerance: front.shortageTolerance,
        roundingType: front.roundingType,
        roundingLimit: front.roundingLimit,
        drawerAccountId: front.drawerAccountId,
        pixAccountId: front.pixAccountId,
        cardAccountId: front.cardAccountId,
      })
    }
  }, [selected, fronts])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const save = async () => {
    setSaving(true)
    const res = await saveCashFront(
      selected === NEW ? undefined : selected,
      form,
    )
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success('Frente de caixa salva')
    if (res.data?.id) setSelected(res.data.id)
    await queryClient.invalidateQueries({ queryKey: ['cash-fronts'] })
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Configurar frente de caixa</DialogTitle>
          <DialogDescription>
            Cada frente tem a sua conferência do fechamento, a tolerância da
            quebra, o arredondamento no balcão e a gaveta.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex items-end gap-2">
            <SelectBasic
              name="front"
              label="Frente de caixa"
              value={selected}
              onChange={setSelected}
              options={[
                ...fronts.map((front) => ({
                  value: front.id,
                  label: `${front.name}${front.isDefault ? ' (padrão)' : ''}${front.isActive ? '' : ' · inativa'}`,
                })),
                ...(selected === NEW
                  ? [{ value: NEW, label: 'Nova frente de caixa' }]
                  : []),
              ]}
            />
            <Button
              type="button"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              onClick={() => setSelected(NEW)}
            >
              Nova
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="front-name">Nome</Label>
            <Input
              id="front-name"
              value={form.name}
              placeholder="Ex.: Caixa 1, Balcão"
              onChange={(event) => set('name', event.target.value)}
            />
          </div>

          <SelectBasic
            name="blind"
            label="Conferência do fechamento"
            value={form.blindCount ? 'blind' : 'simple'}
            onChange={(value) => set('blindCount', value === 'blind')}
            options={[
              { value: 'simple', label: 'Conferência simples (padrão)' },
              { value: 'blind', label: 'Contagem às cegas' },
            ]}
          />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox
                checked={form.shortageTolerance !== null}
                onCheckedChange={(checked) =>
                  set('shortageTolerance', checked ? 50 : null)
                }
              />
              Tolerância da quebra
            </label>
            {form.shortageTolerance !== null && (
              <MoneyInput
                id="tolerance"
                label="Diferença que aparece mas não é lançada como quebra"
                value={form.shortageTolerance}
                onChange={(value) => set('shortageTolerance', value)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectBasic
              name="rounding"
              label="Arredondamento no balcão"
              value={form.roundingType}
              onChange={(value) => {
                set('roundingType', value as 'VALUE' | 'PERCENT')
                set('roundingLimit', value === 'PERCENT' ? 500 : 100)
              }}
              options={[
                { value: 'VALUE', label: 'Em valor' },
                { value: 'PERCENT', label: 'Em percentual da venda' },
              ]}
            />
            {form.roundingType === 'VALUE' ? (
              <MoneyInput
                id="rounding-value"
                label="Até"
                value={form.roundingLimit}
                onChange={(value) => set('roundingLimit', value)}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="rounding-percent">Até (%)</Label>
                <Input
                  id="rounding-percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.roundingLimit / 100}
                  onChange={(event) =>
                    set(
                      'roundingLimit',
                      Math.round(Number(event.target.value || 0) * 100),
                    )
                  }
                />
              </div>
            )}
          </div>

          <SelectBasic
            name="drawer"
            label="Gaveta (conta Caixa)"
            value={form.drawerAccountId || ''}
            onChange={(value) => set('drawerAccountId', value || null)}
            options={drawers.map((account) => ({
              value: account.id,
              label: account.name,
            }))}
          />

          <div className="space-y-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectBasic
                name="pix-account"
                label="Conta do PIX"
                value={form.pixAccountId || DEFAULT_ACCOUNT}
                onChange={(value) =>
                  set(
                    'pixAccountId',
                    value === DEFAULT_ACCOUNT ? null : value || null,
                  )
                }
                options={receivingAccounts}
              />
              <SelectBasic
                name="card-account"
                label="Conta do cartão"
                value={form.cardAccountId || DEFAULT_ACCOUNT}
                onChange={(value) =>
                  set(
                    'cardAccountId',
                    value === DEFAULT_ACCOUNT ? null : value || null,
                  )
                }
                options={receivingAccounts}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray">
              Como funciona
              <InfoHint title="Contas de recebimento">
                <p>
                  Quando o operador não escolhe a conta, o PIX e o cartão
                  recebidos nesta frente de caixa caem nas contas escolhidas
                  aqui.
                </p>
                <p>
                  Sem conta escolhida, vale a conta padrão da forma de
                  pagamento, em Configurações › Financeiro › Contas bancárias.
                </p>
              </InfoHint>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isDefault}
                onCheckedChange={(checked) => set('isDefault', !!checked)}
              />
              Frente padrão
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(checked) => set('isActive', !!checked)}
              />
              Ativa
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!form.name.trim()}
            onClick={save}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
