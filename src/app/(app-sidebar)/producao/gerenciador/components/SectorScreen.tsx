'use client'

// A tela de um setor (GP-45, GP-46; 29/10/2026). O modelo é do gerenciador
// (GP-43): no coletivo (arrastar colaborador), o Quadro com as seis colunas
// da GP-28 e a caixa de colaboradores; no individual (Play & Stop), a Fila
// do dia: a lista das tarefas por dia com o relógio e as ações em cada uma.
// As duas visões existem nas duas; o modelo só escolhe a que abre.
// Sem controle de tempo (NONE, GP-47; o modo do PRO): só a fila, ordenada
// pela entrega, e a tarefa só se conclui. Sem relógio, pessoas nem agenda.

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { PersonAvatar } from './PersonAvatar'
import { TaskCard } from './TaskCard'
import { QueueList, type QueueGroup } from './QueueList'
import { ProductionFilters } from './GeneralViews'
import { duration, TaskDetailDialog } from './TaskDetailDialog'
import {
  today,
  dayLabel,
  taskMatches,
  urgentFirst,
  BoardSkeleton,
  useProductionRefresh,
  type Period,
} from './shared'

// Types
import type { TaskView, TaskStatus, TaskAction } from '../manager'
import { NO_HOURS } from '../manager'
import { dayOff, forecastQueue, remainingOf } from '../forecast'

// Actions
import {
  stopWork,
  getViewer,
  startWork,
  actOnTask,
  scheduleTask,
  getManagerBoard,
} from '@/actions/production-manager'

// Hooks / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { updateFilterParam } from '@/lib/filter-utils'
import { FEATURES } from '@/consts/features'
import {
  timeModeObj,
  taskStatusObj,
  TASK_STATUS_ORDER,
  PRODUCTION_MANAGE,
} from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconPlayerPause,
  IconCircleCheck,
  IconCalendarPlus,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

type View = 'quadro' | 'fila'
type QueueTab = 'a-fazer' | 'concluidos'

const OPEN: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'PENDING']

export function SectorScreen({ id }: { id: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { hasPermission } = usePermissions()
  const { hasFeature } = usePlanFeatures()
  const refresh = useProductionRefresh()

  const [taskId, setTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [person, setPerson] = useState('todos')
  const [machine, setMachine] = useState('todas')
  const [period, setPeriod] = useState<Period>('todas')
  const [dragging, setDragging] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)
  const [queueTab, setQueueTab] = useState<QueueTab>('a-fazer')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [finishing, setFinishing] = useState(false)
  const isManager = hasPermission(PRODUCTION_MANAGE[0])

  const { data: viewerRes } = useQuery({
    queryKey: ['production-viewer'],
    queryFn: () => getViewer(),
    staleTime: 60_000,
  })
  const viewer = viewerRes?.data || {
    collaboratorId: null,
    name: null,
    manager: isManager,
  }

  const { data: boardRes, isLoading } = useQuery({
    queryKey: ['production-board', id],
    queryFn: () => getManagerBoard({ managerId: id }),
    enabled: !!id,
  })
  const board = boardRes?.data
  // Sem tempo: o gerenciador NONE, ou o plano sem production_manager (PRO)
  const timeless =
    board?.manager.timeMode === 'NONE' ||
    !hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
  const collective = !timeless && board?.manager.timeMode === 'DRAG_DROP'
  // O modelo escolhe a visão que abre; a pessoa pode trocar (GP-45)
  const view = timeless
    ? 'fila'
    : (params.get('visao') as View) || (collective ? 'quadro' : 'fila')

  const filter = { search, person, period, machine }
  const tasks = useMemo(
    () =>
      urgentFirst(
        (board?.tasks || []).filter((item) => taskMatches(item, filter)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, search, person, period, machine],
  )
  const people = board?.collaborators || []
  // As máquinas das tarefas do setor: a fila por máquina na impressão
  const machines = useMemo(
    () =>
      Array.from(
        new Set((board?.tasks || []).map((item) => item.machine || '')),
      )
        .filter(Boolean)
        .sort(),
    [board],
  )
  const task = (board?.tasks || []).find((item) => item.id === taskId) || null

  const dropOn = async (target: TaskView) => {
    if (!dragging) return
    const res = await startWork({
      id: target.id,
      collaboratorId: dragging,
      source: 'DRAG',
    })
    setDragging(null)
    if (!res.success) return toast.error(res.message)
    toast.success('Colaborador na tarefa: o relógio começou')
    await refresh()
  }

  // Na fila do dia, quem age é a pessoa da sessão; o gerente, sem
  // colaborador ligado, age pela pessoa atribuída ou pela primeira com acesso
  const meFor = (item: TaskView) =>
    viewer.collaboratorId || item.assigneeId || people[0]?.id || null

  const act = async (item: TaskView, action: TaskAction, success: string) => {
    const collaboratorId = meFor(item)
    const res = await actOnTask({ id: item.id, action, collaboratorId })
    if (!res.success) return toast.error(res.message)
    if (action === 'START' && collaboratorId) {
      await startWork({ id: item.id, collaboratorId })
    }
    toast.success(success)
    await refresh()
  }

  const clock = async (item: TaskView) => {
    const collaboratorId = meFor(item)
    if (!collaboratorId)
      return toast.error('Ligue seu usuário a um colaborador')
    const working = item.workers.some((worker) => worker.id === collaboratorId)
    const res = working
      ? await stopWork({ id: item.id, collaboratorId })
      : await startWork({ id: item.id, collaboratorId })
    if (!res.success) return toast.error(res.message)
    toast.success(working ? 'Relógio parado' : 'Relógio ligado')
    await refresh()
  }

  // Os botões da fila do dia (GP-28): o relógio e a ação do estado.
  // Sem tempo (GP-47), só Concluir e, na pendência, Continuar
  const actions = (item: TaskView) => {
    const me = meFor(item)
    const working = !!me && item.workers.some((worker) => worker.id === me)
    const canStart = item.status === 'NOT_STARTED' && !item.blocked
    if (timeless)
      return (
        <>
          {item.status === 'PENDING' ? (
            <Button
              size="sm"
              variant="neutralOutline"
              onClick={() => act(item, 'RESUME', 'Pendência resolvida')}
            >
              <Icon icon={IconPlayerPlay} size="sm" />
              Continuar
            </Button>
          ) : (
            !item.blocked && (
              <Button
                size="sm"
                onClick={() => act(item, 'FINISH', 'Etapa concluída')}
              >
                <Icon icon={IconCircleCheck} size="sm" />
                Concluir
              </Button>
            )
          )}
          {item.blocked && item.status === 'NOT_STARTED' && (
            <span className="text-xs text-gray">
              Espera {item.blockedBy || 'a etapa anterior'}
            </span>
          )}
        </>
      )
    return (
      <>
        {canStart && (
          <Button
            size="sm"
            onClick={() => act(item, 'START', 'Tarefa iniciada')}
          >
            <Icon icon={IconPlayerPlay} size="sm" />
            Iniciar
          </Button>
        )}
        {item.status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            variant={working ? 'error' : 'neutralOutline'}
            onClick={() => clock(item)}
          >
            <Icon icon={working ? IconPlayerStop : IconPlayerPlay} size="sm" />
            {working ? 'Parar relógio' : 'Iniciar relógio'}
          </Button>
        )}
        {item.status === 'IN_PROGRESS' && (
          <Button
            size="sm"
            variant="neutralOutline"
            onClick={() => act(item, 'PAUSE', 'Tarefa pausada')}
          >
            <Icon icon={IconPlayerPause} size="sm" />
            Pausar
          </Button>
        )}
        {(item.status === 'PAUSED' || item.status === 'PENDING') && (
          <Button
            size="sm"
            variant="neutralOutline"
            onClick={() => act(item, 'RESUME', 'Tarefa retomada')}
          >
            <Icon icon={IconPlayerPlay} size="sm" />
            Continuar
          </Button>
        )}
        {(item.status === 'IN_PROGRESS' || item.status === 'PAUSED') && (
          <Button
            size="sm"
            variant="neutralOutline"
            onClick={() => act(item, 'FINISH', 'Etapa concluída')}
          >
            <Icon icon={IconCircleCheck} size="sm" />
            Concluir
          </Button>
        )}
        {item.blocked && item.status === 'NOT_STARTED' && (
          <span className="text-xs text-gray">
            Espera {item.blockedBy || 'a etapa anterior'}
          </span>
        )}
        {/* Sem agendamento: no lugar da previsão, Agendar (GP-48 item 7) */}
        {!item.schedule && item.status === 'NOT_STARTED' && (
          <Button
            size="sm"
            variant="neutralOutline"
            onClick={() => setTaskId(item.id)}
          >
            <Icon icon={IconCalendarPlus} size="sm" />
            Agendar
          </Button>
        )}
      </>
    )
  }

  // A fila do dia: o que está andando, depois por dia, depois sem agenda;
  // as fechadas ficam recolhidas no fim
  const queue = useMemo(() => {
    const open = tasks.filter((item) => OPEN.includes(item.status))
    const running = open.filter((item) => item.status !== 'NOT_STARTED')
    const waiting = open.filter((item) => item.status === 'NOT_STARTED')
    const byTime = (a: TaskView, b: TaskView) =>
      `${a.schedule!.date} ${a.schedule!.start}`.localeCompare(
        `${b.schedule!.date} ${b.schedule!.start}`,
      )
    const scheduled = urgentFirst(
      waiting.filter((item) => item.schedule).sort(byTime),
    )
    const days = Array.from(new Set(scheduled.map((t) => t.schedule!.date)))
    // Sem tempo não há agenda: a fila segue a entrega da ordem
    const byDue = (a: TaskView, b: TaskView) =>
      a.project.due.localeCompare(b.project.due)
    return {
      running,
      days: days.map((day) => ({
        day,
        tasks: scheduled.filter((item) => item.schedule!.date === day),
      })),
      unscheduled: urgentFirst(
        timeless
          ? [...waiting].sort(byDue)
          : waiting.filter((item) => !item.schedule),
      ),
      closed: tasks.filter((item) => !OPEN.includes(item.status)),
    }
  }, [tasks, timeless])

  // A previsão da fila, pela sequência de cada máquina (GP-48 itens 4 e 5)
  const forecasts = useMemo(() => {
    const now = new Date()
    return forecastQueue(tasks, {
      hours: board?.manager.hours || NO_HOURS,
      intervalMinutes: board?.manager.intervalMinutes || 0,
      liveSchedule: board?.manager.liveSchedule || 'WARN',
      today: today(),
      nowMinutes: now.getHours() * 60 + now.getMinutes(),
      calendar: board?.calendar,
    })
  }, [tasks, board])

  const listGroups: QueueGroup[] =
    queueTab === 'concluidos'
      ? [
          {
            key: 'fechadas',
            title: 'Concluídas e canceladas',
            tasks: queue.closed,
          },
        ]
      : [
          {
            key: 'andamento',
            title: 'Em andamento',
            hint: 'O pausado continua pelo tempo que falta.',
            tasks: queue.running,
          },
          ...queue.days.map(({ day, tasks: inDay }) => {
            const off = dayOff(day, board?.calendar)
            return {
              key: day,
              title: day === today() ? 'Hoje' : dayLabel(day),
              alert: !!off,
              hint: off
                ? off === 'HOLIDAY'
                  ? 'Feriado: dá para agendar, mas o dia fica em vermelho.'
                  : 'Dia sem expediente: dá para agendar, mas fica em vermelho.'
                : undefined,
              minutes: inDay.reduce(
                (sum, item) => sum + (item.schedule?.minutes || 0),
                0,
              ),
              tasks: inDay,
              sortable: true,
            }
          }),
          {
            key: 'sem-agenda',
            title: 'Sem agendamento',
            hint: 'Na ordem de chegada. Agende o dia para entrar na fila da máquina.',
            tasks: queue.unscheduled,
          },
        ]

  const openTasks = tasks.filter((item) => OPEN.includes(item.status))
  const totals = {
    open: openTasks.length,
    minutes: openTasks.reduce((sum, item) => sum + remainingOf(item), 0),
    urgent: openTasks.filter((item) => item.priority === 'URGENT').length,
    // Reagenda e avisa: quantos andaram pela sequência (GP-48 item 20)
    moved: Array.from(forecasts.values()).filter(
      (forecast) => forecast.delayMinutes > 0,
    ).length,
  }

  const select = (taskIdToSelect: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(taskIdToSelect)
      else next.delete(taskIdToSelect)
      return next
    })

  // Concluir em lote (GP-48 item 10): cada uma pela ação de concluir
  const finishSelected = async () => {
    const chosen = (board?.tasks || []).filter(
      (item) => selected.has(item.id) && OPEN.includes(item.status),
    )
    setFinishing(true)
    let failed = 0
    for (const item of chosen) {
      const res = await actOnTask({
        id: item.id,
        action: 'FINISH',
        collaboratorId: meFor(item),
      })
      if (!res.success) failed += 1
    }
    setFinishing(false)
    setSelected(new Set())
    if (failed) {
      toast.error(
        `${chosen.length - failed} concluída(s); ${failed} não puderam ser concluídas`,
      )
    } else {
      toast.success(`${chosen.length} tarefa(s) concluída(s)`)
    }
    await refresh()
  }

  // Arrastar troca as vagas: os horários ficam, os trabalhos trocam (item 6)
  const swapSlots = async (dragged: TaskView, target: TaskView) => {
    if (!dragged.schedule || !target.schedule) return
    const [a, b] = await Promise.all([
      scheduleTask({
        id: dragged.id,
        schedule: { ...dragged.schedule, start: target.schedule.start },
      }),
      scheduleTask({
        id: target.id,
        schedule: { ...target.schedule, start: dragged.schedule.start },
      }),
    ])
    if (!a.success || !b.success) {
      toast.error(a.success ? b.message : a.message)
    } else {
      toast.success('Ordem trocada')
    }
    await refresh()
  }

  const section = (title: string, items: TaskView[], hint?: string) => (
    <Card key={title}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title.charAt(0).toUpperCase() + title.slice(1)}
          <span className="font-normal text-gray">({items.length})</span>
        </CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 lg:grid-cols-2">
        {items.map((item) => (
          <TaskCard
            key={item.id}
            item={item}
            onOpen={setTaskId}
            actions={actions(item)}
            timeless={timeless}
          />
        ))}
        {!items.length && <p className="text-sm text-gray">Nada aqui.</p>}
      </CardContent>
    </Card>
  )

  const manager = board?.manager
  const topbar = (
    <Topbar
      title={manager?.name || 'Gerenciador'}
      previousPage="/producao/gerenciador"
      supportText={
        manager
          ? [
              manager.sector,
              timeModeObj[manager.timeMode]?.text,
              !timeless && manager.intervalMinutes > 0
                ? `${manager.intervalMinutes} min entre tarefas`
                : null,
              board && board.hidden > 0
                ? `${board.hidden} tarefa(s) fora do seu acesso`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : undefined
      }
    />
  )

  if (isLoading || !board)
    return (
      <div className="space-y-5">
        {topbar}
        <BoardSkeleton />
      </div>
    )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {topbar}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {!timeless && (
            <Tabs
              value={view}
              variant="pill"
              onValueChange={(value) =>
                updateFilterParam('visao', value, { router, params })
              }
            >
              <TabsList>
                <TabsTrigger value="fila">Fila do dia</TabsTrigger>
                <TabsTrigger value="quadro">Quadro</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <p className="flex items-center gap-2 text-sm text-gray">
            <SectorIcon name={manager!.sector} size="sm" />
            {timeless
              ? timeModeObj.NONE.help
              : timeModeObj[manager!.timeMode]?.help}
          </p>
        </div>

        <ProductionFilters
          search={search}
          onSearch={setSearch}
          person={timeless ? undefined : person}
          onPerson={timeless ? undefined : setPerson}
          people={timeless ? undefined : people}
          machine={machine}
          onMachine={setMachine}
          machines={machines}
          period={period}
          onPeriod={setPeriod}
        />

        {view === 'fila' ? (
          <div className="space-y-4">
            {timeless ? (
              <>
                {queue.running.length > 0 &&
                  section(
                    'Com pendência',
                    queue.running,
                    'Resolva a pendência e continue; depois, conclua.',
                  )}
                {section(
                  'A fazer',
                  queue.unscheduled,
                  'Na ordem da entrega. Concluir passa a tarefa para a próxima etapa.',
                )}
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Tabs
                    value={queueTab}
                    variant="pill"
                    onValueChange={(value) => {
                      setQueueTab(value as QueueTab)
                      setSelected(new Set())
                    }}
                  >
                    <TabsList>
                      <TabsTrigger value="a-fazer">A fazer</TabsTrigger>
                      <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                    <span>
                      <strong className="font-semibold text-gray-900">
                        {totals.open}
                      </strong>{' '}
                      a fazer
                    </span>
                    <span>
                      <strong className="font-semibold text-gray-900">
                        {duration(totals.minutes)}
                      </strong>{' '}
                      previstas
                    </span>
                    {totals.urgent > 0 && (
                      <span className="text-error-700">
                        <strong className="font-semibold">
                          {totals.urgent}
                        </strong>{' '}
                        urgente(s)
                      </span>
                    )}
                  </p>
                </div>
                {board.manager.liveSchedule === 'RESCHEDULE' &&
                  totals.moved > 0 && (
                    <p className="rounded-lg border border-warning-200 bg-warning-25 px-4 py-2 text-sm text-warning-800">
                      {totals.moved} trabalho(s) andaram na sequência da máquina
                      por causa de um atraso. A previsão mostra o horário novo e
                      o que era antes.
                    </p>
                  )}
                {selected.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-brand-200 bg-brand-25 px-4 py-2">
                    <span className="text-sm text-gray-800">
                      {selected.size} selecionada(s)
                    </span>
                    <Button
                      size="sm"
                      isLoading={finishing}
                      onClick={finishSelected}
                    >
                      <Icon icon={IconCircleCheck} size="sm" />
                      Concluir {selected.size}
                    </Button>
                    <Button
                      size="sm"
                      variant="neutralOutline"
                      onClick={() => setSelected(new Set())}
                    >
                      Limpar seleção
                    </Button>
                  </div>
                )}
                <QueueList
                  groups={listGroups}
                  forecasts={forecasts}
                  selected={selected}
                  onSelect={select}
                  onOpen={setTaskId}
                  actions={actions}
                  onReorder={queueTab === 'a-fazer' ? swapSlots : undefined}
                  showForecast={queueTab === 'a-fazer'}
                />
              </>
            )}
            {timeless && queue.closed.length > 0 && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="neutralOutline"
                  size="sm"
                  onClick={() => setShowClosed((value) => !value)}
                >
                  {showClosed ? 'Ocultar' : 'Mostrar'} concluídas e canceladas (
                  {queue.closed.length})
                </Button>
                {showClosed && section('Concluídas e canceladas', queue.closed)}
              </div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'grid grid-cols-1 gap-5',
              collective && 'xl:grid-cols-4',
            )}
          >
            <div className={cn('space-y-3', collective && 'xl:col-span-3')}>
              {/* As seis colunas da GP-28 */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {TASK_STATUS_ORDER.map((status: TaskStatus) => {
                  const inColumn = tasks.filter(
                    (item) => item.status === status,
                  )
                  return (
                    <div
                      key={status}
                      className="w-[290px] shrink-0 space-y-2 rounded-xl bg-gray-50 p-3"
                    >
                      <p className="flex items-center justify-between text-sm font-medium text-gray-800">
                        <Badge variant={taskStatusObj[status].variant} status>
                          {taskStatusObj[status].text}
                        </Badge>
                        <span className="text-xs text-gray">
                          {inColumn.length}
                        </span>
                      </p>
                      {inColumn.map((item) => (
                        <TaskCard
                          key={item.id}
                          item={item}
                          onOpen={setTaskId}
                          droppable={collective}
                          dragging={dragging}
                          onDrop={dropOn}
                        />
                      ))}
                      {!inColumn.length && (
                        <p className="py-4 text-center text-xs text-gray">
                          Nada aqui
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Colaboradores: disponíveis e trabalhando (GP-17), só no
                coletivo, onde arrastar é o gesto que liga o relógio */}
            {collective && (
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center gap-1.5">
                    <CardTitle>Colaboradores</CardTitle>
                    <InfoHint title="Colaboradores">
                      <p>{timeModeObj[board.manager.timeMode].help}</p>
                    </InfoHint>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-4">
                  {people.map((worker) => {
                    const current = board.tasks.find(
                      (item) => item.id === worker.working?.taskId,
                    )
                    return (
                      <div
                        key={worker.id}
                        draggable={!worker.working}
                        onDragStart={() => setDragging(worker.id)}
                        onDragEnd={() => setDragging(null)}
                        className={cn(
                          'rounded-lg border p-3',
                          worker.working
                            ? 'border-success-200 bg-success-50'
                            : 'cursor-grab border-gray-200 bg-white',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <PersonAvatar name={worker.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800">
                              {worker.name}
                              {worker.onlyAssigned && (
                                <span className="font-normal text-gray">
                                  {' '}
                                  · só as dele
                                </span>
                              )}
                            </p>
                            {worker.working ? (
                              <>
                                <p className="text-xs text-success-700">
                                  Em{' '}
                                  {current
                                    ? `${current.code} ${current.stageName}`
                                    : 'outra tarefa'}{' '}
                                  desde{' '}
                                  {new Date(
                                    worker.working.since,
                                  ).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {current
                                    ? ` · ${duration(current.actualMinutes)} apontado`
                                    : ''}
                                </p>
                                <button
                                  type="button"
                                  className="mt-1 text-xs font-medium text-error-700 hover:underline"
                                  onClick={async () => {
                                    await stopWork({
                                      id: worker.working?.taskId,
                                      collaboratorId: worker.id,
                                    })
                                    toast.success('Relógio parado')
                                    await refresh()
                                  }}
                                >
                                  Parar
                                </button>
                              </>
                            ) : (
                              <p className="text-xs text-gray">
                                Disponível · arraste para uma tarefa
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!people.length && (
                    <p className="text-sm text-gray">
                      Ninguém tem acesso a este gerenciador. Configure em
                      Configurações › Produção.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={people}
        vehicles={board.vehicles || []}
        viewerCollaboratorId={viewer.collaboratorId}
        timeless={timeless}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}
