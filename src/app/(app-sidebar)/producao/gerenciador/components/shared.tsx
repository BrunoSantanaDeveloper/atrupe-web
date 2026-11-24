'use client'

// O que as telas do gerenciador compartilham (GP-45, 29/10/2026): datas,
// período, a forma de carregar e a atualização das consultas. Antes vivia
// tudo num arquivo só, com os gerenciadores em abas; agora a entrada lista
// os setores e cada setor tem a sua tela.

// UI
import { Skeleton } from '@/components/ui/skeleton'

// Types
import type { TaskView } from '../manager'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

export const today = () => new Date().toISOString().slice(0, 10)
export const addDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

export const dayLabel = (date: string) =>
  date === today()
    ? 'Hoje'
    : date === addDays(1)
      ? 'Amanhã'
      : new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })

export const shortDate = (date: string) =>
  date.split('-').reverse().slice(0, 2).join('/')

export const endTime = (start: string, minutes: number) => {
  const [hours, mins] = start.split(':').map(Number)
  const total = hours * 60 + mins + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export type Period = 'todas' | 'hoje' | 'semana' | 'sem-agenda'

export const periodOptions: { value: Period; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Próximos 7 dias' },
  { value: 'sem-agenda', label: 'Sem agendamento' },
]

// O dia (de um bloco de agenda) cai no período escolhido
export const dayInPeriod = (day: string, period: Period) => {
  if (period === 'todas') return true
  if (period === 'sem-agenda') return false
  if (period === 'hoje') return day === today()
  return day >= today() && day <= addDays(7)
}

export const inPeriod = (task: TaskView, period: Period) => {
  if (period === 'todas') return true
  if (period === 'sem-agenda') return !task.schedule
  if (!task.schedule) return false
  // O bloco 1 e os outros blocos de agenda (GP-52): o trabalho dividido em
  // dois dias aparece nos dois
  const days = [
    task.schedule.date,
    ...(task.slots || []).map((slot) => slot.date),
  ]
  return days.some((day) => dayInPeriod(day, period))
}

// O intervalo da agenda conforme o período escolhido
export const agendaRange = (period: Period) => ({
  from: period === 'semana' || period === 'hoje' ? today() : addDays(-30),
  to: period === 'hoje' ? today() : addDays(period === 'semana' ? 7 : 60),
})

// A busca, a pessoa e o período, aplicados à tarefa
export const taskMatches = (
  task: TaskView,
  filter: {
    search: string
    person: string
    period: Period
    // A fila por máquina na impressão (GP-47, item 4)
    machine?: string
  },
) => {
  if (filter.machine && filter.machine !== 'todas') {
    if ((task.machine || '') !== filter.machine) return false
  }
  if (filter.person !== 'todos') {
    const mine =
      task.assigneeId === filter.person ||
      task.workers.some((worker) => worker.id === filter.person)
    if (!mine) return false
  }
  if (!inPeriod(task, filter.period)) return false
  const text = `${task.code} ${task.stageName} ${task.itemName} ${task.project.client} ${task.project.number}`
  return text.toLowerCase().includes(filter.search.trim().toLowerCase())
}

// Urgente primeiro, mantendo a ordem de quem já está ordenado (GP-47)
export const urgentFirst = <T extends TaskView>(tasks: T[]) => [
  ...tasks.filter((task) => task.priority === 'URGENT'),
  ...tasks.filter((task) => task.priority !== 'URGENT'),
]

// Tudo o que mostra tarefa recarrega junto depois de uma ação
export function useProductionRefresh() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['production-board'] }),
      queryClient.invalidateQueries({ queryKey: ['production-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['production-agenda'] }),
      queryClient.invalidateQueries({ queryKey: ['production-project'] }),
      queryClient.invalidateQueries({ queryKey: ['production-projects'] }),
    ])
}

// Forma do quadro (a linha do gerenciador e as seis colunas da GP-28)
// enquanto carrega
export function BoardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-72 rounded" />
      <div className="flex gap-3 overflow-hidden pb-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="w-[290px] shrink-0 space-y-2 rounded-xl bg-gray-50 p-3"
          >
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-[92px] w-full rounded-lg" />
            <Skeleton className="h-[92px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Forma da agenda (um card por dia com os cartões) enquanto carrega
export function AgendaSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="rounded-xl border border-gray-200 p-6">
          <Skeleton className="mb-4 h-5 w-40 rounded" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-[92px] rounded-lg" />
            <Skeleton className="h-[92px] rounded-lg" />
            <Skeleton className="h-[92px] rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
