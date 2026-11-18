'use client'

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import Link from 'next/link'
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Components
import { EditParametersModal } from './EditParametersModal'
import { PermissionGate } from '@/components/common/PermissionGate'
import { LoadError } from '@/app/(app-sidebar)/base-de-custos/components/LoadError'

// Actions
import { getPricingSummary } from '@/actions/pricing'

// Hooks / Store / Consts
import { pricingGroupObj, pricingGroupPath } from '@/consts/pricing'
import { formatReferenceMonth } from '@/app/(app-sidebar)/base-de-custos/reference-month'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconPencil,
  IconChevronRight,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

const formatPercent = (value: number) =>
  `${(value / 10).toFixed(1).replace('.', ',')}%`

export function PricingSummaryView() {
  const [editing, setEditing] = useState(false)

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-summary'],
    queryFn: () => getPricingSummary(),
  })

  const summary = data?.data
  const parameters = summary?.parameters

  if (isLoading) {
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

  if (!summary || !parameters) {
    return (
      <Card>
        <LoadError message={data?.message} />
      </Card>
    )
  }

  const charges =
    parameters.taxation +
    parameters.commission +
    parameters.financialCost +
    parameters.desiredMargin
  // Com encargos e lucro em 100% ou mais não sobra custo: a barra não passa
  // do próprio tamanho
  const costShare = Math.max(1000 - charges, 0)
  const barTotal = Math.max(charges, 1000)
  const referenceMonth = formatReferenceMonth(summary.referenceMonth)

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
  // Os avisos levam ao primeiro grupo que tem o problema
  const belowCostGroup = summary.groups.find((group) => group.belowCost > 0)
  const pendingGroup = summary.groups.find((group) => group.pending > 0)

  return (
    <div className="space-y-5">
      {parameters.markup === null && (
        <Card className="p-4 flex items-center gap-3 border-warning-200 bg-warning-50">
          <Icon
            icon={IconAlertTriangle}
            size="md"
            className="text-warning-600 shrink-0"
          />
          <p className="text-sm text-gray-900">
            <span className="font-medium">
              Encargos e lucro somam 100% ou mais.
            </span>{' '}
            Não há markup que os pague: ajuste os parâmetros para o preço
            sugerido voltar a ser calculado.
          </p>
        </Card>
      )}

      {belowCostGroup && (
        <Link
          href={`${pricingGroupPath[belowCostGroup.group]}?status=BELOW_COST`}
        >
          <Card className="p-4 flex items-center gap-3 border-error-200 bg-error-25">
            <Icon
              icon={IconAlertTriangle}
              size="md"
              className="text-error-600 shrink-0"
            />
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
        <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <CardTitle>Parâmetros de referência</CardTitle>
              <InfoHint title="Parâmetros de referência">
                <p>
                  Usados para calcular o preço sugerido. O preço praticado pode
                  ser ajustado conforme o mercado.{' '}
                  {referenceMonth
                    ? ` Custo apurado até ${referenceMonth}.`
                    : ''}
                </p>
              </InfoHint>
            </div>
          </div>
          <PermissionGate permissions={['cost:pricing:edit']}>
            <Button
              type="button"
              variant="neutralOutline"
              className="shrink-0 self-start"
              LeftIcon={IconPencil}
              onClick={() => setEditing(true)}
            >
              Editar parâmetros
            </Button>
          </PermissionGate>
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
                {parameters.markup === null
                  ? '-'
                  : parameters.markup.toFixed(2).replace('.', ',')}
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
                  style={{ width: `${(band.value / barTotal) * 100}%` }}
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
            <div className="flex items-center gap-1.5">
              <CardTitle>Precificação por grupo</CardTitle>
              <InfoHint title="Precificação por grupo">
                <p>
                  O total de cada grupo é a soma dos itens com preço, dos
                  pendentes e dos que ainda não têm custo.
                </p>
              </InfoHint>
            </div>
          </div>
          {pendingGroup && (
            <Link
              href={`${pricingGroupPath[pendingGroup.group]}?status=PENDING`}
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
                        // Grupo sem item nenhum fica com a barra vazia
                        width: `${
                          group.total
                            ? Math.round((group.priced / group.total) * 100)
                            : 0
                        }%`,
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
                    {group.noCost > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray">Sem custo</span>
                        <span className="text-gray-900">{group.noCost}</span>
                      </div>
                    )}
                    {group.belowCost > 0 && (
                      <Badge variant="errorLight">
                        {group.belowCost} abaixo do custo
                      </Badge>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-brand flex items-center gap-1">
                    Ver detalhes <Icon icon={IconChevronRight} size="sm" />
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditParametersModal
        parameters={parameters}
        open={editing}
        onOpenChange={() => setEditing(false)}
      />
    </div>
  )
}
