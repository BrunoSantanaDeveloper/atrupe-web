'use client'

// A tela de um setor (GP-45, GP-46; 29/10/2026). O modelo é do gerenciador
// (GP-43): no coletivo (arrastar colaborador), o Quadro com as seis colunas
// da GP-28 e a caixa de colaboradores; no individual (Play & Stop), a Fila
// do dia: a lista das tarefas por dia com o relógio e as ações em cada uma.
// As duas visões existem nas duas; o modelo só escolhe a que abre.

// React / Next
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
import { ProductionFilters } from './GeneralViews'
import { duration, TaskDetailDialog } from './TaskDetailDialog'
import {
  today,
  dayLabel,
  taskMatches,
  BoardSkeleton,
  useProductionRefresh,
  type Period,
} from './shared'

// Types
import type { TaskView, TaskStatus, TaskAction } from '../manager'

// Actions
import {
  stopWork,
  getViewer,
  startWork,
  actOnTask,
  getManagerBoard,
} from '@/actions/production-manager'

// Hooks / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { updateFilterParam } from '@/lib/filter-utils'
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
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

type View = 'quadro' | 'fila'

const OPEN: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'PENDING']

export function SectorScreen({ id }: { id: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const { hasPermission } = usePermissions()
  const refresh = useProductionRefresh()

  const [taskId, setTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [person, setPerson] = useState('todos')
  const [period, setPeriod] = useState<Period>('todas')
  const [dragging, setDragging] = useState<string | null>(null)
  const [showClosed, setShowClosed] = useState(false)
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
  const collective = board?.manager.timeMode === 'DRAG_DROP'
  // O modelo escolhe a visão que abre; a pessoa pode trocar (GP-45)
  const view = (params.get('visao') as View) || (collective ? 'quadro' : 'fila')

  const filter = { search, person, period }
  const tasks = useMemo(
    () => (board?.tasks || []).filter((item) => taskMatches(item, filter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, search, person, period],
  )
  const people = board?.collaborators || []
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

  // Os botões da fila do dia (GP-28): o relógio e a ação do estado
  const actions = (item: TaskView) => {
    const me = meFor(item)
    const working = !!me && item.workers.some((worker) => worker.id === me)
    const canStart = item.status === 'NOT_STARTED' && !item.blocked
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
    const scheduled = waiting.filter((item) => item.schedule).sort(byTime)
    const days = Array.from(new Set(scheduled.map((t) => t.schedule!.date)))
    return {
      running,
      days: days.map((day) => ({
        day,
        tasks: scheduled.filter((item) => item.schedule!.date === day),
      })),
      unscheduled: waiting.filter((item) => !item.schedule),
      closed: tasks.filter((item) => !OPEN.includes(item.status)),
    }
  }, [tasks])

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
              manager.intervalMinutes > 0
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
          <p className="flex items-center gap-2 text-sm text-gray">
            <SectorIcon name={manager!.sector} size="sm" />
            {timeModeObj[manager!.timeMode]?.help}
          </p>
        </div>

        <ProductionFilters
          search={search}
          onSearch={setSearch}
          person={person}
          onPerson={setPerson}
          people={people}
          period={period}
          onPeriod={setPeriod}
        />

        {view === 'fila' ? (
          <div className="space-y-4">
            {section(
              'Em andamento',
              queue.running,
              'O relógio corre em quem está na tarefa; pausar ou abrir pendência para o tempo.',
            )}
            {queue.days.map(({ day, tasks: inDay }) =>
              section(
                day === today() ? 'Hoje' : dayLabel(day),
                inDay,
                day === today() ? 'Na ordem do horário agendado.' : undefined,
              ),
            )}
            {section(
              'Sem agendamento',
              queue.unscheduled,
              'Abra a tarefa para agendar: dia, início e duração.',
            )}
            {queue.closed.length > 0 && (
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
                  <CardTitle>Colaboradores</CardTitle>
                  <CardDescription>
                    {timeModeObj[board.manager.timeMode].help}
                  </CardDescription>
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
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}
