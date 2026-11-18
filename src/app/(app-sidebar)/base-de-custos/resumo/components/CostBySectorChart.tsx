'use client'

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import Link from 'next/link'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Types
import type { CostSummary } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

interface Props {
  sectors: CostSummary['bySector']
}

// Barras horizontais ordenadas: leitura mais direta de "onde está o meu custo"
// que uma pizza com oito fatias parecidas (areas/05-base-de-custos.md §8.1).
export function CostBySectorChart({ sectors }: Props) {
  const highest = sectors[0]?.value || 1

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>Custo por setor</CardTitle>
          <InfoHint title="Custo por setor">
            <p>
              Do maior para o menor.{' '}
              <Link
                href="/base-de-custos/por-setor"
                className="text-brand hover:underline"
              >
                {' '}
                Ver de onde vem cada valor{' '}
              </Link>
            </p>
          </InfoHint>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {sectors.map((sector) => (
          <div key={sector.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{sector.name}</span>
              <span className="text-sm text-gray-900">
                {formatCurrencyToBrl(sector.value)}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${sector.name}: ${formatCurrencyToBrl(sector.value)}`}
              className="h-2 w-full rounded-full bg-gray-100"
            >
              <div
                className="h-2 rounded-full bg-brand"
                style={{
                  width: `${Math.round((sector.value / highest) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
