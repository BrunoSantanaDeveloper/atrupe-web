'use client'

/**
 * RankingBarChart
 *
 * Barra horizontal de ranking (produtos mais vendidos, melhores clientes).
 *
 * Dois defeitos de texto que este componente existe para não repetir:
 * - nome do eixo quebrado em várias linhas sobrepostas (o eixo tinha 80px):
 *   o tick é uma <text> própria, numa linha, truncada POR LARGURA MEDIDA com a
 *   fonte real — contar caracteres não serve para fonte proporcional, ver
 *   ranking-chart-layout.ts;
 * - valor da ponta quebrado em "R$ / 1,2 / mil" nas barras curtas: o LabelList
 *   do recharts entrega ao <Text> uma largura derivada da barra, e o <Text>
 *   quebra palavra por palavra para caber. O valor também é uma <text> própria.
 *
 * A altura acompanha o número de itens, e o valor fica impresso na ponta da
 * barra para não depender do hover.
 */

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartConfig,
  ChartTooltip,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Button } from '@/components/ui/button'

// Components
import { RankingPrintButton } from './print/RankingPrintButton'
import { RankingExpandedDialog } from './RankingExpandedDialog'

// Icons
import { IconMaximize, IconChartBarOff } from '@tabler/icons-react'

// Third-party
import {
  Bar,
  XAxis,
  YAxis,
  BarChart,
  LabelList,
  type LabelProps,
} from 'recharts'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'
import {
  LABEL_FONT_SIZE,
  VALUE_LABEL_OFFSET,
  computeRankingLayout,
  createCanvasMeasurer,
  estimateTextWidth,
  formatCompactBrl,
  type MeasureText,
  type RankingItem,
} from './ranking-chart-layout'
import { FeaturedIcon } from '@/components/ui/featured-icon'

export type { RankingItem } from './ranking-chart-layout'

/** brand-500. Único da série, e aprovado nos checks de luminosidade e de
 * contraste contra a superfície branca do card — o verde anterior (#6CE9A6)
 * reprovava nos dois (L 0.845, contraste 1.48:1). */
const BAR_COLOR = '#099260'

/** Altura de cada faixa. Com barSize 18 sobra ar suficiente entre as barras. */
const ROW_HEIGHT = 34
const MIN_CHART_HEIGHT = 180

const chartConfig = {
  value: {
    label: 'Valor',
    color: BAR_COLOR,
  },
} satisfies ChartConfig

const currencyFormatter = (value: unknown) => (
  <div className="flex flex-1 justify-between items-center gap-4 leading-none">
    <span className="text-gray-500">Valor</span>
    <span className="font-mono font-medium tabular-nums text-gray-950">
      {formatCurrencyToBrl(Number(value))}
    </span>
  </div>
)

interface AxisTickProps {
  x?: number
  y?: number
  payload?: { value?: string }
  labelFor: (name: string) => string
}

function AxisTick({ x, y, payload, labelFor }: AxisTickProps) {
  const name = String(payload?.value ?? '')
  const label = labelFor(name)

  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={LABEL_FONT_SIZE}
      className="fill-gray-600"
    >
      {/* Nome truncado mostra o completo ao passar o mouse no próprio eixo */}
      {label !== name && <title>{name}</title>}
      {label}
    </text>
  )
}

function ValueLabel({ viewBox, value }: LabelProps) {
  const bar = viewBox as
    | { x?: number; y?: number; width?: number; height?: number }
    | undefined

  const x = Number(bar?.x ?? 0) + Number(bar?.width ?? 0) + VALUE_LABEL_OFFSET
  const y = Number(bar?.y ?? 0) + Number(bar?.height ?? 0) / 2

  return (
    <text
      x={x}
      y={y}
      dy={4}
      fontSize={LABEL_FONT_SIZE}
      className="fill-gray-600"
    >
      {formatCompactBrl(Number(value))}
    </text>
  )
}

interface Props {
  title: string
  /** Rótulo da entidade no cabeçalho da tabela expandida ("Produto"). */
  nameLabel: string
  items: RankingItem[]
  isLoading: boolean
}

export function RankingBarChart({ title, nameLabel, items, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [measure, setMeasure] = useState<MeasureText | null>(null)

  useEffect(() => {
    if (!chartEl) return

    let active = true
    const style = getComputedStyle(chartEl)
    const font = `${style.fontWeight} ${LABEL_FONT_SIZE}px ${style.fontFamily}`

    // O medidor vai embrulhado: uma função passada direto ao setState seria
    // tratada pelo React como updater e chamada com o estado anterior.
    const rebuildMeasure = () => {
      if (active) setMeasure(() => createCanvasMeasurer(font))
    }

    setChartWidth(chartEl.getBoundingClientRect().width)
    rebuildMeasure()

    const observer = new ResizeObserver(([entry]) => {
      setChartWidth(entry.contentRect.width)
    })
    observer.observe(chartEl)

    // A Inter chega por next/font com display: swap. Se a medida rodou antes,
    // usou a fonte de fallback; refaz quando a real terminar de carregar.
    document.fonts?.ready.then(rebuildMeasure)

    return () => {
      active = false
      observer.disconnect()
    }
  }, [chartEl])

  const layout = useMemo(
    () => computeRankingLayout(items, chartWidth, measure ?? estimateTextWidth),
    [items, chartWidth, measure],
  )

  const chartHeight = Math.max(items.length * ROW_HEIGHT, MIN_CHART_HEIGHT)
  const hasData = items.length > 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-1">
          <RankingPrintButton
            title={title}
            nameLabel={nameLabel}
            items={items}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Ver ranking completo"
            aria-label="Ver ranking completo"
            disabled={!hasData}
            onClick={() => setExpanded(true)}
            RightIcon={IconMaximize}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-0">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : !hasData ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
            <FeaturedIcon tone="neutral" size="lg" Icon={IconChartBarOff} />
            <p className="text-sm text-gray-500">
              Sem dados no período selecionado
            </p>
          </div>
        ) : (
          <ChartContainer
            ref={setChartEl}
            config={chartConfig}
            // aspect-auto cancela o aspect-video que o ChartContainer traz na
            // base — a altura aqui vem do número de itens, não de uma razão.
            className="aspect-auto w-full"
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={items}
              layout="vertical"
              margin={{ left: 0, right: layout.rightMargin, top: 4, bottom: 4 }}
            >
              {/* dataMax: a barra do 1º colocado usa a largura toda */}
              <XAxis
                type="number"
                dataKey="value"
                domain={[0, 'dataMax']}
                hide
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={layout.axisWidth}
                interval={0}
                tick={(props) => (
                  <AxisTick {...props} labelFor={layout.labelFor} />
                )}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={currencyFormatter} />}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={[0, 4, 4, 0]}
                barSize={18}
              >
                <LabelList dataKey="value" content={ValueLabel} />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>

      <RankingExpandedDialog
        open={expanded}
        onOpenChange={setExpanded}
        title={title}
        nameLabel={nameLabel}
        items={items}
      />
    </Card>
  )
}
