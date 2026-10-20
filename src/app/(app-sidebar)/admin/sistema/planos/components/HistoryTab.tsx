'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconArrowBackUp } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPlanConfigHistory } from '@/actions/planConfig'
import type { PlanConfigHistoryEntry } from '@/types/planConfig'

import {
  ConfirmFeatureDialog,
  type FeatureToggleRequest,
} from './ConfirmFeatureDialog'
import { EditLimitDialog, type LimitEditRequest } from './EditLimitDialog'
import { usePlanMatrix } from './FeatureMatrix'
import { HISTORY_QUERY_KEY } from './shared'

const PAGE_SIZE = 20

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  })

/**
 * Quem mudou o quê na configuração dos planos. "Reverter" abre a mesma
 * confirmação de uma alteração nova, no sentido contrário — com a mesma
 * pergunta sobre as assinaturas atuais e a mesma regra da senha.
 */
export function HistoryTab() {
  const [planId, setPlanId] = useState('all')
  const [page, setPage] = useState(1)
  const [featureRequest, setFeatureRequest] =
    useState<FeatureToggleRequest | null>(null)
  const [limitRequest, setLimitRequest] = useState<LimitEditRequest | null>(
    null,
  )
  const { data: matrix } = usePlanMatrix()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...HISTORY_QUERY_KEY, planId, page],
    queryFn: async () => {
      const res = await fetchPlanConfigHistory({
        planId: planId === 'all' ? undefined : planId,
        page,
        limit: PAGE_SIZE,
      })
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível carregar.')
      }
      return res.data
    },
  })

  const planOf = (entry: PlanConfigHistoryEntry) =>
    matrix?.plans.find((p) => p.id === entry.planId)

  const canRevert = (entry: PlanConfigHistoryEntry) =>
    !!matrix &&
    !!planOf(entry) &&
    ((entry.entityType === 'PLAN_FEATURE' &&
      typeof entry.changes?.before?.enabled === 'boolean' &&
      matrix.features.some((f) => f.key === entry.featureKey)) ||
      (entry.entityType === 'PLAN_LIMIT' &&
        entry.changes?.before?.value !== undefined &&
        entry.changes?.before?.value !== null &&
        matrix.limits.some((l) => l.key === entry.limitKey)))

  const revert = (entry: PlanConfigHistoryEntry) => {
    const plan = planOf(entry)
    if (!matrix || !plan) return
    if (entry.entityType === 'PLAN_FEATURE') {
      const feature = matrix.features.find((f) => f.key === entry.featureKey)
      if (!feature) return
      setFeatureRequest({
        planId: plan.id,
        planName: plan.name,
        featureKey: feature.key,
        featureName: feature.name,
        enabled: !!entry.changes?.before?.enabled,
        revertOf: entry.id,
      })
      return
    }
    const limit = matrix.limits.find((l) => l.key === entry.limitKey)
    if (!limit) return
    setLimitRequest({
      plan,
      limit,
      value: entry.changes?.before?.value ?? null,
      revertOf: entry.id,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={planId}
          onValueChange={(value) => {
            setPlanId(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-56 bg-white">
            <SelectValue placeholder="Plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            {(matrix?.plans ?? []).map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Reverter aplica o estado anterior como uma alteração nova, que também
          fica registrada.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isError ? (
            <p className="p-6 text-sm text-error-700">{error.message}</p>
          ) : !data?.data.length ? (
            <p className="p-6 text-sm text-gray-500">
              Nenhuma alteração registrada ainda.
            </p>
          ) : (
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                  <th className="p-3 font-semibold">Quando</th>
                  <th className="p-3 font-semibold">Plano</th>
                  <th className="p-3 font-semibold">O que mudou</th>
                  <th className="p-3 font-semibold">Quem</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((entry) => (
                  <tr key={entry.id} className="align-top text-gray-700">
                    <td className="whitespace-nowrap p-3 text-gray-500">
                      {formatWhen(entry.createdAt)}
                    </td>
                    <td className="whitespace-nowrap p-3">
                      {planOf(entry)?.name ?? entry.planType ?? '—'}
                    </td>
                    <td className="p-3">{entry.description}</td>
                    <td className="whitespace-nowrap p-3">
                      {entry.createdByName ?? '—'}
                    </td>
                    <td className="p-3 text-right">
                      {canRevert(entry) && (
                        <Button
                          type="button"
                          size="sm"
                          variant="neutralOutline"
                          className="gap-1"
                          onClick={() => revert(entry)}
                        >
                          <IconArrowBackUp aria-hidden />
                          Reverter
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {data && data.lastPage > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
          <Button
            type="button"
            size="sm"
            variant="neutralOutline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {data.page} de {data.lastPage}
          </span>
          <Button
            type="button"
            size="sm"
            variant="neutralOutline"
            disabled={page >= data.lastPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      <ConfirmFeatureDialog
        request={featureRequest}
        onClose={() => setFeatureRequest(null)}
      />
      <EditLimitDialog
        request={limitRequest}
        onClose={() => setLimitRequest(null)}
      />
    </div>
  )
}
