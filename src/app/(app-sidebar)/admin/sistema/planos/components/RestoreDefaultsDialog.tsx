'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconLoader, IconRestore } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchPlanDefaultsDiff,
  restorePlanDefaults,
} from '@/actions/planConfig'
import type { PlanMatrixPlan } from '@/types/planConfig'

import {
  HISTORY_QUERY_KEY,
  MATRIX_QUERY_KEY,
  ManagerPasswordField,
  PROPAGATION_NOTE,
  limitLabel,
  subscriptionsLabel,
} from './shared'

type Scope = '' | 'keep' | 'all'

/** Volta a composição do plano ao padrão de fábrica (o que está no código). */
export function RestoreDefaultsDialog({
  plan,
  onClose,
}: {
  plan: PlanMatrixPlan | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [scope, setScope] = useState<Scope>('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setScope('')
    setPassword('')
    setError(null)
  }, [plan])

  const diffQuery = useQuery({
    queryKey: ['plan-defaults-diff', plan?.id],
    queryFn: async () => {
      const res = await fetchPlanDefaultsDiff(plan!.id)
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível comparar.')
      }
      return res.data
    },
    enabled: !!plan,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })
  const diff = diffQuery.data

  const current = diff?.currentSubscriptions ?? 0
  const touchesEveryone =
    !!diff &&
    (diff.enable.length > 0 ||
      diff.limits.length > 0 ||
      (diff.disable.length > 0 && scope === 'all'))
  const affected: number | null = !diff
    ? null
    : diff.requiresChoice && !scope
      ? null
      : touchesEveryone
        ? current
        : 0
  const needsPassword = (affected ?? 0) > 0
  const canConfirm =
    !!diff &&
    !diff.noChange &&
    !saving &&
    affected !== null &&
    (!needsPassword || password.trim().length > 0)

  const handleConfirm = async () => {
    if (!plan || !diff || affected === null) return
    setSaving(true)
    setError(null)
    try {
      const res = await restorePlanDefaults(plan.id, {
        keepCurrentSubscriptions: diff.requiresChoice
          ? scope === 'keep'
          : undefined,
        expectedAffected: affected,
        password: needsPassword ? password : undefined,
      })
      if (res.success) {
        toast.success(`Padrão restaurado no plano ${plan.name}.`)
        queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
        onClose()
        return
      }
      if (res.code === 'PREVIEW_CHANGED') {
        setScope('')
        await diffQuery.refetch()
      }
      setError(res.message || 'Não foi possível restaurar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!plan}
      onOpenChange={(open) => {
        if (!open && !saving) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[560px] bg-white p-6 rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
            <IconRestore size={22} className="text-[#FF4201]" />
            <span>Restaurar o padrão do plano {plan?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 text-sm text-gray-600">
          {diffQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : diffQuery.isError ? (
            <p className="text-error-700">{diffQuery.error.message}</p>
          ) : diff?.noChange ? (
            <p>O plano já está no padrão de fábrica. Nada a alterar.</p>
          ) : diff ? (
            <>
              <p>
                O padrão de fábrica é a composição definida no código. Voltar a
                ele faz estas mudanças:
              </p>
              {diff.enable.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900">Incluir</p>
                  <ul className="list-disc pl-5">
                    {diff.enable.map((f) => (
                      <li key={f.key}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diff.disable.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900">Retirar</p>
                  <ul className="list-disc pl-5">
                    {diff.disable.map((f) => (
                      <li key={f.key}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diff.limits.length > 0 && (
                <div>
                  <p className="font-medium text-gray-900">Limites</p>
                  <ul className="list-disc pl-5">
                    {diff.limits.map((l) => (
                      <li key={l.key}>
                        {l.name}: {limitLabel(l.value)} →{' '}
                        {limitLabel(l.defaultValue)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {diff.requiresChoice && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    A retirada atinge as {subscriptionsLabel(current)} do plano?
                  </p>
                  <RadioGroup
                    value={scope}
                    onValueChange={(value) => setScope(value as Scope)}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="keep" id="restore-keep" />
                      <Label
                        htmlFor="restore-keep"
                        className="font-normal leading-snug text-gray-700"
                      >
                        <strong>Não.</strong> As assinaturas atuais mantêm os
                        recursos retirados.
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="all" id="restore-all" />
                      <Label
                        htmlFor="restore-all"
                        className="font-normal leading-snug text-gray-700"
                      >
                        <strong>Sim.</strong> Retirar também das assinaturas
                        atuais.
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {current > 0 &&
                (diff.enable.length > 0 || diff.limits.length > 0) && (
                  <p>
                    Os recursos incluídos e os limites valem na hora para as{' '}
                    {subscriptionsLabel(current)}.
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
            </>
          ) : null}

          {error && (
            <p className="text-sm text-error-700" role="alert">
              {error}
            </p>
          )}
        </DialogBody>

        <DialogFooter className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            {saving ? (
              <span className="flex items-center gap-1">
                <IconLoader size={16} className="animate-spin" />
                Restaurando...
              </span>
            ) : (
              'Restaurar padrão'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
