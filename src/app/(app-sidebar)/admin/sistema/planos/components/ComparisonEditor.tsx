'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconPlus, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchPlanComparisonConfig,
  savePlanComparison,
} from '@/actions/planConfig'
import type {
  ComparisonPlanType,
  PlanComparisonGroup,
} from '@/types/planConfig'

import { HISTORY_QUERY_KEY } from './shared'

const COMPARISON_QUERY_KEY = ['admin-plan-comparison']

const PLAN_OPTIONS: { value: ComparisonPlanType; label: string }[] = [
  { value: 'START', label: 'Start' },
  { value: 'LITE', label: 'Lite' },
  { value: 'PRO', label: 'Pro' },
  { value: 'ELITE', label: 'Elite' },
  { value: 'FULL', label: 'Full' },
]

/**
 * A tabela "Compare todos os planos" da página de contratação: cada linha
 * entra no plano que a introduz e segue nos seguintes. Ela só aparece para o
 * cliente quando todos os planos estão liberados.
 */
export function ComparisonEditor() {
  const queryClient = useQueryClient()
  const [groups, setGroups] = useState<PlanComparisonGroup[]>([])
  const [saving, setSaving] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: COMPARISON_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchPlanComparisonConfig()
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Não foi possível carregar a tabela.')
      }
      return res.data
    },
  })

  useEffect(() => {
    if (data) setGroups(structuredClone(data.groups))
  }, [data])

  const changed =
    !!data && JSON.stringify(groups) !== JSON.stringify(data.groups)

  const updateGroup = (index: number, next: Partial<PlanComparisonGroup>) =>
    setGroups((current) =>
      current.map((g, i) => (i === index ? { ...g, ...next } : g)),
    )

  const updateRow = (
    groupIndex: number,
    rowIndex: number,
    next: Partial<PlanComparisonGroup['rows'][number]>,
  ) =>
    setGroups((current) =>
      current.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              rows: g.rows.map((r, j) =>
                j === rowIndex ? { ...r, ...next } : r,
              ),
            }
          : g,
      ),
    )

  const save = async () => {
    setSaving(true)
    try {
      const res = await savePlanComparison(groups)
      if (res.success) {
        toast.success('Tabela comparativa salva.')
        queryClient.invalidateQueries({ queryKey: COMPARISON_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY })
      } else {
        toast.error(res.message || 'Não foi possível salvar a tabela.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Tabela comparativa
          </h3>
          <p className="text-xs text-gray-500">
            &quot;Compare todos os planos e recursos&quot;, na página de
            contratação. Cada linha aparece a partir do plano escolhido. Ela só
            é exibida quando todos os planos estão liberados.
          </p>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : isError ? (
          <p className="text-sm text-error-700">{error.message}</p>
        ) : (
          <div className="space-y-5">
            {groups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="space-y-2 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    aria-label="Nome do grupo"
                    value={group.group}
                    maxLength={80}
                    onChange={(event) =>
                      updateGroup(groupIndex, { group: event.target.value })
                    }
                    className="font-semibold"
                  />
                  <Button
                    type="button"
                    size="iconSm"
                    variant="neutralGhost"
                    aria-label="Remover grupo"
                    onClick={() =>
                      setGroups((current) =>
                        current.filter((_, i) => i !== groupIndex),
                      )
                    }
                  >
                    <IconTrash aria-hidden />
                  </Button>
                </div>
                {group.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2 pl-3">
                    <Input
                      aria-label="Recurso"
                      value={row.label}
                      maxLength={200}
                      onChange={(event) =>
                        updateRow(groupIndex, rowIndex, {
                          label: event.target.value,
                        })
                      }
                    />
                    <Select
                      value={row.since}
                      onValueChange={(value) =>
                        updateRow(groupIndex, rowIndex, {
                          since: value as ComparisonPlanType,
                        })
                      }
                    >
                      <SelectTrigger className="w-40 flex-none bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            A partir do {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="iconSm"
                      variant="neutralGhost"
                      aria-label="Remover linha"
                      onClick={() =>
                        updateGroup(groupIndex, {
                          rows: group.rows.filter((_, j) => j !== rowIndex),
                        })
                      }
                    >
                      <IconTrash aria-hidden />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="neutralGhost"
                  className="ml-3 gap-1"
                  onClick={() =>
                    updateGroup(groupIndex, {
                      rows: [...group.rows, { label: '', since: 'START' }],
                    })
                  }
                >
                  <IconPlus aria-hidden />
                  Linha
                </Button>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                size="sm"
                variant="neutralOutline"
                className="gap-1"
                onClick={() =>
                  setGroups((current) => [
                    ...current,
                    { group: 'Novo grupo', rows: [] },
                  ])
                }
              >
                <IconPlus aria-hidden />
                Grupo
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="neutralGhost"
                  disabled={saving || !data}
                  onClick={() =>
                    data && setGroups(structuredClone(data.defaults))
                  }
                >
                  Voltar à tabela padrão
                </Button>
                <Button
                  type="button"
                  onClick={save}
                  disabled={!changed || saving}
                  isLoading={saving}
                >
                  Salvar tabela
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
