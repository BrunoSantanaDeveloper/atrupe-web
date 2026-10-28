'use client'

// Ativar um cliente inativo exige definir as formas de pagamento permitidas
// para ele (decisão do produto, 24/10/2026): inativar desliga todas as formas
// (27/10/2026), e um cadastro reativado sem forma venderia sem controle. Ao
// ativar, o usuário escolhe: aplicar o padrão da empresa (formas e limite de
// crédito do tipo do cliente, em Configurações › Financeiro › Limite de
// crédito) ou editar à mão. Pelo menos uma forma marcada; grava as formas e
// só então ativa.

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconRestore } from '@tabler/icons-react'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { formatCurrencyToBrl } from '@/lib/utils'
import { getItem, updateItemNew } from '@/actions/_cruds'
import { extractConditions } from '@/app/(app-sidebar)/cadastros/clientes/components/NewClient/utils/ExtractConditions'

type Condition = { id: string; name: string; isActive: boolean }
type Method = { id: string; name: string; conditions: Condition[] }
// A API pede o bloco do limite completo: os outros campos vão como estão
type Limit = { minValue: number; maxValue: number; blockClient: boolean }
// O padrão da empresa para o tipo do cliente (pessoa ou empresa)
type Defaults = { minValue: number; maxValue: number; paymentMethods: Method[] }
type Mode = 'default' | 'manual'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientType?: 'PERSON' | 'COMPANY'
}

const activeNames = (methods: Method[]) =>
  methods.flatMap((method) =>
    method.conditions
      .filter((condition) => condition.isActive)
      .map((condition) =>
        condition.name === method.name
          ? method.name
          : `${method.name} ${condition.name}`,
      ),
  )

export function ActivateClientDialog({
  open,
  onOpenChange,
  clientId,
  clientType = 'PERSON',
}: Props) {
  const queryClient = useQueryClient()
  const [methods, setMethods] = useState<Method[] | null>(null)
  const [defaults, setDefaults] = useState<Defaults | null>(null)
  const [mode, setMode] = useState<Mode>('default')
  const [limit, setLimit] = useState<Limit>({
    minValue: 0,
    maxValue: 0,
    blockClient: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setMethods(null)
    setDefaults(null)
    setMode('default')
    getItem({ route: `/client/${clientId}` }).then((res) => {
      if (!res.success) {
        toast.error(res.message)
        onOpenChange(false)
        return
      }
      const current = res.data?.creditLimit
      setLimit({
        minValue: current?.minValue ?? 0,
        maxValue: current?.maxValue ?? 0,
        blockClient: current?.blockClient ?? false,
      })
      setMethods(current?.paymentMethods ?? [])
    })
    // Sem o padrão (plano sem limite de crédito ou erro), fica só a edição
    getItem({ route: '/financial/credit-limit' }).then((res) => {
      const base = res.success
        ? res.data?.[clientType === 'COMPANY' ? 'company' : 'person']
        : null
      if (!base) {
        setMode('manual')
        return
      }
      setDefaults({
        minValue: base.minValue ?? 0,
        maxValue: base.maxValue ?? 0,
        paymentMethods: base.paymentMethods ?? [],
      })
    })
  }, [open, clientId, clientType, onOpenChange])

  const defaultNames = defaults ? activeNames(defaults.paymentMethods) : []
  const defaultUsable = defaultNames.length > 0

  useEffect(() => {
    if (defaults && !defaultUsable) setMode('manual')
  }, [defaults, defaultUsable])

  const toggle = (methodId: string, conditionId: string, checked: boolean) =>
    setMethods((current) =>
      (current ?? []).map((method) =>
        method.id !== methodId
          ? method
          : {
              ...method,
              conditions: method.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, isActive: checked }
                  : condition,
              ),
            },
      ),
    )

  const chosenManual = (methods ?? []).some((method) =>
    method.conditions.some((condition) => condition.isActive),
  )
  const chosen = mode === 'default' ? defaultUsable : chosenManual

  const activate = async () => {
    if (!chosen) {
      toast.error('Marque pelo menos uma forma de pagamento para ativar')
      return
    }
    setSaving(true)
    const creditLimit =
      mode === 'default' && defaults
        ? {
            ...limit,
            minValue: defaults.minValue,
            maxValue: defaults.maxValue,
            conditions: extractConditions(defaults.paymentMethods),
          }
        : { ...limit, conditions: extractConditions(methods ?? []) }
    const forms = await updateItemNew({
      route: `/client/${clientId}`,
      data: { creditLimit },
    })
    if (!forms.success) {
      setSaving(false)
      toast.error(forms.message)
      return
    }
    const status = await updateItemNew({
      route: `/client/${clientId}/status`,
      data: {},
    })
    setSaving(false)
    if (!status.success) {
      toast.error(status.message)
      return
    }
    toast.success('Cadastro ativado.')
    queryClient.invalidateQueries()
    onOpenChange(false)
  }

  const loading = methods === null || (defaults === null && mode === 'default')

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !saving && onOpenChange(value)}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Ativar cadastro</DialogTitle>
          <DialogDescription>
            As formas de pagamento deste cliente foram desligadas ao inativar.
            Escolha como ele volta a comprar: o cadastro só é ativado com pelo
            menos uma forma.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {defaults && (
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as Mode)}
              className="space-y-2"
            >
              <div className="flex items-start gap-2">
                <RadioGroupItem
                  value="default"
                  id="activate-default"
                  disabled={!defaultUsable}
                />
                <Label
                  htmlFor="activate-default"
                  className="font-normal leading-snug text-gray-700"
                >
                  <strong>Aplicar o padrão da empresa.</strong>{' '}
                  {defaultUsable ? (
                    <>
                      Limite de {formatCurrencyToBrl(defaults.minValue)} a{' '}
                      {formatCurrencyToBrl(defaults.maxValue)} e{' '}
                      {defaultNames.length === 1
                        ? '1 forma de pagamento'
                        : `${defaultNames.length} formas de pagamento`}
                      : {defaultNames.join(', ')}.
                    </>
                  ) : (
                    <>
                      O padrão de{' '}
                      {clientType === 'COMPANY' ? 'empresa' : 'pessoa'} não tem
                      nenhuma forma de pagamento marcada. Defina em
                      Configurações › Financeiro › Limite de crédito.
                    </>
                  )}
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="manual" id="activate-manual" />
                <Label
                  htmlFor="activate-manual"
                  className="font-normal leading-snug text-gray-700"
                >
                  <strong>Editar manualmente.</strong> Marcar as formas de
                  pagamento deste cliente uma a uma; o limite de crédito fica
                  como está.
                </Label>
              </div>
            </RadioGroup>
          )}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : mode === 'manual' ? (
            methods.length === 0 ? (
              <p className="text-sm text-gray">
                Nenhuma forma de pagamento cadastrada. Cadastre as condições de
                pagamento em Configurações › Financeiro.
              </p>
            ) : (
              <div className="rounded-lg border border-gray-200">
                {methods.map((method) => (
                  <div key={method.id}>
                    <div className="flex h-11 items-center bg-gray-100 px-6">
                      <h3 className="type-body-strong">{method.name}</h3>
                    </div>
                    {method.conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 text-sm text-gray-900"
                      >
                        <p>{condition.name}</p>
                        <Switch
                          checked={condition.isActive}
                          onCheckedChange={(checked) =>
                            toggle(method.id, condition.id, checked)
                          }
                          aria-label={condition.name}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          ) : null}
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            LeftIcon={IconRestore}
            onClick={activate}
            disabled={loading || !chosen}
            isLoading={saving}
          >
            Ativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
