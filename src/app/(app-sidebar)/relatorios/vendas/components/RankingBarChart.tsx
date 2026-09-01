'use client'

/**
 * RankingBarChart
 *
 * Barra horizontal de ranking (produtos mais vendidos, melhores clientes).
 *
 * Os dois rankings do relatório de vendas eram componentes idênticos e traziam
 * o mesmo defeito: o eixo Y tinha 80px de largura, e nomes longos de produto
 * ("LUMINOSO EM ACM COM ACRÍLICO...") eram quebrados pelo recharts em três ou
 * quatro linhas que se sobrepunham entre as barras, deixando o eixo ilegível.
 *
 * Decisões de leitura:
 * - rótulo do eixo em UMA linha, truncado, com o nome completo no tooltip e na
 *   visão expandida — quebrar linha é o que causava a sobreposição;
 * - altura proporcional ao número de itens, em vez de espremer 10 barras num
 *   container de altura fixa;
 * - valor impresso na ponta da barra, para o número não ficar refém do hover.
 */

// React
import { useMemo, useState } from 'react'

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
import { Bar, XAxis, YAxis, BarChart, LabelList } from 'recharts'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

export interface RankingItem {
  name: string
  value: number
}

/** brand-500. Único da série, e aprovado nos checks de luminosidade e de
 * contraste contra a superfície branca do card — o verde anterior (#6CE9A6)
 * reprovava nos dois (L 0.845, contraste 1.48:1). */
const BAR_COLOR = '#099260'

/** Altura de cada faixa. Com barSize 18 sobra ar suficiente entre as barras. */
const ROW_HEIGHT = 34
const MIN_CHART_HEIGHT = 180

/**
 * Largura do eixo e corte do rótulo. Medidos no navegador com os nomes reais
 * (caixa alta, ~7px/caractere a 12px), não estimados: 25 caracteres dão 178px
 * de texto e 14px de folga dentro dos 200px do eixo. Com 28 caracteres três
 * rótulos passavam da borda do SVG e perdiam a primeira letra.
 */
const AXIS_WIDTH = 200
const MAX_LABEL_CHARS = 25

const chartConfig = {
  value: {
    label: 'Valor',
    color: BAR_COLOR,
  },
} satisfies ChartConfig

function truncateLabel(value: string) {
  if (value.length <= MAX_LABEL_CHARS) return value
  return `${value.slice(0, MAX_LABEL_CHARS - 1).trimEnd()}…`
}

/**
 * Valor compacto para a ponta da barra: "R$ 12,3 mil" ocupa metade do espaço de
 * "R$ 12.345,67" e sobra largura para a barra. O valor exato fica no tooltip e
 * na visão expandida.
 */
export function formatCompactBrl(valueInCents: number) {
  const value = (valueInCents || 0) / 100

  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mi`
  }

  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mil`
  }

  return formatCurrencyToBrl(valueInCents)
}

const currencyFormatter = (value: unknown) => (
  <div className="flex flex-1 justify-between items-center gap-4 leading-none">
    <span className="text-gray-500">Valor</span>
    <span className="font-mono font-medium tabular-nums text-gray-950">
      {formatCurrencyToBrl(Number(value))}
    </span>
  </div>
)

// O tick padrão do recharts quebra o texto em várias linhas quando ele não cabe
// na largura do eixo. Uma <text> própria garante uma linha só.
interface AxisTickProps {
  x?: number
  y?: number
  payload?: { value?: string }
}

function AxisTick({ x, y, payload }: AxisTickProps) {
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={12}
      className="fill-gray-600"
    >
      {truncateLabel(String(payload?.value ?? ''))}
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

  const chartHeight = useMemo(
    () => Math.max(items.length * ROW_HEIGHT, MIN_CHART_HEIGHT),
    [items.length],
  )

  const hasData = items.length > 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-700">
          {title}
        </CardTitle>
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
            <IconChartBarOff className="size-8 text-gray-300" />
            <p className="text-sm text-gray-500">
              Sem dados no período selecionado
            </p>
          </div>
        ) : (
          <ChartContainer
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
              // right: espaço para o valor na ponta da barra sem cortar
              margin={{ left: 0, right: 72, top: 4, bottom: 4 }}
            >
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={AXIS_WIDTH}
                interval={0}
                tick={<AxisTick />}
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
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={8}
                  fontSize={12}
                  className="fill-gray-600"
                  formatter={(value: number) => formatCompactBrl(value)}
                />
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
