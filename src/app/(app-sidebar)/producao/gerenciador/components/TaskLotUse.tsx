'use client'

// A baixa do impressor no rolo (ES-16, FULL; Maicol, 22/11/2026), como na
// primeira versão: o rolo fica fechado no estoque; aberto, vai para o setor
// e aparece aqui. O impressor escolhe o rolo e informa o comprimento (a
// largura é a do rolo). Essa baixa vale para o estoque, e a baixa da venda
// não tira de novo o material que ela substitui. Usar outro material (falta
// ou aproveitamento) fica registrado como troca.

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getTaskLots, registerTaskLotUse } from '@/actions/purchasing'

// Utils
import {
  brDateTime,
  qty,
  toNumber,
} from '@/app/(app-sidebar)/estoque/compras/components/shared'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

const NONE = '__nenhum'

const keyOf = (lot: { materialId: string; variationId: string | null }) =>
  `${lot.materialId}|${lot.variationId ?? ''}`

const size = (width: number | null, length: number | null) =>
  width !== null && length !== null ? `${qty(width)} × ${qty(length)} m` : ''

export function TaskLotUse({
  taskId,
  onChanged,
}: {
  taskId: string
  onChanged: () => void
}) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['task-lots', taskId],
    queryFn: () => getTaskLots(taskId),
  })
  const info = data?.data
  const [lotId, setLotId] = useState('')
  const [length, setLength] = useState('')
  const [quantity, setQuantity] = useState('')
  const [replaces, setReplaces] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const lot = info?.lots.find((item) => item.id === lotId) ?? null
  const byLength = !!lot && lot.measure !== 'UNIT' && lot.currentWidth !== null

  // O material vendido que o rolo substitui: o mesmo, quando é; senão, o
  // primeiro vendido (a troca), e o impressor muda se for outro
  useEffect(() => {
    if (!lot || !info) return
    const same = info.sold.find((item) => item.key === keyOf(lot))
    setReplaces(same?.key ?? info.sold[0]?.key ?? NONE)
  }, [lot, info])

  if (isLoading) return null
  if (!data?.success || !info) {
    return data?.message ? (
      <p className="text-sm text-gray">{data.message}</p>
    ) : null
  }

  const swapped =
    !!lot && replaces !== NONE && !!replaces && replaces !== keyOf(lot)

  const save = async () => {
    if (!lot) return
    setSaving(true)
    const res = await registerTaskLotUse(taskId, {
      lotId: lot.id,
      ...(byLength
        ? { length: toNumber(length) }
        : { quantity: toNumber(quantity) }),
      replaces: info.sold.length
        ? replaces === NONE
          ? null
          : replaces
        : undefined,
      note: note || undefined,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setLength('')
    setQuantity('')
    setNote('')
    setLotId('')
    queryClient.invalidateQueries({ queryKey: ['task-lots', taskId] })
    onChanged()
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-800">Baixa no material</p>

      {info.uses.length > 0 && (
        <ul className="space-y-1 text-sm">
          {info.uses.map((use, index) => (
            <li key={index} className="text-gray-800">
              Lote {use.lot}: {qty(use.quantity)} {use.unit}
              {use.replaces && (
                <span className="text-gray"> · no lugar de {use.replaces}</span>
              )}
              <span className="text-gray">
                {' '}
                · {use.byName}, {brDateTime(use.at)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {!info.lots.length ? (
        <p className="text-sm text-gray">
          Nenhum rolo aberto neste setor. Abra o lote em Estoque › Lotes
          escolhendo o setor.
        </p>
      ) : (
        <div className="space-y-3">
          <SelectBasic
            name={`task-lot-${taskId}`}
            label="Rolo aberto no setor"
            placeholder="Escolher o rolo"
            value={lotId || undefined}
            options={info.lots.map((item) => ({
              value: item.id,
              label: `${item.code} · ${item.material}${item.color ? ` · ${item.color}` : ''} · ${
                size(item.currentWidth, item.currentLength) ||
                `${qty(item.currentQuantity)} ${item.unit}`
              }${item.sold ? ' (vendido)' : ''}`,
            }))}
            onChange={(value) => setLotId(String(value))}
          />
          {lot && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {byLength ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`task-lot-length-${taskId}`}>
                    Comprimento usado (m)
                  </Label>
                  <Input
                    id={`task-lot-length-${taskId}`}
                    inputMode="decimal"
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                  />
                  <span className="text-xs text-gray">
                    Na largura do rolo, {qty(lot.currentWidth)} m
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`task-lot-qty-${taskId}`}>
                    Quanto usou ({lot.unit})
                  </Label>
                  <Input
                    id={`task-lot-qty-${taskId}`}
                    inputMode="decimal"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
              )}
              {info.sold.length > 0 && (
                <SelectBasic
                  name={`task-lot-replaces-${taskId}`}
                  label="No lugar do material vendido"
                  value={replaces || undefined}
                  options={[
                    ...info.sold.map((item) => ({
                      value: item.key,
                      label: item.name,
                    })),
                    { value: NONE, label: 'Nenhum (material a mais)' },
                  ]}
                  onChange={(value) => setReplaces(String(value))}
                />
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor={`task-lot-note-${taskId}`}>Observação</Label>
                <Input
                  id={`task-lot-note-${taskId}`}
                  placeholder="Perda, emenda…"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
          )}
          {swapped && (
            <p className="text-xs text-warning-700">
              Material diferente do vendido: fica registrado como troca.
            </p>
          )}
          <Button
            type="button"
            variant="neutralOutline"
            isLoading={saving}
            disabled={
              !lot ||
              !(byLength ? toNumber(length) > 0 : toNumber(quantity) > 0)
            }
            onClick={save}
          >
            Dar baixa no rolo
          </Button>
        </div>
      )}
    </div>
  )
}
