'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { savePlanPresentation, savePlanPricing } from '@/actions/planConfig'
import { formatCurrencyToBrl } from '@/lib/utils'
import type { PlanMatrixPlan } from '@/types/planConfig'

import { ComparisonEditor } from './ComparisonEditor'
import { usePlanMatrix } from './FeatureMatrix'
import {
  HISTORY_QUERY_KEY,
  MANAGEABLE_PLANS_QUERY_KEY,
  MATRIX_QUERY_KEY,
  ManagerPasswordField,
  subscriptionsLabel,
} from './shared'

/** Reais digitados (com vírgula ou ponto) em centavos; NaN se inválido. */
const toCents = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return NaN
  // Com vírgula, o ponto é separador de milhar (1.470,50); sem vírgula, o
  // ponto é o decimal (147.50).
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/[.]/g, '').replace(',', '.')
    : trimmed
  const number = Number(normalized)
  return Number.isFinite(number) ? Math.round(number * 100) : NaN
}

const toReais = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/**
 * Preço e textos de cada plano na trilha de contratação, e a tabela
 * comparativa. O preço vale para contratações, evoluções e usuários
 * adicionais comprados daqui em diante; a mensalidade de quem já assina não
 * muda.
 */
export function PricingTexts() {
  const { data, isLoading, isError, error } = usePlanMatrix()

  return (
    <div className="space-y-4">
      <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p>
          O preço vale para novas contratações, evoluções e usuários adicionais
          comprados a partir de agora. A mensalidade de quem já assina não muda.
        </p>
        <p className="text-xs text-gray-500">
          Os textos aparecem no card do plano na página de contratação e na de
          evolução. Sem texto salvo, vale o padrão do sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-error-700">{error.message}</p>
      ) : (
        (data?.plans ?? [])
          .filter((plan) => plan.planType !== 'TRIAL')
          .map((plan) => <PlanCard key={plan.id} plan={plan} />)
      )}

      <ComparisonEditor />
    </div>
  )
}

function PlanCard({ plan }: { plan: PlanMatrixPlan }) {
  const queryClient = useQueryClient()
  const [price, setPrice] = useState('')
  const [userPrice, setUserPrice] = useState('')
  const [pitch, setPitch] = useState('')
  const [actions, setActions] = useState('')
  const [savingTexts, setSavingTexts] = useState(false)
  const [confirmPrice, setConfirmPrice] = useState(false)

  const presentation = plan.presentation ?? plan.defaults.presentation

  useEffect(() => {
    setPrice(toReais(plan.basePrice))
    setUserPrice(toReais(plan.additionalUserPrice))
  }, [plan.basePrice, plan.additionalUserPrice])

  useEffect(() => {
    setPitch(presentation?.pitch ?? '')
    setActions((presentation?.actions ?? []).join('\n'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.presentation])

  const basePrice = toCents(price)
  const additionalUserPrice = toCents(userPrice)
  const priceValid =
    Number.isFinite(basePrice) &&
    Number.isFinite(additionalUserPrice) &&
    basePrice >= 0 &&
    additionalUserPrice >= 0 &&
    (!plan.isActive || basePrice > 0)
  const priceChanged =
    priceValid &&
    (basePrice !== Math.round(plan.basePrice) ||
      additionalUserPrice !== Math.round(plan.additionalUserPrice))

  const actionList = actions
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const textsChanged =
    pitch.trim() !== (presentation?.pitch ?? '') ||
    JSON.stringify(actionList) !== JSON.stringify(presentation?.actions ?? [])

  const saveTexts = async () => {
    setSavingTexts(true)
    try {
      const res = await savePlanPresentation(plan.id, {
        pitch: pitch.trim(),
        actions: actionList,
      })
      if (res.success) {
        toast.success(`Textos do plano ${plan.name} salvos.`)
        queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
      } else {
        toast.error(res.message || 'Não foi possível salvar os textos.')
      }
    } finally {
      setSavingTexts(false)
    }
  }

  const restoreTexts = () => {
    setPitch(plan.defaults.presentation?.pitch ?? '')
    setActions((plan.defaults.presentation?.actions ?? []).join('\n'))
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
          <span className="text-xs text-gray-500">
            {subscriptionsLabel(plan.currentSubscriptions)}
          </span>
          {!plan.isActive && (
            <span className="text-xs text-amber-600">Em breve</span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor={`price-${plan.id}`}>Mensalidade (R$)</Label>
            <Input
              id={`price-${plan.id}`}
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`user-price-${plan.id}`}>
              Usuário adicional (R$)
            </Label>
            <Input
              id={`user-price-${plan.id}`}
              inputMode="decimal"
              value={userPrice}
              onChange={(event) => setUserPrice(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="neutralOutline"
            disabled={!priceChanged}
            onClick={() => setConfirmPrice(true)}
          >
            Salvar preço
          </Button>
        </div>
        {!priceValid && (
          <p className="text-xs text-error-700">
            {plan.isActive
              ? 'Informe valores válidos; a mensalidade de um plano disponível precisa ser maior que zero.'
              : 'Informe valores válidos.'}
          </p>
        )}

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor={`pitch-${plan.id}`}>
              Frase do card (&quot;para quem é&quot;)
            </Label>
            <Input
              id={`pitch-${plan.id}`}
              value={pitch}
              maxLength={200}
              onChange={(event) => setPitch(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`actions-${plan.id}`}>
              O que o plano entrega (um item por linha)
            </Label>
            <Textarea
              id={`actions-${plan.id}`}
              rows={Math.min(12, Math.max(4, actionList.length + 1))}
              value={actions}
              onChange={(event) => setActions(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {plan.defaults.presentation && (
              <Button
                type="button"
                variant="neutralGhost"
                onClick={restoreTexts}
                disabled={savingTexts}
              >
                Voltar ao texto padrão
              </Button>
            )}
            <Button
              type="button"
              onClick={saveTexts}
              disabled={!textsChanged || !pitch.trim() || savingTexts}
              isLoading={savingTexts}
            >
              Salvar textos
            </Button>
          </div>
        </div>
      </CardContent>

      <ConfirmPricingDialog
        open={confirmPrice}
        plan={plan}
        basePrice={basePrice}
        additionalUserPrice={additionalUserPrice}
        onClose={() => setConfirmPrice(false)}
        onSaved={() => {
          setConfirmPrice(false)
          queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
          queryClient.invalidateQueries({
            queryKey: MANAGEABLE_PLANS_QUERY_KEY,
          })
        }}
      />
    </Card>
  )
}

function ConfirmPricingDialog({
  open,
  plan,
  basePrice,
  additionalUserPrice,
  onClose,
  onSaved,
}: {
  open: boolean
  plan: PlanMatrixPlan
  basePrice: number
  additionalUserPrice: number
  onClose: () => void
  onSaved: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setPassword('')
    setError(null)
  }, [open])

  const current = plan.currentSubscriptions
  const needsPassword = current > 0

  const handleConfirm = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await savePlanPricing(plan.id, {
        basePrice,
        additionalUserPrice,
        expectedAffected: current,
        password: needsPassword ? password : undefined,
      })
      if (res.success) {
        toast.success(`Preço do plano ${plan.name} atualizado.`)
        onSaved()
        return
      }
      setError(res.message || 'Não foi possível salvar o preço.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !saving) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Alterar o preço do plano {plan.name}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-3 text-sm text-gray-600">
          <ul className="space-y-1">
            <li>
              Mensalidade: {formatCurrencyToBrl(plan.basePrice)} para{' '}
              <strong>{formatCurrencyToBrl(basePrice)}</strong>
            </li>
            <li>
              Usuário adicional: {formatCurrencyToBrl(plan.additionalUserPrice)}{' '}
              para <strong>{formatCurrencyToBrl(additionalUserPrice)}</strong>
            </li>
          </ul>
          <p>
            Vale para novas contratações, evoluções e usuários adicionais
            comprados a partir de agora.
            {current > 0
              ? ` As ${subscriptionsLabel(current)} continuam com a mensalidade de hoje, mas pagam o preço novo pelo usuário adicional que comprarem.`
              : ''}
          </p>
          {needsPassword && (
            <ManagerPasswordField
              value={password}
              onChange={setPassword}
              disabled={saving}
            />
          )}
          {error && (
            <p className="text-sm text-error-700" role="alert">
              {error}
            </p>
          )}
        </DialogBody>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={saving || (needsPassword && !password.trim())}
            isLoading={saving}
          >
            Salvar preço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
