'use client'

// A tela do gerenciador de produção (GP-1 a GP-3, GP-5, GP-9, GP-10, GP-17),
// como o legado organiza: escolhe-se o gerenciador; a fila mostra as tarefas
// agendadas por dia e as não agendadas (modelo simples) ou colunas por etapa
// (Kanban); os colaboradores ficam ao lado — no modelo coletivo, arrasta-se
// quem está disponível para a tarefa, e o relógio começa a contar.

// React / Next
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { duration, taskStatusBadge, TaskDetailDialog } from './TaskDetailDialog'

// Types
import type { TaskView } from '../manager'

// Actions
import {
  stopWork,
  startWork,
  getManagerBoard,
  getManagerSummary,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { updateFilterParam } from '@/lib/filter-utils'
import { managerModelObj, timeModeObj } from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconSearch, IconAlertTriangle, IconUser } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

const today = () => new Date().toISOString().slice(0, 10)

const dayLabel = (date: string) =>
  date === today()
    ? 'Hoje'
    : new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })

type QuickFilter = 'unscheduled' | 'untilToday' | 'unassigned'

const quickFilters: { value: QuickFilter; label: string }[] = [
  { value: 'unscheduled', label: 'Sem agendamento' },
  { value: 'untilToday', label: 'Agendada até hoje' },
  { value: 'unassigned', label: 'Sem atribuição' },
]

export function ManagerBoard() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [quick, setQuick] = useState<QuickFilter[]>([])
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([])
  const [dragging, setDragging] = useState<string | null>(null)

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['production-summary'],
    queryFn: () => getManagerSummary(),
  })
  const summary = summaryRes?.data || []
  const managerId = params.get('gerenciador') || summary[0]?.id || ''

  const { data: boardRes, isLoading: loadingBoard } = useQuery({
    queryKey: ['production-board', managerId],
    queryFn: () => getManagerBoard({ managerId }),
    enabled: !!managerId,
  })
  const board = boardRes?.data

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['production-board'] }),
      queryClient.invalidateQueries({ queryKey: ['production-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['production-project'] }),
      queryClient.invalidateQueries({ queryKey: ['production-projects'] }),
    ])

  if (loadingSummary) return <Skeleton className="h-[480px] w-full" />

  const tasks = (board?.tasks || []).filter((task) => {
    if (hiddenTypes.includes(task.taskTypeId)) return false
    if (quick.includes('unscheduled') && task.schedule) return false
    if (
      quick.includes('untilToday') &&
      (!task.schedule || task.schedule.date > today())
    )
      return false
    if (quick.includes('unassigned') && task.assigneeId) return false
    const text = `${task.code} ${task.stageName} ${task.itemName} ${task.project.client} ${task.project.number}`
    return text.toLowerCase().includes(search.trim().toLowerCase())
  })
  const open = tasks.filter((task) => task.status !== 'DONE')
  const scheduled = open
    .filter((task) => task.schedule)
    .sort((a, b) =>
      `${a.schedule!.date}${a.schedule!.start}`.localeCompare(
        `${b.schedule!.date}${b.schedule!.start}`,
      ),
    )
  const days = Array.from(new Set(scheduled.map((task) => task.schedule!.date)))
  const unscheduled = open.filter((task) => !task.schedule)
  const task = (board?.tasks || []).find((item) => item.id === taskId) || null
  const coletivo = board?.manager.timeMode === 'DRAG_DROP'

  const dropOn = async (target: TaskView) => {
    if (!dragging) return
    const res = await startWork({ id: target.id, collaboratorId: dragging })
    setDragging(null)
    if (!res.success) return toast.error(res.message)
    toast.success('Colaborador na tarefa: o relógio começou')
    await refresh()
  }

  const card = (item: TaskView) => {
    const badge = taskStatusBadge(item)
    const workers = (board?.collaborators || []).filter(
      (person) => person.working?.taskId === item.id,
    )
    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={() => setTaskId(item.id)}
        onKeyDown={(event) => event.key === 'Enter' && setTaskId(item.id)}
        onDragOver={(event) => coletivo && event.preventDefault()}
        onDrop={() => dropOn(item)}
        className={cn(
          'flex cursor-pointer gap-3 rounded-lg border bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-sm',
          dragging && !item.waitingBase
            ? 'border-dashed border-brand-400 bg-brand-25'
            : 'border-gray-200',
        )}
      >
        <span
          className="w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.taskType.color }}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-brand-700">
              {item.project.client}
              <span className="font-normal text-gray">
                {' '}
                · {item.project.number}
              </span>
            </p>
            {item.schedule && (
              <span className="text-xs text-gray">
                {item.schedule.start} · {duration(item.schedule.minutes)}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-gray">{item.itemName}</p>
          <p className="text-sm text-gray-900">
            <span className="mr-1.5 font-mono text-xs text-gray">
              {item.code}
            </span>
            {item.stageName}
            <span className="text-gray"> · {item.step.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badge.variant}>{badge.text}</Badge>
            {item.estimatedMinutes > 0 && (
              <span className="text-xs text-success-700">
                {duration(item.estimatedMinutes)}
              </span>
            )}
            {item.late && <Badge variant="errorLight">Atrasada</Badge>}
            {item.note && (
              <span className="text-xs text-warning-700" title={item.note}>
                com observação
              </span>
            )}
          </div>
          {(workers.length > 0 || item.assignee) && (
            <p className="flex items-center gap-1 text-xs text-gray-700">
              <Icon icon={IconUser} size="sm" />
              {workers.length
                ? `${workers.map((person) => person.name).join(', ')} trabalhando`
                : item.assignee?.name}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Kanban: uma coluna por etapa que passa por este gerenciador (GP-9)
  const columns = (board?.taskTypes || []).flatMap((type) =>
    type.steps
      .map((step, index) => ({ type, step, index }))
      .filter(({ step }) => step.managerId === managerId),
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Gerenciador de produção"
          supportText="A fila de cada setor, com a agenda e quem está trabalhando"
        />

        {/* Os gerenciadores, com as tarefas abertas de cada um */}
        <div className="flex flex-wrap gap-3">
          {summary.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                updateFilterParam('gerenciador', item.id, { router, params })
              }
              className={cn(
                'min-w-[150px] rounded-xl border bg-white px-4 py-3 text-left',
                item.id === managerId
                  ? 'border-brand-500 ring-1 ring-brand-500'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <span className="block text-2xl font-semibold text-gray-900">
                {item.open}
              </span>
              <span className="block text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <span className="block text-xs text-gray">
                {managerModelObj[item.model].text}
              </span>
            </button>
          ))}
        </div>

        {loadingBoard || !board ? (
          <Skeleton className="h-[360px] w-full" />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
            <div className="space-y-4 xl:col-span-3">
              {/* Filtros: rápidos, por tipo de tarefa e busca */}
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 p-4">
                  {quickFilters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setQuick((current) =>
                          current.includes(item.value)
                            ? current.filter((value) => value !== item.value)
                            : [...current, item.value],
                        )
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm',
                        quick.includes(item.value)
                          ? 'border-brand-500 bg-brand-25 font-medium text-brand-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                  <span className="mx-1 h-6 w-px bg-gray-200" />
                  {board.taskTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setHiddenTypes((current) =>
                          current.includes(type.id)
                            ? current.filter((value) => value !== type.id)
                            : [...current, type.id],
                        )
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm',
                        hiddenTypes.includes(type.id)
                          ? 'border-gray-200 text-gray-400 line-through'
                          : 'border-gray-200 text-gray-700',
                      )}
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </button>
                  ))}
                  <Input
                    aria-label="Buscar tarefa"
                    placeholder="Código, cliente, item"
                    className="ml-auto w-[220px]"
                    startAdornment={
                      <Icon icon={IconSearch} size="sm" className="text-gray" />
                    }
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </CardContent>
              </Card>

              {board.manager.model === 'KANBAN' ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {columns.map(({ type, step, index }) => {
                    const inColumn = tasks.filter(
                      (item) =>
                        item.taskTypeId === type.id && item.stepIndex === index,
                    )
                    return (
                      <div
                        key={step.id}
                        className="w-[300px] shrink-0 space-y-2 rounded-xl bg-gray-50 p-3"
                      >
                        <p className="flex items-center justify-between text-sm font-medium text-gray-800">
                          <span className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                            {step.name}
                          </span>
                          <span className="text-xs text-gray">{type.name}</span>
                        </p>
                        {inColumn
                          .filter((item) => item.status !== 'DONE')
                          .map(card)}
                        {inColumn.some((item) => item.status === 'DONE') && (
                          <p className="pt-1 text-xs text-gray">
                            {
                              inColumn.filter((item) => item.status === 'DONE')
                                .length
                            }{' '}
                            concluída(s)
                          </p>
                        )}
                        {!inColumn.length && (
                          <p className="py-4 text-center text-xs text-gray">
                            Nada nesta etapa
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="space-y-2">
                      <p className="text-sm font-semibold capitalize text-gray-800">
                        {dayLabel(day)}
                      </p>
                      {scheduled
                        .filter((item) => item.schedule!.date === day)
                        .map(card)}
                    </div>
                  ))}
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <Icon
                        icon={IconAlertTriangle}
                        size="sm"
                        className="text-warning-600"
                      />
                      Tarefas não agendadas
                      <span className="font-normal text-gray">
                        ({unscheduled.length})
                      </span>
                    </p>
                    {unscheduled.map(card)}
                    {!unscheduled.length && (
                      <p className="text-sm text-gray">Tudo agendado.</p>
                    )}
                  </div>
                  {!open.length && (
                    <p className="text-sm text-gray">
                      Nenhuma tarefa aberta com esses filtros.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Colaboradores: disponíveis e trabalhando (GP-17) */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Colaboradores</CardTitle>
                <CardDescription>
                  {timeModeObj[board.manager.timeMode].help}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                {board.collaborators.map((person) => {
                  const current = board.tasks.find(
                    (item) => item.id === person.working?.taskId,
                  )
                  return (
                    <div
                      key={person.id}
                      draggable={coletivo && !person.working}
                      onDragStart={() => setDragging(person.id)}
                      onDragEnd={() => setDragging(null)}
                      className={cn(
                        'rounded-lg border p-3',
                        person.working
                          ? 'border-success-200 bg-success-50'
                          : 'border-gray-200 bg-white',
                        coletivo && !person.working && 'cursor-grab',
                      )}
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {person.name}
                        {person.onlyAssigned && (
                          <span className="font-normal text-gray">
                            {' '}
                            · só as dele
                          </span>
                        )}
                      </p>
                      {person.working ? (
                        <>
                          <p className="text-xs text-success-700">
                            Trabalhando
                            {current
                              ? ` em ${current.code} ${current.stageName}`
                              : ''}{' '}
                            desde{' '}
                            {new Date(person.working.since).toLocaleTimeString(
                              'pt-BR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
                          <button
                            type="button"
                            className="mt-1 text-xs font-medium text-error-700 hover:underline"
                            onClick={async () => {
                              await stopWork({ collaboratorId: person.id })
                              toast.success('Relógio parado')
                              await refresh()
                            }}
                          >
                            Parar
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray">
                          {coletivo
                            ? 'Disponível · arraste para uma tarefa'
                            : 'Disponível'}
                        </p>
                      )}
                    </div>
                  )
                })}
                {!board.collaborators.length && (
                  <p className="text-sm text-gray">
                    Ninguém tem acesso a este gerenciador. Configure em
                    Configurações › Produção.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={board?.collaborators || []}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}
