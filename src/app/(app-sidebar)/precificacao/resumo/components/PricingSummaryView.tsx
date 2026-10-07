'use client'

// React / Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Actions
import { getPricingSummary } from '@/actions/pricing'

// Hooks / Store / Consts
import { pricingGroupObj, pricingGroupPath } from '@/consts/pricing'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react'

const formatPercent = (value: number) =>
  `${(value / 10).toFixed(1).replace('.', ',')}%`

const formatReferenceMonth = (month?: string) => {
  if (!month) return ''

  const [year, monthNumber] = month.split('-').map(Number)

  return new Date(year, monthNumber - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(' de ', '/')
}

export function PricingSummaryView() {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-summary'],
    queryFn: () => getPricingSummary(),
  })

  const summary = data?.data
  const parameters = summary?.parameters

  if (isLoading || !summary || !parameters) {
    // Primeira carga no formato final: títulos reais e blocos no lugar dos
    // cartões (design/openspec/changes/archive/2026-10-07-microinteracoes)
    return (
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros de referência</CardTitle>
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-[120px] rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Precificação por grupo</CardTitle>
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-[180px] rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const charges =
    parameters.taxation +
    parameters.commission +
    parameters.financialCost +
    parameters.desiredMargin
  const costShare = 1000 - charges

  const bands = [
    { label: 'Custo', value: costShare, className: 'bg-gray-400' },
    { label: 'Tributação', value: parameters.taxation, className: 'bg-blue' },
    { label: 'Comissão', value: parameters.commission, className: 'bg-orange' },
    {
      label: 'Custo financeiro',
      value: parameters.financialCost,
      className: 'bg-indigo',
    },
    {
      label: 'Margem',
      value: parameters.desiredMargin,
      className: 'bg-brand',
    },
  ]

  const parameterCards = [
    {
      label: 'Tributação de referência',
      value: parameters.taxation,
      description: 'Alíquota total considerada para seus produtos e serviços.',
    },
    {
      label: 'Comissão de referência',
      value: parameters.commission,
      description: 'Percentual médio de comissão considerado.',
    },
    {
      label: 'Custo financeiro de referência',
      value: parameters.financialCost,
      description: 'Custo das formas de pagamento, taxas e antecipações.',
    },
    {
      label: 'Margem desejada',
      value: parameters.desiredMargin,
      description: 'Margem de lucro que você deseja obter.',
    },
  ]

  const belowCost = summary.groups.reduce(
    (total, group) => total + group.belowCost,
    0,
  )
  const pending = summary.groups.reduce(
    (total, group) => total + group.pending,
    0,
  )

  return (
    <div className="space-y-5">
      {belowCost > 0 && (
        <Link href="/precificacao/produtos?status=BELOW_COST">
          <Card className="p-4 flex items-center gap-3 border-error-200 bg-error-25">
            <IconAlertTriangle className="size-5 text-error-600 shrink-0" />
            <p className="text-sm text-gray-900">
              <span className="font-medium">
                {belowCost} {belowCost === 1 ? 'item está' : 'itens estão'}{' '}
                sendo vendido{belowCost === 1 ? '' : 's'} abaixo do custo.
              </span>{' '}
              Ver quais.
            </p>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de referência</CardTitle>
          <CardDescription>
            Usados para calcular o preço sugerido. O preço praticado pode ser
            ajustado conforme o mercado. Custo apurado até{' '}
            {formatReferenceMonth(summary.referenceMonth)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {parameterCards.map((card) => (
              <Card key={card.label} className="p-4 rounded-xl">
                <p className="text-xs text-gray">{card.label}</p>
                <p className="text-display-xs font-semibold text-gray-900">
                  {formatPercent(card.value)}
                </p>
                <p className="text-xs text-gray mt-1">{card.description}</p>
              </Card>
            ))}
            <Card className="p-4 rounded-xl bg-success-25 border-success-200">
              <p className="text-xs text-gray">Markup de referência</p>
              <p className="text-display-xs font-semibold text-gray-900">
                {parameters.markup.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-xs text-gray mt-1">
                Inclui a margem desejada. É o valor usado para o preço sugerido
                em todos os grupos.
              </p>
            </Card>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Composição do preço sugerido
              </p>
              <p className="text-sm text-gray">
                Custo {formatPercent(costShare)} + encargos{' '}
                {formatPercent(charges)}
              </p>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {bands.map((band) => (
                <div
                  key={band.label}
                  role="img"
                  aria-label={`${band.label}: ${formatPercent(band.value)}`}
                  className={band.className}
                  style={{ width: `${band.value / 10}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {bands.map((band) => (
                <span
                  key={band.label}
                  className="text-xs text-gray flex items-center gap-1.5"
                >
                  <span className={`size-2 rounded-full ${band.className}`} />
                  {band.label} · {formatPercent(band.value)}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Precificação por grupo</CardTitle>
            <CardDescription>
              O total de cada grupo é a soma dos itens com preço e dos
              pendentes.
            </CardDescription>
          </div>
          {pending > 0 && (
            <Link
              href="/precificacao/materiais?status=PENDING"
              className="text-sm text-brand hover:underline"
            >
              {pending} {pending === 1 ? 'item pendente' : 'itens pendentes'}
            </Link>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.groups.map((group) => (
              <Link key={group.group} href={pricingGroupPath[group.group]}>
                <Card className="p-5 rounded-xl h-full hover:border-gray-300">
                  <p className="text-sm text-gray">
                    {pricingGroupObj[group.group]}
                  </p>
                  <p className="text-display-xs font-semibold text-gray-900">
                    {group.total}
                  </p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full bg-brand"
                      style={{
                        width: `${Math.round((group.priced / group.total) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray">Com preço</span>
                      <span className="text-gray-900">{group.priced}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray">Pendentes</span>
                      <span className="text-gray-900">{group.pending}</span>
                    </div>
                    {group.belowCost > 0 && (
                      <Badge variant="errorLight">
                        {group.belowCost} abaixo do custo
                      </Badge>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-brand flex items-center gap-1">
                    Ver detalhes <IconChevronRight className="size-4" />
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
