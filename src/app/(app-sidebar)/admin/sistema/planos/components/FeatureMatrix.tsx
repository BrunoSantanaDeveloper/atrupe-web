'use client'

import { Fragment, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconRestore } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { fetchPlanMatrix } from '@/actions/planConfig'
import type { PlanMatrix, PlanMatrixPlan } from '@/types/planConfig'

import {
  ConfirmFeatureDialog,
  type FeatureToggleRequest,
} from './ConfirmFeatureDialog'
import { RestoreDefaultsDialog } from './RestoreDefaultsDialog'
import {
  EnforcementBadge,
  InfoHint,
  MATRIX_QUERY_KEY,
  PROPAGATION_NOTE,
  subscriptionsLabel,
} from './shared'

export function usePlanMatrix() {
  return useQuery({
    queryKey: MATRIX_QUERY_KEY,
    queryFn: async (): Promise<PlanMatrix> => {
      const res = await fetchPlanMatrix()
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível carregar os planos.')
      }
      return res.data
    },
  })
}

/**
 * A matriz recurso × plano: o superadmin decide o que cada plano inclui, sem
 * deploy. Módulos pagos (como a Nota Fiscal) não entram aqui.
 */
export function FeatureMatrix() {
  const { data, isLoading, isError, error } = usePlanMatrix()
  const [request, setRequest] = useState<FeatureToggleRequest | null>(null)
  const [restorePlan, setRestorePlan] = useState<PlanMatrixPlan | null>(null)

  const groups = useMemo(() => {
    const result: { label: string; features: PlanMatrix['features'] }[] = []
    for (const feature of data?.features ?? []) {
      const label = feature.categoryLabel || 'Outros'
      const group = result.find((g) => g.label === label)
      if (group) group.features.push(feature)
      else result.push({ label, features: [feature] })
    }
    return result
  }, [data?.features])

  const featureName = (key: string) =>
    data?.features.find((f) => f.key === key)?.name ?? key

  return (
    <div className="space-y-4">
      <div className="space-y-1 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p>
          Ligue ou desligue cada recurso por plano. Incluir vale na hora para as
          assinaturas do plano; ao retirar, você escolhe se atinge as
          assinaturas atuais ou só as novas contratações. A senha gerencial é
          pedida quando a alteração atinge assinaturas.
        </p>
        <p className="text-xs text-gray-500">
          {PROPAGATION_NOTE} Módulos pagos, como a Nota Fiscal, não entram na
          matriz.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-500">
          <span>Onde o recurso é bloqueado quando o plano não o inclui:</span>
          <EnforcementBadge
            level="api"
            detail="O servidor recusa (403) e a tela esconde."
          />
          <EnforcementBadge
            level="tela"
            detail="Só a tela esconde: é exibição, ou não há API a proteger."
          />
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-error-700">{error.message}</p>
          ) : data ? (
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="sticky left-0 z-10 min-w-[320px] bg-gray-50 p-3 font-semibold">
                    Recurso
                  </th>
                  {data.plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="min-w-[120px] p-3 text-center align-top font-semibold"
                    >
                      <div className="text-gray-900">{plan.name}</div>
                      <div className="text-[11px] font-normal text-gray-500">
                        {subscriptionsLabel(plan.currentSubscriptions)}
                      </div>
                      {!plan.isActive && plan.planType !== 'TRIAL' && (
                        <div className="text-[11px] font-normal text-amber-600">
                          Em breve
                        </div>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="neutralGhost"
                        className="mt-1 h-7 gap-1 px-2 text-[11px]"
                        onClick={() => setRestorePlan(plan)}
                      >
                        <IconRestore size={14} />
                        Restaurar padrão
                      </Button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {groups.map((group) => (
                  <Fragment key={group.label}>
                    <tr className="bg-gray-100">
                      <td
                        colSpan={data.plans.length + 1}
                        className="sticky left-0 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature.key} className="hover:bg-gray-50/50">
                        <td className="sticky left-0 z-10 bg-white p-3 align-top">
                          <div className="flex items-center gap-1.5 font-medium text-gray-900">
                            {feature.name}
                            {feature.description && (
                              <InfoHint>{feature.description}</InfoHint>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <EnforcementBadge
                              level={feature.enforcement.level}
                              detail={feature.enforcement.detail}
                            />
                            {feature.dependsOn.length > 0 && (
                              <Badge variant="neutralLight">
                                Exige:{' '}
                                {feature.dependsOn.map(featureName).join(', ')}
                              </Badge>
                            )}
                          </div>
                        </td>
                        {data.plans.map((plan) => {
                          const enabled = !!plan.features[feature.key]
                          const isDefault = plan.defaults.features.includes(
                            feature.key,
                          )
                          return (
                            <td
                              key={plan.id}
                              className="p-3 text-center align-top"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <Switch
                                  intent="success"
                                  checked={enabled}
                                  onCheckedChange={(next) =>
                                    setRequest({
                                      planId: plan.id,
                                      planName: plan.name,
                                      featureKey: feature.key,
                                      featureName: feature.name,
                                      enabled: next,
                                    })
                                  }
                                  aria-label={`${feature.name} no plano ${plan.name}`}
                                />
                                {enabled !== isDefault && (
                                  <span className="text-[10px] text-amber-600">
                                    fora do padrão
                                  </span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          ) : null}
        </CardContent>
      </Card>

      <ConfirmFeatureDialog
        request={request}
        onClose={() => setRequest(null)}
      />
      <RestoreDefaultsDialog
        plan={restorePlan}
        onClose={() => setRestorePlan(null)}
      />
    </div>
  )
}
