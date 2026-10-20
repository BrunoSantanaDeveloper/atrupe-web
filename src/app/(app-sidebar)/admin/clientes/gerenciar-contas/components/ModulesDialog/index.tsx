'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconStack2 } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { fetchCompanyFeatures, saveCompanyFeature } from '@/actions/planConfig'
import type {
  CompanyFeatureState,
  CompanyFeaturesView,
} from '@/types/planConfig'

import type { AccountItem } from '../Table/Data'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

type Feature = CompanyFeaturesView['features'][number]

const STATE_BADGE: Record<
  CompanyFeatureState,
  {
    label: string
    variant:
      | 'successLight'
      | 'blueLight'
      | 'purpleLight'
      | 'warningLight'
      | 'neutralLight'
  }
> = {
  PLAN: { label: 'Do plano', variant: 'successLight' },
  RETAINED: { label: 'Mantido do plano', variant: 'blueLight' },
  COURTESY: { label: 'Cortesia', variant: 'purpleLight' },
  EXPIRED: { label: 'Cortesia vencida', variant: 'warningLight' },
  OFF: { label: 'Sem acesso', variant: 'neutralLight' },
}

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

/**
 * Recursos da conta (Gerenciar contas › Recursos): o que vem do plano, o que
 * foi mantido quando o recurso saiu do plano e as cortesias individuais. O
 * superadmin concede ou retira cortesia com motivo, validade opcional e a
 * senha gerencial. Módulos pagos (Nota Fiscal) seguem pelo fluxo de
 * assinatura, não por aqui.
 */
export function ModulesDialog({ open, setOpen, rowData }: Props) {
  const [action, setAction] = useState<{
    feature: Feature
    enabled: boolean
  } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    enabled: open && !!rowData?.id,
    queryKey: ['company-features', rowData?.id],
    queryFn: async () => {
      const res = await fetchCompanyFeatures(rowData!.id)
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível carregar.')
      }
      return res.data
    },
  })

  const groups = useMemo(() => {
    const result: { label: string; features: Feature[] }[] = []
    for (const feature of data?.features ?? []) {
      const label = feature.categoryLabel || 'Outros'
      const group = result.find((g) => g.label === label)
      if (group) group.features.push(feature)
      else result.push({ label, features: [feature] })
    }
    return result
  }, [data?.features])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
          <DialogHeader>
            <FeaturedIcon Icon={IconStack2} variant="light" rounded />
            <div>
              <DialogTitle>Recursos da conta</DialogTitle>
              <DialogDescription>
                {rowData?.companyName}
                {data?.subscription
                  ? ` — plano ${data.subscription.planName}`
                  : ''}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4 text-sm">
            <p className="text-gray-600">
              A composição de cada plano fica em Sistema › Planos. Aqui você vê
              o que esta conta tem e pode dar ou retirar um recurso como
              cortesia, só para ela.
            </p>

            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : isError ? (
              <p className="text-error-700">{error.message}</p>
            ) : !data?.subscription ? (
              <p className="text-gray-600">
                A conta não tem assinatura ativa: não há recursos a configurar.
              </p>
            ) : (
              <table className="w-full border-collapse text-left">
                <tbody className="divide-y divide-gray-100">
                  {groups.map((group) => (
                    <Fragment key={group.label}>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="type-eyebrow px-3 py-2">
                          {group.label}
                        </td>
                      </tr>
                      {group.features.map((feature) => {
                        const badge = STATE_BADGE[feature.state]
                        return (
                          <tr key={feature.key} className="align-top">
                            <td className="p-3">
                              <div className="font-medium text-gray-900">
                                {feature.name}
                              </div>
                              {feature.grant?.reason &&
                                feature.state !== 'PLAN' && (
                                  <div className="text-xs text-gray-500">
                                    {feature.grant.reason}
                                    {feature.grant.expiresAt
                                      ? ` · até ${formatDay(feature.grant.expiresAt)}`
                                      : ''}
                                  </div>
                                )}
                            </td>
                            <td className="p-3">
                              <Badge variant={badge.variant}>
                                {badge.label}
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              {feature.state ===
                              'PLAN' ? null : feature.state === 'RETAINED' ||
                                feature.state === 'COURTESY' ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="neutralOutline"
                                  onClick={() =>
                                    setAction({ feature, enabled: false })
                                  }
                                >
                                  Retirar
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="neutralOutline"
                                  onClick={() =>
                                    setAction({ feature, enabled: true })
                                  }
                                >
                                  Conceder
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>

      <CourtesyDialog
        companyId={rowData?.id ?? null}
        companyName={rowData?.companyName ?? ''}
        action={action}
        onClose={() => setAction(null)}
      />
    </>
  )
}

function CourtesyDialog({
  companyId,
  companyName,
  action,
  onClose,
}: {
  companyId: string | null
  companyName: string
  action: { feature: Feature; enabled: boolean } | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setReason('')
    setExpiresAt('')
    setPassword('')
    setError(null)
  }, [action])

  const granting = !!action?.enabled
  const canConfirm =
    !!action &&
    !saving &&
    password.trim().length > 0 &&
    (!granting || reason.trim().length > 0)

  const handleConfirm = async () => {
    if (!action || !companyId) return
    setSaving(true)
    setError(null)
    try {
      const res = await saveCompanyFeature(companyId, {
        featureKey: action.feature.key,
        enabled: action.enabled,
        reason: granting ? reason.trim() : undefined,
        expiresAt: granting && expiresAt ? expiresAt : undefined,
        password,
      })
      if (res.success) {
        toast.success(
          granting
            ? `Cortesia concedida: "${action.feature.name}" para ${companyName}.`
            : `"${action.feature.name}" retirado de ${companyName}.`,
        )
        queryClient.invalidateQueries({
          queryKey: ['company-features', companyId],
        })
        onClose()
        return
      }
      setError(res.message || 'Não foi possível salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={!!action}
      onOpenChange={(open) => {
        if (!open && !saving) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {granting ? 'Conceder cortesia' : 'Retirar recurso'}
          </DialogTitle>
          <DialogDescription>
            {action?.feature.name} — {companyName}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4 text-sm text-gray-600">
          {granting ? (
            <>
              <p>
                A conta passa a ter o recurso agora, sem cobrança, mesmo que o
                plano não o inclua. A cortesia segue com a conta se ela evoluir
                de plano.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="courtesy-reason">Motivo</Label>
                <Textarea
                  id="courtesy-reason"
                  value={reason}
                  maxLength={300}
                  placeholder="Ex.: parceria de lançamento, compensação por falha"
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="courtesy-expires">Válida até (opcional)</Label>
                <Input
                  id="courtesy-expires"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </div>
            </>
          ) : (
            <p>
              A conta perde o acesso agora
              {action?.feature.state === 'RETAINED'
                ? ' (o recurso tinha sido mantido quando saiu do plano).'
                : '.'}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="courtesy-password">Senha gerencial</Label>
            <Input
              id="courtesy-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

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
            {granting ? 'Conceder' : 'Retirar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
