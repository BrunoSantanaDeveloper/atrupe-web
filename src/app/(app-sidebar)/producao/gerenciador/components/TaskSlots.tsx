'use client'

// Os blocos de agenda da tarefa (GP-52; Maicol, 23/11/2026, ELITE). O
// agendamento da tarefa é o bloco 1. "Dividir em dois dias" leva o resto do
// trabalho para outro dia; "Acrescentar tempo" cria um bloco extra, com
// motivo, fora do vendido. Em cada bloco, quem trabalhou e quanto: o relógio
// do dia vai sozinho para o bloco de hoje; à mão, escolhe-se o bloco.

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  splitTask,
  addTaskSlot,
  removeTaskSlot,
  addTimeEntry,
} from '@/actions/production-manager'

// Types
import type { Collaborator, TaskView } from '../manager'

// Consts
import { PRODUCTION_MANAGE } from '@/consts/productionManager'

type Run = (
  key: string,
  action: () => Promise<{ success: boolean; message: string; data?: unknown }>,
  success?: string,
) => Promise<boolean>

const brDay = (day: string) => day.split('-').reverse().slice(0, 2).join('/')

const hm = (minutes: number) => {
  const value = Math.max(0, Math.round(minutes))
  const h = Math.floor(value / 60)
  const m = value % 60
  return h ? (m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`) : `${m} min`
}

type Form = 'split' | 'extra' | null

export function TaskSlots({
  task,
  collaborators,
  run,
  pending,
}: {
  task: TaskView
  collaborators: Collaborator[]
  run: Run
  pending: string | null
}) {
  const slots = task.slots || []
  const first = task.schedule
  const [form, setForm] = useState<Form>(null)
  const [date, setDate] = useState('')
  const [start, setStart] = useState('')
  const [minutes, setMinutes] = useState('')
  const [reason, setReason] = useState('')
  // Quem e quanto: o bloco aberto para lançar (null = nenhum; '' = bloco 1)
  const [entryFor, setEntryFor] = useState<string | null>(null)
  const [who, setWho] = useState('')
  const [entryMinutes, setEntryMinutes] = useState('')

  const firstMinutes = first?.minutes || task.estimatedMinutes || 0
  const scheduled =
    firstMinutes + slots.reduce((sum, slot) => sum + slot.minutes, 0)
  const extra = slots
    .filter((slot) => slot.kind === 'EXTRA')
    .reduce((sum, slot) => sum + slot.minutes, 0)

  const peopleOf = (slotId: string | null) => {
    const byPerson = new Map<string, number>()
    for (const entry of task.timeEntries) {
      if ((entry.slotId || null) !== slotId) continue
      byPerson.set(
        entry.collaboratorId,
        (byPerson.get(entry.collaboratorId) || 0) + entry.minutes,
      )
    }
    return Array.from(byPerson.entries()).map(
      ([id, value]) =>
        `${collaborators.find((item) => item.id === id)?.name || 'Alguém'} ${hm(value)}`,
    )
  }

  const reset = () => {
    setForm(null)
    setDate('')
    setStart('')
    setMinutes('')
    setReason('')
  }

  const blocks = [
    ...(first
      ? [
          {
            id: null as string | null,
            label: 'Bloco 1',
            date: first.date,
            start: first.start,
            minutes: firstMinutes,
            extra: false,
            reason: null as string | null,
          },
        ]
      : []),
    ...slots.map((slot, index) => ({
      id: slot.id as string | null,
      label: slot.kind === 'EXTRA' ? 'Extra' : `Bloco ${index + 2}`,
      date: slot.date,
      start: slot.start,
      minutes: slot.minutes,
      extra: slot.kind === 'EXTRA',
      reason: slot.reason,
    })),
  ]

  if (!first && !slots.length) return null

  return (
    <div className="space-y-3 border-t border-gray-100 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="type-eyebrow">Blocos de agenda</p>
        <p className="text-xs text-gray">
          Agendado {hm(scheduled)} · vendido {hm(task.estimatedMinutes)}
          {extra > 0 && ` · extra ${hm(extra)}`}
        </p>
      </div>

      <ul className="space-y-2">
        {blocks.map((block) => {
          const people = peopleOf(block.id)
          const key = block.id ?? ''
          return (
            <li
              key={key || 'first'}
              className="space-y-1 rounded-md border border-gray-200 px-3 py-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-800">
                  <Badge
                    variant={block.extra ? 'warningLight' : 'neutralLight'}
                  >
                    {block.label}
                  </Badge>
                  <span>
                    {brDay(block.date)}
                    {block.start ? ` · ${block.start}` : ''} ·{' '}
                    {hm(block.minutes)}
                  </span>
                  {block.reason && (
                    <span className="text-gray">({block.reason})</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <PermissionGate permissions={PRODUCTION_MANAGE}>
                    <button
                      type="button"
                      className="text-xs text-brand-700 hover:underline"
                      onClick={() => {
                        setEntryFor(key)
                        setWho(collaborators[0]?.id || '')
                        setEntryMinutes('')
                      }}
                    >
                      Lançar quem e quanto
                    </button>
                  </PermissionGate>
                  {block.id && (
                    <button
                      type="button"
                      className="text-xs text-error-700 hover:underline"
                      onClick={() =>
                        run(
                          `slot-remove-${block.id}`,
                          () =>
                            removeTaskSlot({
                              id: task.id,
                              slotId: block.id as string,
                            }),
                          'Bloco tirado',
                        )
                      }
                    >
                      Tirar
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray">
                {people.length
                  ? people.join(' · ')
                  : 'Ninguém lançou tempo neste bloco.'}
              </p>
              {entryFor === key && (
                <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                  <SelectBasic
                    name={`slot-who-${key || 'first'}`}
                    label="Quem"
                    options={collaborators.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    value={who}
                    onChange={(value) => setWho(String(value))}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`slot-min-${key || 'first'}`}>
                      Minutos
                    </Label>
                    <Input
                      id={`slot-min-${key || 'first'}`}
                      inputMode="numeric"
                      value={entryMinutes}
                      onChange={(event) => setEntryMinutes(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      isLoading={pending === `slot-entry-${key}`}
                      disabled={!who || !(Number(entryMinutes) > 0)}
                      onClick={async () => {
                        const ok = await run(
                          `slot-entry-${key}`,
                          () =>
                            addTimeEntry({
                              id: task.id,
                              collaboratorId: who,
                              minutes: Number(entryMinutes),
                              note: `Lançado no ${block.label.toLowerCase()} (${brDay(block.date)})`,
                              slotId: block.id,
                            }),
                          'Tempo lançado',
                        )
                        if (ok) setEntryFor(null)
                      }}
                    >
                      Lançar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      onClick={() => setEntryFor(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap gap-2">
        {first && (
          <Button
            type="button"
            size="sm"
            variant="neutralOutline"
            onClick={() => {
              reset()
              setForm('split')
              setMinutes(String(Math.floor(firstMinutes / 2) || ''))
            }}
          >
            Dividir em dois dias
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          variant="neutralOutline"
          onClick={() => {
            reset()
            setForm('extra')
          }}
        >
          Acrescentar tempo
        </Button>
      </div>

      {form && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-800">
            {form === 'split' ? 'Dividir em dois dias' : 'Acrescentar tempo'}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="slot-date">
                {form === 'split' ? 'Dia do resto' : 'Dia'}
              </Label>
              <Input
                id="slot-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slot-start">Início (opcional)</Label>
              <Input
                id="slot-start"
                type="time"
                value={start}
                onChange={(event) => setStart(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slot-minutes">
                {form === 'split' ? 'Minutos no primeiro dia' : 'Minutos'}
              </Label>
              <Input
                id="slot-minutes"
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
          </div>
          {form === 'split' && Number(minutes) > 0 && (
            <p className="text-xs text-gray">
              Ficam {hm(Number(minutes))} no primeiro dia e{' '}
              {hm(Math.max(firstMinutes - Number(minutes), 0))} vão para o
              outro.
            </p>
          )}
          {form === 'extra' && (
            <div className="space-y-1">
              <Label htmlFor="slot-reason">Motivo</Label>
              <Input
                id="slot-reason"
                placeholder="Ajuste, retrabalho, falta de material…"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              isLoading={pending === 'slot-save'}
              disabled={
                !date ||
                !(Number(minutes) > 0) ||
                (form === 'extra' && !reason.trim()) ||
                (form === 'split' && !(Number(minutes) < firstMinutes))
              }
              onClick={async () => {
                const ok = await run('slot-save', () =>
                  form === 'split'
                    ? splitTask({
                        id: task.id,
                        date,
                        start: start || null,
                        keepMinutes: Number(minutes),
                      })
                    : addTaskSlot({
                        id: task.id,
                        date,
                        start: start || null,
                        minutes: Number(minutes),
                        kind: 'EXTRA',
                        reason: reason.trim(),
                      }),
                )
                if (ok) reset()
              }}
            >
              {form === 'split' ? 'Dividir' : 'Acrescentar'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="neutralOutline"
              onClick={reset}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
