'use client'

import { useQuery } from '@tanstack/react-query'
import { IconCheck, IconMinus } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { fetchPlanComparison } from '@/actions/checkout'
import {
  COMPARISON_GROUPS,
  includesFeature,
  PLAN_SEQUENCE,
} from '@/lib/plans/methodTrail'
import type { PlanTrailItem } from '@/types/checkout'

interface Props {
  plans: PlanTrailItem[]
  currentPlanType?: string | null
}

const LABEL: Record<string, string> = {
  START: 'Start',
  LITE: 'Lite',
  PRO: 'Pro',
  ELITE: 'Elite',
  FULL: 'Full',
}

/**
 * A comparação só aparece com todas as etapas liberadas: enquanto houver
 * etapa "em breve", a tabela mostraria recursos de planos que ninguém consegue
 * contratar. O servidor manda o plano não liberado sem preço.
 */
export function allPlansReleased(plans: PlanTrailItem[]) {
  return plans.length > 0 && plans.every((p) => p.priceMonthlyCents !== null)
}

/**
 * A "escada" do Método: cada recurso entra na etapa que o introduz e
 * permanece nas seguintes. Recolhida por padrão, para não competir com a
 * oferta; rola dentro do próprio contêiner em tela estreita.
 */
export function ComparisonTable({ plans, currentPlanType }: Props) {
  // A tabela é editada no painel de planos; sem resposta, vale a do código.
  const { data: groups } = useQuery({
    queryKey: ['plan-comparison'],
    queryFn: async () => {
      const res = await fetchPlanComparison()
      return res.success && res.data?.length ? res.data : COMPARISON_GROUPS
    },
    staleTime: 5 * 60 * 1000,
  })
  const columns = PLAN_SEQUENCE.filter((t) =>
    plans.some((p) => p.planType === t),
  )

  return (
    <details className="group rounded-xl border bg-white">
      <summary className="cursor-pointer select-none px-6 py-4 font-semibold text-gray-800">
        Compare todos os planos e recursos
      </summary>
      <div className="overflow-x-auto px-6 pb-6">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-left font-medium text-gray-600">
                Recurso
              </th>
              {columns.map((t) => (
                <th
                  key={t}
                  className={cn(
                    'py-3 text-center font-semibold text-gray-800',
                    t === currentPlanType && 'bg-brand-50 text-brand-800',
                  )}
                >
                  {LABEL[t]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(groups ?? COMPARISON_GROUPS).map((group) => (
              <FragmentGroup
                key={group.group}
                group={group}
                columns={columns}
                currentPlanType={currentPlanType}
              />
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-gray-500">
          Cada etapa exige a anterior em operação: não é possível pular etapas.
        </p>
      </div>
    </details>
  )
}

function FragmentGroup({
  group,
  columns,
  currentPlanType,
}: {
  group: (typeof COMPARISON_GROUPS)[number]
  columns: string[]
  currentPlanType?: string | null
}) {
  return (
    <>
      <tr>
        <td
          colSpan={columns.length + 1}
          className="pt-5 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          {group.group}
        </td>
      </tr>
      {group.rows.map((row) => (
        <tr key={row.label} className="border-b last:border-0">
          <td className="py-2 pr-4 text-gray-700">{row.label}</td>
          {columns.map((t) => (
            <td
              key={t}
              className={cn(
                'py-2 text-center',
                t === currentPlanType && 'bg-brand-50',
              )}
            >
              {includesFeature(t, row.since) ? (
                <IconCheck
                  size={18}
                  className="mx-auto text-brand-600"
                  aria-label="Incluído"
                />
              ) : (
                <IconMinus
                  size={18}
                  className="mx-auto text-gray-300"
                  aria-label="Não incluído"
                />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
