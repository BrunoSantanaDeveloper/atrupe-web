'use client'

// A agenda do colaborador (GP-49, item 2; 22/11/2026): como o Google
// Agenda, o que a pessoa tem programado nos próximos dias, de todos os
// setores. Um dia por coluna; os trabalhos com hora em blocos no horário e
// os agendados só no dia no alto da coluna. A pessoa é quem foi atribuído à
// tarefa ou quem está nela agora. Clicar abre a tarefa.

// React
import { useMemo, useState } from 'react'

// UI
import { Card, CardContent } from '@/components/ui/card'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { TaskView } from '../manager'

// Utils
import { cn } from '@/lib/utils'
import { addDays, endTime, shortDate } from './shared'

const DAYS = 7
// A grade vai das 07:00 às 20:00; o trabalho fora dela encosta na borda
const GRID_START = 7 * 60
const GRID_END = 20 * 60
const HOUR_HEIGHT = 48

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const weekday = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'short',
  })

const involves = (task: TaskView, personId: string) =>
  task.assigneeId === personId ||
  task.assignee?.id === personId ||
  task.workers.some((worker) => worker.id === personId)

export function PersonAgenda({
  scheduled,
  me,
  onOpen,
}: {
  scheduled: TaskView[]
  me: string | null
  onOpen: (id: string) => void
}) {
  // As pessoas que aparecem nas tarefas, e quem está usando a tela
  const people = useMemo(() => {
    const map = new Map<string, string>()
    for (const task of scheduled) {
      if (task.assignee) map.set(task.assignee.id, task.assignee.name)
      for (const worker of task.workers) map.set(worker.id, worker.name)
    }
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    )
  }, [scheduled])
  const [chosen, setChosen] = useState<string | null>(null)
  const person =
    chosen ??
    (me && people.some((item) => item.id === me) ? me : people[0]?.id) ??
    null

  const days = Array.from({ length: DAYS }, (_, index) => addDays(index))
  const mine = person
    ? scheduled.filter((task) => task.schedule && involves(task, person))
    : []
  const hours = Array.from(
    { length: (GRID_END - GRID_START) / 60 },
    (_, index) => GRID_START / 60 + index,
  )

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SelectBasic
            name="person-agenda"
            label=""
            className="w-[240px]"
            placeholder="Escolha a pessoa"
            options={people.map((item) => ({
              value: item.id,
              label: item.id === me ? `${item.name} (você)` : item.name,
            }))}
            value={person ?? undefined}
            onChange={(value) => value && setChosen(String(value))}
          />
          <p className="text-sm text-gray">
            Os próximos {DAYS} dias, com o que foi atribuído à pessoa ou o que
            ela está fazendo agora.
          </p>
        </div>

        {!people.length ? (
          <p className="text-sm text-gray">
            Nenhuma tarefa agendada tem pessoa atribuída nos próximos dias.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[840px]"
              style={{ gridTemplateColumns: `48px repeat(${DAYS}, 1fr)` }}
            >
              {/* Cabeçalho: o dia e o que é só do dia */}
              <div />
              {days.map((day) => {
                const dayOnly = mine.filter(
                  (task) =>
                    task.schedule!.date === day && !task.schedule!.start,
                )
                return (
                  <div
                    key={day}
                    className="space-y-1 border-l border-gray-100 px-1 pb-2"
                  >
                    <p
                      className={cn(
                        'text-center text-xs font-medium capitalize text-gray-700',
                        day === days[0] && 'text-brand-700',
                      )}
                    >
                      {weekday(day)} {shortDate(day)}
                    </p>
                    {dayOnly.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onOpen(task.id)}
                        className="flex w-full items-center gap-1 truncate rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-left text-xs text-gray-800 hover:border-brand-300"
                      >
                        <SectorIcon name={task.sector} size="sm" />
                        <span className="truncate">
                          {task.stageName} · {task.itemName}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}

              {/* A grade das horas */}
              <div className="relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="pr-1 text-right text-xs text-gray"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {days.map((day) => (
                <div
                  key={day}
                  className="relative border-l border-gray-100"
                  style={{ height: hours.length * HOUR_HEIGHT }}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-t border-gray-100"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}
                  {mine
                    .filter(
                      (task) =>
                        task.schedule!.date === day && !!task.schedule!.start,
                    )
                    .map((task) => {
                      const start = toMinutes(task.schedule!.start!)
                      const minutes = Math.max(task.schedule!.minutes, 15)
                      const top = Math.min(
                        Math.max(start - GRID_START, 0),
                        GRID_END - GRID_START - 15,
                      )
                      const height = Math.max(
                        Math.min(minutes, GRID_END - GRID_START - top),
                        15,
                      )
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => onOpen(task.id)}
                          className={cn(
                            'absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-0.5 text-left text-xs',
                            task.alert
                              ? 'border-error-300 bg-error-50 text-error-800'
                              : 'border-brand-200 bg-brand-50 text-gray-800 hover:border-brand-400',
                          )}
                          style={{
                            top: (top / 60) * HOUR_HEIGHT,
                            height: (height / 60) * HOUR_HEIGHT,
                          }}
                        >
                          <span className="block font-medium tabular-nums">
                            {task.schedule!.start}–
                            {endTime(task.schedule!.start!, minutes)}
                          </span>
                          <span className="block truncate">
                            {task.stageName} · {task.itemName}
                          </span>
                          <span className="block truncate text-gray">
                            {task.project.number} · {task.project.client}
                          </span>
                        </button>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
