'use client'

// A baixa conjunta (VS-2; Maicol, 23/11/2026, FULL): os trabalhos marcados
// na fila numa impressão só. O impressor escolhe o rolo aberto no setor e
// informa o comprimento usado (com o refugo); o sistema divide pela área de
// cada trabalho. Acabando o rolo, o segundo rolo leva o resto.

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getTaskLots, registerBatchLotUse } from '@/actions/purchasing'

// Third-party
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

const num = (value: string) => Number(value.replace(',', '.'))
const m = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

export function BatchPrintDialog({
  taskIds,
  open,
  onOpenChange,
  onDone,
}: {
  taskIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  // Os rolos abertos no setor (os mesmos para as tarefas do setor)
  const { data } = useQuery({
    queryKey: ['task-lots', taskIds[0]],
    queryFn: () => getTaskLots(taskIds[0]),
    enabled: open && taskIds.length > 0,
  })
  const lots = (data?.data?.lots || []).filter(
    (lot) => lot.currentWidth !== null,
  )
  const [lotId, setLotId] = useState('')
  const [length, setLength] = useState('')
  const [secondLotId, setSecondLotId] = useState('')
  const [secondLength, setSecondLength] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const lot = lots.find((item) => item.id === lotId)
  const short =
    !!lot && lot.currentLength !== null && num(length) > lot.currentLength
  const options = lots.map((item) => ({
    value: item.id,
    label: `${item.code} · ${item.material}${item.color ? ` · ${item.color}` : ''} · ${m(item.currentWidth || 0)} × ${m(item.currentLength || 0)} m`,
  }))

  const close = () => {
    setLotId('')
    setLength('')
    setSecondLotId('')
    setSecondLength('')
    setNote('')
    onOpenChange(false)
  }

  const save = async () => {
    setSaving(true)
    const res = await registerBatchLotUse({
      taskIds,
      lotId,
      length: short && lot?.currentLength ? lot.currentLength : num(length),
      ...(short && secondLotId
        ? {
            secondLotId,
            secondLength:
              num(secondLength) ||
              Math.max(num(length) - (lot?.currentLength || 0), 0),
          }
        : {}),
      note: note || undefined,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    close()
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? null : close())}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Apontar impressão</DialogTitle>
          <DialogDescription>
            {taskIds.length} trabalhos numa impressão só. O comprimento usado,
            com o refugo, é dividido pela área de cada um.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!lots.length ? (
            <p className="text-sm text-gray">
              Nenhum rolo aberto neste setor. Abra o lote em Estoque › Lotes
              escolhendo o setor.
            </p>
          ) : (
            <>
              <SelectBasic
                name="batch-lot"
                label="Rolo"
                placeholder="Escolher o rolo"
                options={options}
                value={lotId || undefined}
                onChange={(value) => setLotId(String(value))}
              />
              <div className="space-y-1">
                <Label htmlFor="batch-length">Comprimento usado (m)</Label>
                <Input
                  id="batch-length"
                  inputMode="decimal"
                  value={length}
                  onChange={(event) => setLength(event.target.value)}
                />
                {lot && (
                  <span className="text-xs text-gray">
                    Na largura do rolo, {m(lot.currentWidth || 0)} m
                  </span>
                )}
              </div>
              {short && lot && (
                <div className="space-y-3 rounded-lg border border-warning-200 bg-warning-25 p-3">
                  <p className="text-sm text-warning-700">
                    Material insuficiente: restam {m(lot.currentLength || 0)} m
                    no rolo {lot.code}. Escolha o segundo rolo para o resto.
                  </p>
                  <SelectBasic
                    name="batch-second-lot"
                    label="Segundo rolo"
                    placeholder="Escolher o rolo"
                    options={options.filter((item) => item.value !== lotId)}
                    value={secondLotId || undefined}
                    onChange={(value) => setSecondLotId(String(value))}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="batch-second-length">
                      Comprimento no segundo rolo (m)
                    </Label>
                    <Input
                      id="batch-second-length"
                      inputMode="decimal"
                      placeholder={m(
                        Math.max(num(length) - (lot.currentLength || 0), 0),
                      )}
                      value={secondLength}
                      onChange={(event) => setSecondLength(event.target.value)}
                    />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="batch-note">Observação</Label>
                <Input
                  id="batch-note"
                  placeholder="Perda, emenda…"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={close}>
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!lotId || !(num(length) > 0) || (short && !secondLotId)}
            onClick={save}
          >
            Dar baixa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
