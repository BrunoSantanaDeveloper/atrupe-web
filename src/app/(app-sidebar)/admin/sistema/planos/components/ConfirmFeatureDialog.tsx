'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconAlertTriangle, IconLoader } from '@tabler/icons-react'

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
import { fetchFeaturePreview, savePlanFeature } from '@/actions/planConfig'

import {
  EnforcementBadge,
  HISTORY_QUERY_KEY,
  MANAGEABLE_PLANS_QUERY_KEY,
  MATRIX_QUERY_KEY,
  ManagerPasswordField,
  PROPAGATION_NOTE,
  pluralize,
  subscriptionsLabel,
} from './shared'

export interface FeatureToggleRequest {
  planId: string
  planName: string
  featureKey: string
  featureName: string
  enabled: boolean
  /** Registro do histórico que está sendo revertido. */
  revertOf?: string
}

type Scope = '' | 'keep' | 'all'

/**
 * Confirmação de incluir ou retirar um recurso de um plano.
 *
 * Regras do PO (29/09/2026): ao RETIRAR, o superadmin responde se a
 * retirada atinge as assinaturas atuais do plano (se não, elas mantêm o
 * recurso e só as novas contratações ficam sem ele); a senha gerencial só é
 * pedida quando a alteração atinge assinaturas.
 */
export function ConfirmFeatureDialog({
  request,
  onClose,
}: {
  request: FeatureToggleRequest | null
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
  }, [request])

  const previewQuery = useQuery({
    queryKey: [
      'plan-feature-preview',
      request?.planId,
      request?.featureKey,
      request?.enabled,
    ],
    queryFn: async () => {
      const res = await fetchFeaturePreview(
        request!.planId,
        request!.featureKey,
        request!.enabled,
      )
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível calcular o efeito.')
      }
      return res.data
    },
    enabled: !!request,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  })
  const preview = previewQuery.data

  const removing = !!request && !request.enabled
  const current = preview?.currentSubscriptions ?? 0
  const needsChoice = !!preview?.requiresChoice
  // Quem é atingido: ao incluir, todas as atuais ganham o recurso; ao retirar,
  // só perdem se o superadmin escolher atingir as atuais.
  const affected: number | null = !preview
    ? null
    : !removing
      ? current
      : !needsChoice
        ? 0
        : scope === 'keep'
          ? 0
          : scope === 'all'
            ? current
            : null
  const needsPassword = (affected ?? 0) > 0
  const cascade = preview?.changes.filter((c) => c.cascade) ?? []

  const canConfirm =
    !!preview &&
    !preview.noChange &&
    !saving &&
    affected !== null &&
    (!needsPassword || password.trim().length > 0)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: MATRIX_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: MANAGEABLE_PLANS_QUERY_KEY })
  }

  const handleConfirm = async () => {
    if (!request || !preview || affected === null) return
    setSaving(true)
    setError(null)
    try {
      const res = await savePlanFeature(request.planId, {
        featureKey: request.featureKey,
        enabled: request.enabled,
        keepCurrentSubscriptions:
          removing && needsChoice ? scope === 'keep' : undefined,
        cascade: preview.requiresCascade,
        expectedAffected: affected,
        password: needsPassword ? password : undefined,
        source: request.revertOf ? 'REVERT' : 'PANEL',
        revertOf: request.revertOf,
      })

      if (res.success) {
        toast.success(
          successMessage(request, current, removing, scope, cascade.length),
        )
        invalidate()
        onClose()
        return
      }

      if (res.code === 'PREVIEW_CHANGED') {
        setScope('')
        await previewQuery.refetch()
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
      <DialogContent className="sm:max-w-[560px] bg-white p-6 rounded-xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
            <IconAlertTriangle size={22} className="text-[#FF4201]" />
            <span>
              {request?.enabled
                ? `Incluir recurso no plano ${request?.planName}`
                : `Retirar recurso do plano ${request?.planName}`}
            </span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-gray-900">{request?.featureName}</strong>
            {preview && (
              <EnforcementBadge
                level={preview.enforcement.level}
                detail={preview.enforcement.detail}
              />
            )}
          </div>

          {previewQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : previewQuery.isError ? (
            <p className="text-error-700">{previewQuery.error.message}</p>
          ) : preview?.noChange ? (
            <p>O plano já está assim. Nada a alterar.</p>
          ) : preview ? (
            <>
              {cascade.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                  <p className="font-medium">
                    {request?.enabled
                      ? 'Por dependência, também serão incluídos:'
                      : 'Por dependência, também serão retirados:'}
                  </p>
                  <ul className="mt-1 list-disc pl-5">
                    {cascade.map((c) => (
                      <li key={c.key}>{c.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!removing ? (
                <p>
                  {current > 0
                    ? `As ${subscriptionsLabel(current)} do plano passam a ter o recurso agora.`
                    : 'O plano não tem assinaturas atuais: vale para as próximas contratações.'}
                </p>
              ) : !needsChoice ? (
                <p>
                  O plano não tem assinaturas atuais: vale para as próximas
                  contratações.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-gray-900">
                    Esta retirada atinge as {subscriptionsLabel(current)} do
                    plano?
                  </p>
                  <RadioGroup
                    value={scope}
                    onValueChange={(value) => setScope(value as Scope)}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="keep" id="scope-keep" />
                      <Label
                        htmlFor="scope-keep"
                        className="font-normal leading-snug text-gray-700"
                      >
                        <strong>Não.</strong> As {subscriptionsLabel(current)}{' '}
                        mantêm o recurso; só as novas contratações ficam sem
                        ele.
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="all" id="scope-all" />
                      <Label
                        htmlFor="scope-all"
                        className="font-normal leading-snug text-gray-700"
                      >
                        <strong>Sim.</strong> Retirar também das{' '}
                        {subscriptionsLabel(current)}: elas perdem o acesso
                        agora.
                      </Label>
                    </div>
                  </RadioGroup>
                  {preview.courtesyGrants > 0 && (
                    <p className="text-xs text-gray-500">
                      {pluralize(
                        preview.courtesyGrants,
                        'empresa tem',
                        'empresas têm',
                      )}{' '}
                      este recurso por cortesia individual e continua
                      {preview.courtesyGrants === 1 ? '' : 'm'} com ele.
                    </p>
                  )}
                  {scope === 'all' && preview.retainedGrants > 0 && (
                    <p className="text-xs text-gray-500">
                      Inclui{' '}
                      {pluralize(
                        preview.retainedGrants,
                        'assinatura que mantinha',
                        'assinaturas que mantinham',
                      )}{' '}
                      o recurso de uma retirada anterior.
                    </p>
                  )}
                </div>
              )}

              {preview.enforcement.level !== 'api' && (
                <p className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  {preview.enforcement.level === 'tela'
                    ? 'Este recurso é bloqueado só na tela: '
                    : 'Este recurso ainda não muda nada no sistema: '}
                  {preview.enforcement.detail}
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
                Salvando...
              </span>
            ) : request?.enabled ? (
              'Incluir'
            ) : (
              'Retirar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function successMessage(
  request: FeatureToggleRequest,
  current: number,
  removing: boolean,
  scope: Scope,
  cascadeCount: number,
) {
  const extra =
    cascadeCount > 0
      ? ` (e ${pluralize(cascadeCount, 'recurso dependente', 'recursos dependentes')})`
      : ''
  if (!removing) {
    return `"${request.featureName}"${extra} incluído no plano ${request.planName}.`
  }
  if (current === 0) {
    return `"${request.featureName}"${extra} retirado do plano ${request.planName}.`
  }
  return scope === 'keep'
    ? `"${request.featureName}"${extra} retirado do plano ${request.planName}; as ${subscriptionsLabel(current)} mantêm o recurso.`
    : `"${request.featureName}"${extra} retirado do plano ${request.planName} e das ${subscriptionsLabel(current)}.`
}
