'use client'

import { useState } from 'react'
import { IconPencil } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'

import { EditLimitDialog, type LimitEditRequest } from './EditLimitDialog'
import { usePlanMatrix } from './FeatureMatrix'
import { InfoHint, limitLabel, subscriptionsLabel } from './shared'

/** Os limites de cada plano (usuários, empresas, dias de teste). */
export function LimitsMatrix() {
  const { data, isLoading, isError, error } = usePlanMatrix()
  const [request, setRequest] = useState<LimitEditRequest | null>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        Clique no valor para alterar. O limite de usuários soma os usuários
        adicionais contratados em cada assinatura; &quot;ilimitado&quot; não tem
        teto.
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-error-700">{error.message}</p>
          ) : data ? (
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="min-w-[260px] p-3 font-semibold">Limite</th>
                  {data.plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="min-w-[110px] p-3 text-center font-semibold"
                    >
                      <div className="text-gray-900">{plan.name}</div>
                      <div className="text-xs font-normal text-gray-500">
                        {subscriptionsLabel(plan.currentSubscriptions)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.limits.map((limit) => (
                  <tr key={limit.key} className="hover:bg-gray-50/50">
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-1.5 font-medium text-gray-900">
                        {limit.name}
                        <InfoHint>{limit.detail}</InfoHint>
                      </div>
                      {!limit.enforced && (
                        <Badge variant="neutralLight" className="mt-1">
                          Informativo
                        </Badge>
                      )}
                    </td>
                    {data.plans.map((plan) => {
                      const value = plan.limits[limit.key] ?? null
                      const defaultValue = plan.defaults.limits[limit.key]
                      const differs =
                        defaultValue !== undefined && value !== defaultValue
                      return (
                        <td key={plan.id} className="p-3 text-center align-top">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-gray-800 hover:bg-gray-100"
                            onClick={() => setRequest({ plan, limit })}
                            aria-label={`Alterar ${limit.name} do plano ${plan.name}`}
                          >
                            {limitLabel(value)}
                            <Icon
                              icon={IconPencil}
                              size="sm"
                              className="text-gray-400"
                            />
                          </button>
                          {differs && (
                            <div className="text-xs text-amber-600">
                              padrão: {limitLabel(defaultValue)}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </CardContent>
      </Card>

      <EditLimitDialog request={request} onClose={() => setRequest(null)} />
    </div>
  )
}
