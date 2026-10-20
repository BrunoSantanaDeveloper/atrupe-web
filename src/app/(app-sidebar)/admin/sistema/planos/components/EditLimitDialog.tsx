'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconAdjustments } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { savePlanLimit } from '@/actions/planConfig'
import type { PlanMatrixLimit, PlanMatrixPlan } from '@/types/planConfig'

import {
  HISTORY_QUERY_KEY,
  MATRIX_QUERY_KEY,
  ManagerPasswordField,
  PROPAGATION_NOTE,
  limitLabel,
  subscriptionsLabel,
} from './shared'

export interface LimitEditRequest {
  plan: PlanMatrixPlan
  limit: PlanMatrixLimit
  /** Valor sugerido (ao reverter); sem ele, o atual. */
  value?: number | null
  revertOf?: string
}

export function EditLimitDialog({
  request,
  onClose,
}: {
  request: LimitEditRequest | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [value, setValue] = useState('')
  const [unlimited, setUnlimited] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const currentValue = request
    ? (request.plan.limits[request.limit.key] ?? null)
    : null

  useEffect(() => {
    if (!request) return
    const initial = request.value ?? currentValue
    setUnlimited(initial === -1)
    setValue(initial === null || initial === -1 ? '' : String(initial))
    setPassword('')
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  const nextValue = unlimited ? -1 : value.trim() === '' ? NaN : Number(value)
  const valid =
    !!request &&
    (unlimited
      ? request.limit.allowUnlimited
      : Number.isInteger(nextValue) && nextValue >= request.limit.min)
  const changed = valid && nextValue !== currentValue
  const current = request?.plan.currentSubscriptions ?? 0
  const needsPassword = changed && current > 0
  const canConfirm =
    changed && !saving && (!needsPassword || password.trim().length > 0)

  const handleConfirm = async () => {
    if (!request || !changed) return
    setSaving(true)
    setError(null)
    try {
      const res = await savePlanLimit(request.plan.id, {
        limitKey: request.limit.key,
        value: nextValue,
        expectedAffected: current,
        password: needsPassword ? password : undefined,
        source: request.revertOf ? 'REVERT' : 'PANEL',
        revertOf: request.revertOf,
      })
      if (res.success) {
        toast.success(
          `${request.limit.name} do plano ${request.plan.name}: ${limitLabel(nextValue)}.`,
        )
        queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
        onClose()
        return
      }
      if (res.code === 'PREVIEW_CHANGED') {
        queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
      }
      setError(res.message || 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!request}
      onOpenChange={(open) => {
        if (!open && !saving) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <IconAdjustments size={22} className="text-[#FF4201]" />
            <span>
              {request?.limit.name} — plano {request?.plan.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 text-sm text-gray-600">
          <p>
            Hoje: <strong>{limitLabel(currentValue)}</strong>
            {request &&
              request.plan.defaults.limits[request.limit.key] !== undefined && (
                <>
                  {' '}
                  (padrão de fábrica:{' '}
                  {limitLabel(request.plan.defaults.limits[request.limit.key])})
                </>
              )}
          </p>
          <p className="text-xs text-gray-500">{request?.limit.detail}</p>

          <div className="space-y-1.5">
            <Label htmlFor="limit-value" className="text-sm text-gray-700">
              Novo valor
            </Label>
            <Input
              id="limit-value"
              type="number"
              min={request?.limit.min ?? 0}
              step={1}
              value={value}
              disabled={unlimited || saving}
              onChange={(event) => setValue(event.target.value)}
            />
            {request?.limit.allowUnlimited && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Checkbox
                  checked={unlimited}
                  onCheckedChange={(checked) => setUnlimited(checked === true)}
                  disabled={saving}
                />
                Ilimitado
              </label>
            )}
            {!valid && !unlimited && value !== '' && (
              <p className="text-xs text-error-700">
                Informe um número inteiro a partir de {request?.limit.min}.
              </p>
            )}
          </div>

          {changed && (
            <p>
              {current > 0
                ? `Vale na hora para as ${subscriptionsLabel(current)} do plano.`
                : 'O plano não tem assinaturas atuais: vale para as próximas contratações.'}
            </p>
          )}
          <p className="text-xs text-gray-500">{PROPAGATION_NOTE}</p>

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
            disabled={!canConfirm}
            isLoading={saving}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
