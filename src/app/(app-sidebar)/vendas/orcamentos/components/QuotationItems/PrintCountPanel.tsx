'use client'

// A contagem de folhas no item do orçamento (gráfica rápida no LITE,
// 12/11/2026), sem custo. Muda na hora com a quantidade, a medida e a
// variação (o papel vem dela), e mostra as peças por folha, as folhas do
// pedido e as de acerto, e a sangria em uso e de onde vem (GR-1.1), com o
// ajuste só deste item, recolhido para não pesar a tela de quem não
// precisa. A sangria mudada vai no `printSpec` do item.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useMemo, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Actions
import { getPrintCount, type PrintSpec } from '@/actions/print'

// Components
import {
  printCountText,
  printCountTitle,
} from '@/components/common/SheetCountBadges'

// Hooks
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

const SOURCE_TEXT = {
  ITEM: 'ajustada neste item',
  PRODUCT: 'do produto',
  SECTOR: 'padrão do setor',
  DEFAULT: 'padrão do sistema',
  // O item vendido pela composição do PRO (18/11/2026)
  COMPOSITION: 'da composição',
} as const

interface Props {
  productId?: string
  variationId: string | null
  // Medida da peça (tamanho final) em mm e as peças vendidas
  width: number
  height: number
  quantity: number
  initialSpec?: PrintSpec | null
  onChange: (spec: PrintSpec | null) => void
}

export function PrintCountPanel({
  productId,
  variationId,
  width,
  height,
  quantity,
  initialSpec,
  onChange,
}: Props) {
  const [bleedMm, setBleedMm] = useState<number | null>(
    typeof initialSpec?.bleedMm === 'number' ? initialSpec.bleedMm : null,
  )

  const body = useMemo(
    () => ({
      variationId,
      width: width || null,
      height: height || null,
      quantity: Math.max(0, quantity || 0),
      printSpec: bleedMm === null ? null : { bleedMm },
    }),
    [variationId, width, height, quantity, bleedMm],
  )
  const debounced = useDebouncedValue(body, 300)
  const { data: previewRes } = useQuery({
    enabled: !!productId,
    placeholderData: keepPreviousData,
    queryKey: ['print-count', productId, debounced],
    queryFn: () => getPrintCount(productId as string, debounced),
  })
  const preview = previewRes?.data

  // Só vai o que o vendedor mudou: o resto segue o produto
  useEffect(() => {
    onChange(bleedMm === null ? null : { bleedMm })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bleedMm])

  // Sem papel na variação: nada a contar
  if (!preview?.counts.length) return null

  return (
    <div className="w-full space-y-3 rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-1.5">
        <p className="type-card-title">Folhas</p>
        <InfoHint title="Contagem de folhas">
          <p>
            Quantas folhas o item gasta: a conta usa o tamanho final da peça
            mais a sangria dos dois lados, vê quantas cabem na folha e soma as
            folhas de acerto.
          </p>
        </InfoHint>
      </div>

      <ul className="space-y-1 text-sm">
        {preview.counts.map((count, index) => (
          <li key={`${count.paperName}-${index}`}>
            <span className="font-medium">{printCountTitle(count)}:</span>{' '}
            <span
              className={count.warning ? 'text-warning-700' : 'text-gray-700'}
            >
              {printCountText(count)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end gap-3 text-sm">
        {bleedMm !== null ? (
          <>
            <div className="flex w-40 flex-col gap-1.5">
              <label htmlFor="item-bleed" className="text-sm font-medium">
                Sangria por lado (mm)
              </label>
              <Input
                id="item-bleed"
                type="number"
                min={0}
                max={20}
                step="0.5"
                value={bleedMm}
                onChange={(event) =>
                  setBleedMm(
                    Math.min(20, Math.max(0, Number(event.target.value) || 0)),
                  )
                }
              />
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setBleedMm(null)}
            >
              Voltar ao padrão
            </Button>
          </>
        ) : (
          <>
            <span className="text-gray">
              {`Sangria de ${preview.bleed.mm} mm por lado, ${SOURCE_TEXT[preview.bleed.source]}.`}
            </span>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0"
              onClick={() => setBleedMm(preview.bleed.mm)}
            >
              Ajustar neste item
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
