'use client'

// O gerenciador de produção do ELITE (área 9 §4.14), tela por tela:
// - Quadro do setor: os gerenciadores como abas segmentadas; colunas pelos
//   seis estados da etapa (GP-28); cartões com a imagem do item, o trabalho,
//   o cliente, o prazo, o previsto × apontado, a pessoa e o alerta de risco;
//   filtros por pessoa, período e busca; no coletivo, arrastar o colaborador
//   para a tarefa (GP-43).
// - Agenda viva: as tarefas agendadas de todos os setores por dia, com a
//   cadeia de produção avisando o atraso (§12.2); reagendar é manual.
// - Veículos: a ocupação da frota por dia (VS-7).
// Quem vê o quê (GP-11): o gerente vê tudo; o operador, o que o acesso dele
// ao gerenciador permite.

// React / Next
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { SelectBasic } from '@/components/common/form/FormSelect'
import { duration, taskStatusBadge, TaskDetailDialog } from './TaskDetailDialog'

// Types
import type { TaskView, TaskStatus } from '../manager'

// Actions
import {
  stopWork,
  getAgenda,
  getViewer,
  startWork,
  getManagerBoard,
  getManagerSummary,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { useSectorColor } from '@/hooks/useSectorColor'
import { updateFilterParam } from '@/lib/filter-utils'
import {
  timeModeObj,
  taskStatusObj,
  TASK_STATUS_ORDER,
  PRODUCTION_MANAGE,
} from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconLock,
  IconUser,
  IconSearch,
  IconTruck,
  IconPaperclip,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10)

const dayLabel = (date: string) =>
  date === today()
    ? 'Hoje'
    : new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      })

const shortDate = (date: string) =>
  date.split('-').reverse().slice(0, 2).join('/')

const endTime = (start: string, minutes: number) => {
  const [hours, mins] = start.split(':').map(Number)
  const total = hours * 60 + mins + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

type View = 'quadro' | 'agenda' | 'veiculos'
type Period = 'todas' | 'hoje' | 'semana' | 'sem-agenda'

const periodOptions: { value: Period; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Próximos 7 dias' },
  { value: 'sem-agenda', label: 'Sem agendamento' },
]

const inPeriod = (task: TaskView, period: Period) => {
  if (period === 'todas') return true
  if (period === 'sem-agenda') return !task.schedule
  if (!task.schedule) return false
  if (period === 'hoje') return task.schedule.date === today()
  return task.schedule.date >= today() && task.schedule.date <= addDays(7)
}

// Forma do quadro (a linha do gerenciador e as seis colunas da GP-28)
// enquanto carrega
function BoardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-64" />
      <div className="flex gap-3 overflow-hidden pb-2">
        {TASK_STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="w-[290px] shrink-0 space-y-2 rounded-xl bg-gray-50 p-3"
          >
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Forma da agenda e dos veículos (um cartão por dia ou por veículo)
// enquanto carrega
function AgendaSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }, (_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, item) => (
              <Skeleton key={item} className="h-24 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ManagerBoard() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const colorOf = useSectorColor()

  const [taskId, setTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [person, setPerson] = useState('todos')
  const [period, setPeriod] = useState<Period>('todas')
  const [dragging, setDragging] = useState<string | null>(null)

  const view = (params.get('visao') as View) || 'quadro'
  const isManager = hasPermission(PRODUCTION_MANAGE[0])

  // Quem está olhando (GP-11): o servidor decide pela sessão
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

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['production-summary'],
    queryFn: () => getManagerSummary(),
  })
  const summary = summaryRes?.data || []
  const managerId = params.get('gerenciador') || summary[0]?.id || ''

  const { data: boardRes, isLoading: loadingBoard } = useQuery({
    queryKey: ['production-board', managerId],
    queryFn: () => getManagerBoard({ managerId }),
    enabled: !!managerId && view === 'quadro',
  })
  const board = boardRes?.data

  const { data: agendaRes, isLoading: loadingAgenda } = useQuery({
    queryKey: ['production-agenda', period],
    queryFn: () =>
      getAgenda({
        from: period === 'semana' || period === 'hoje' ? today() : addDays(-30),
        to: period === 'hoje' ? today() : addDays(period === 'semana' ? 7 : 60),
      }),
    enabled: view !== 'quadro',
  })
  const agenda = agendaRes?.data

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['production-board'] }),
      queryClient.invalidateQueries({ queryKey: ['production-summary'] }),
      queryClient.invalidateQueries({ queryKey: ['production-agenda'] }),
      queryClient.invalidateQueries({ queryKey: ['production-project'] }),
      queryClient.invalidateQueries({ queryKey: ['production-projects'] }),
    ])

  const matches = (task: TaskView) => {
    if (person !== 'todos') {
      const mine =
        task.assigneeId === person ||
        task.workers.some((worker) => worker.id === person)
      if (!mine) return false
    }
    if (!inPeriod(task, period)) return false
    const text = `${task.code} ${task.stageName} ${task.itemName} ${task.project.client} ${task.project.number}`
    return text.toLowerCase().includes(search.trim().toLowerCase())
  }

  const boardTasks = useMemo(
    () => (board?.tasks || []).filter(matches),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [board, person, period, search],
  )

  const allTasks = [
    ...(board?.tasks || []),
    ...(agenda?.scheduled || []),
    ...(agenda?.unscheduled || []),
  ]
  const task = allTasks.find((item) => item.id === taskId) || null
  const collective = board?.manager.timeMode === 'DRAG_DROP'

  // O Topbar não depende do resumo: aparece já, também na carga
  const topbar = (
    <Topbar
      title="Gerenciador de produção"
      supportText={
        viewer.manager
          ? 'Todos os setores: você vê tudo'
          : viewer.name
            ? `Olá, ${viewer.name}: as tarefas do seu setor ou atribuídas a você`
            : 'Seu usuário não está ligado a um colaborador da produção'
      }
      paramName="gerenciador"
      activeTab={managerId}
      tabs={summary.map((item) => ({
        value: item.id,
        tab: item.id,
        label: item.name,
        count: item.open,
      }))}
    />
  )

  // Abaixo do Topbar, a forma das abas dos gerenciadores, das visões, dos
  // filtros e do quadro (ou da agenda) até o resumo chegar
  if (loadingSummary)
    return (
      <div className="space-y-5">
        {topbar}
        <Skeleton className="h-[42px] w-full max-w-[480px] rounded-lg" />
        <Skeleton className="h-[42px] w-[340px] max-w-full rounded-lg" />
        <Skeleton className="h-[74px] w-full rounded-xl" />
        {view === 'quadro' ? <BoardSkeleton /> : <AgendaSkeleton />}
      </div>
    )

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

  // O cartão da tarefa: imagem, trabalho, cliente, prazo, previsto ×
  // apontado, pessoa e o alerta (GP-39, GP-42)
  const card = (item: TaskView, options: { showSector?: boolean } = {}) => {
    const badge = taskStatusBadge(item)
    const color = colorOf(item.sector)
    const open = item.status !== 'DONE' && item.status !== 'CANCELED'
    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={() => setTaskId(item.id)}
        onKeyDown={(event) => event.key === 'Enter' && setTaskId(item.id)}
        onDragOver={(event) => collective && open && event.preventDefault()}
        onDrop={() => dropOn(item)}
        className={cn(
          'flex cursor-pointer gap-3 rounded-lg border bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-sm',
          dragging && !item.blocked && open
            ? 'border-dashed border-brand-400 bg-brand-25'
            : 'border-gray-200',
          item.alert && 'border-l-4',
        )}
        style={item.alert ? { borderLeftColor: '#D92D20' } : undefined}
      >
        {item.itemImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.itemImage}
            alt={item.itemName}
            className="size-14 shrink-0 rounded-lg border object-cover"
            style={{ borderColor: `${color}66` }}
          />
        ) : (
          <SectorIcon name={item.sector} size="lg" className="size-14" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-x-2">
            <p className="truncate text-sm font-medium text-gray-900">
              {item.stageName}
              {options.showSector && (
                <span className="font-normal text-gray"> · {item.sector}</span>
              )}
            </p>
            <span className="font-mono text-xs text-gray">{item.code}</span>
          </div>
          <p className="truncate text-xs text-gray-700">{item.itemName}</p>
          <p className="truncate text-xs text-gray">
            {item.project.client} · {item.project.number} · entrega{' '}
            {shortDate(item.project.due)}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={badge.variant} size="sm">
              {badge.text}
            </Badge>
            <span className="text-xs text-gray-700">
              {duration(item.estimatedMinutes)} previsto ·{' '}
              {duration(item.actualMinutes)} apontado
            </span>
            {item.schedule && (
              <span className="text-xs text-gray">
                {shortDate(item.schedule.date)} {item.schedule.start}
              </span>
            )}
            {item.attachments.length > 0 && (
              <Icon
                icon={IconPaperclip}
                size="sm"
                label="Tem anexos"
                className="text-gray"
              />
            )}
            {item.vehicleId && (
              <Icon
                icon={IconTruck}
                size="sm"
                label="Com veículo"
                className="text-gray"
              />
            )}
            {item.blocked && item.status === 'NOT_STARTED' && (
              <Icon
                icon={IconLock}
                size="sm"
                label="Bloqueada"
                className="text-gray"
              />
            )}
          </div>
          {(item.workers.length > 0 || item.assignee) && (
            <p className="flex items-center gap-1 text-xs text-gray-700">
              <Icon icon={IconUser} size="sm" />
              {item.workers.length
                ? `${item.workers.map((worker) => worker.name).join(', ')} na tarefa`
                : item.assignee?.name}
            </p>
          )}
          {item.alert && (
            <p className="flex items-start gap-1 text-xs text-error-700">
              <Icon
                icon={IconAlertTriangle}
                size="sm"
                className="mt-0.5 shrink-0"
              />
              {item.alert.kind === 'OVERDUE'
                ? 'Passou do horário planejado'
                : item.alert.kind === 'LATE_PREDECESSOR'
                  ? 'Etapa anterior atrasou'
                  : 'Entrega em risco'}
            </p>
          )}
        </div>
      </div>
    )
  }

  const people = board?.collaborators || []
  const personOptions = [
    { value: 'todos', label: 'Todas as pessoas' },
    ...people.map((item) => ({ value: item.id, label: item.name })),
  ]

  const filters = (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        <Input
          aria-label="Buscar tarefa"
          placeholder="Código, cliente, item"
          className="w-full sm:w-[240px]"
          startAdornment={
            <Icon icon={IconSearch} size="sm" className="text-gray" />
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {view === 'quadro' && (
          <SelectBasic
            name="board-person"
            label=""
            className="w-[200px]"
            options={personOptions}
            value={person}
            onChange={(value) => value && setPerson(String(value))}
          />
        )}
        <Tabs
          value={period}
          variant="pill"
          onValueChange={(value) => setPeriod(value as Period)}
        >
          <TabsList>
            {periodOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {topbar}

        {/* As três visões (abas segmentadas, não cartões-botão) */}
        <Tabs
          value={view}
          variant="pill"
          onValueChange={(value) =>
            updateFilterParam('visao', value, { router, params })
          }
        >
          <TabsList>
            <TabsTrigger value="quadro">Quadro do setor</TabsTrigger>
            <TabsTrigger value="agenda">Agenda viva</TabsTrigger>
            <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          </TabsList>
        </Tabs>

        {filters}

        {view === 'quadro' ? (
          loadingBoard || !board ? (
            <BoardSkeleton />
          ) : (
            <div
              className={cn(
                'grid grid-cols-1 gap-5',
                collective && 'xl:grid-cols-4',
              )}
            >
              <div className={cn('space-y-3', collective && 'xl:col-span-3')}>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray">
                  <SectorIcon name={board.manager.sector} size="sm" />
                  <span className="font-medium text-gray-800">
                    {board.manager.name}
                  </span>
                  <span>· {timeModeObj[board.manager.timeMode].text}</span>
                  {board.manager.intervalMinutes > 0 && (
                    <span>
                      · {board.manager.intervalMinutes} min entre tarefas
                    </span>
                  )}
                  {board.hidden > 0 && (
                    <span>· {board.hidden} tarefa(s) fora do seu acesso</span>
                  )}
                </div>
                {/* As seis colunas da GP-28 */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {TASK_STATUS_ORDER.map((status: TaskStatus) => {
                    const inColumn = boardTasks.filter(
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
                        {inColumn.map((item) => card(item))}
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
          )
        ) : loadingAgenda || !agenda ? (
          <AgendaSkeleton />
        ) : view === 'agenda' ? (
          <AgendaView
            scheduled={agenda.scheduled.filter(matches)}
            unscheduled={agenda.unscheduled.filter(matches)}
            card={(item) => card(item, { showSector: true })}
          />
        ) : (
          <VehiclesView
            vehicles={agenda.vehicles}
            scheduled={agenda.scheduled.filter(matches)}
            onOpen={setTaskId}
          />
        )}
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={board?.collaborators || []}
        vehicles={board?.vehicles || agenda?.vehicles || []}
        viewerCollaboratorId={viewer.collaboratorId}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}

/* ---------------------------------------------------------------------------
 * Agenda viva (§4.8): por dia, com horário, duração e a cadeia avisando.
 * Sem reagendamento automático: quem reagenda abre a tarefa (§12.2)
 * ------------------------------------------------------------------------- */

function AgendaView({
  scheduled,
  unscheduled,
  card,
}: {
  scheduled: TaskView[]
  unscheduled: TaskView[]
  card: (item: TaskView) => JSX.Element
}) {
  const days = Array.from(new Set(scheduled.map((task) => task.schedule!.date)))
  const alerts = scheduled.filter((task) => task.alert).length
  return (
    <div className="space-y-4">
      {alerts > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          <Icon
            icon={IconAlertTriangle}
            size="sm"
            className="mt-0.5 shrink-0"
          />
          {alerts === 1
            ? 'Uma etapa está com alerta na cadeia de produção.'
            : `${alerts} etapas estão com alerta na cadeia de produção.`}{' '}
          O aviso some quando a etapa anterior terminar ou o reagendamento fizer
          a cadeia caber no prazo. Nada é remarcado sozinho.
        </p>
      )}
      {days.map((day) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle className="capitalize">{dayLabel(day)}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
            {scheduled
              .filter((task) => task.schedule!.date === day)
              .map((task) => (
                <div key={task.id} className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">
                    {task.schedule!.start} –{' '}
                    {endTime(task.schedule!.start, task.schedule!.minutes)}
                    {task.machine ? ` · ${task.machine}` : ''}
                    {task.vehicleId ? ' · com veículo' : ''}
                  </p>
                  {card(task)}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      {!days.length && (
        <p className="text-sm text-gray">Nada agendado neste período.</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon
              icon={IconAlertTriangle}
              size="sm"
              className="text-warning-600"
            />
            Tarefas não agendadas
            <span className="font-normal text-gray">
              ({unscheduled.length})
            </span>
          </CardTitle>
          <CardDescription>
            Abra a tarefa para agendar: dia, início e duração. O preparo ocupa a
            máquina junto com a produção.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
          {unscheduled.map(card)}
          {!unscheduled.length && (
            <p className="text-sm text-gray">Tudo agendado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------------------------------------------------------------------------
 * Veículos (VS-7): a ocupação da frota por dia, com km e horário; duas
 * saídas no mesmo horário aparecem como conflito
 * ------------------------------------------------------------------------- */

function VehiclesView({
  vehicles,
  scheduled,
  onOpen,
}: {
  vehicles: { id: string; name: string; plate: string }[]
  scheduled: TaskView[]
  onOpen: (id: string) => void
}) {
  const withVehicle = scheduled.filter((task) => task.vehicleId)
  const days = Array.from(
    new Set(withVehicle.map((task) => task.schedule!.date)),
  )
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  const overlaps = (a: TaskView, b: TaskView) => {
    const startA = toMinutes(a.schedule!.start)
    const endA = startA + a.schedule!.minutes
    const startB = toMinutes(b.schedule!.start)
    const endB = startB + b.schedule!.minutes
    return startA < endB && startB < endA
  }
  return (
    <div className="space-y-4">
      {!vehicles.length && (
        <p className="text-sm text-gray">
          Nenhum veículo cadastrado. Cadastre em Configurações › Produção ›
          Veículos.
        </p>
      )}
      {vehicles.map((vehicle) => {
        const own = withVehicle.filter((task) => task.vehicleId === vehicle.id)
        const km = own.reduce((sum, task) => sum + (task.km || 0), 0)
        return (
          <Card key={vehicle.id}>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <div className="flex items-center gap-3">
                <SectorIcon name="Frota" size="lg" />
                <div>
                  <CardTitle>{vehicle.name}</CardTitle>
                  <CardDescription>
                    {vehicle.plate} · {own.length} saída(s) · {km} km previstos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {days.map((day) => {
                const inDay = own.filter((task) => task.schedule!.date === day)
                if (!inDay.length) return null
                return (
                  <div key={day} className="space-y-1">
                    <p className="text-sm font-medium capitalize text-gray-800">
                      {dayLabel(day)}
                    </p>
                    {inDay.map((task) => {
                      const conflict = inDay.some(
                        (other) =>
                          other.id !== task.id && overlaps(task, other),
                      )
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => onOpen(task.id)}
                          className={cn(
                            'flex w-full flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm hover:border-brand-300',
                            conflict
                              ? 'border-error-300 bg-error-50'
                              : 'border-gray-200 bg-white',
                          )}
                        >
                          <span className="font-medium text-gray-800">
                            {task.schedule!.start} –{' '}
                            {endTime(
                              task.schedule!.start,
                              task.schedule!.minutes,
                            )}
                          </span>
                          <SectorIcon name={task.sector} size="sm" />
                          <span className="text-gray-800">
                            {task.stageName} · {task.itemName}
                          </span>
                          <span className="text-gray">
                            {task.project.client}
                            {task.km ? ` · ${task.km} km` : ''}
                          </span>
                          {conflict && (
                            <Badge variant="errorLight">
                              Duas saídas no mesmo horário
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
              {!own.length && (
                <p className="text-sm text-gray">
                  Sem saídas agendadas neste período.
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
      <p className="text-xs text-gray">
        O veículo entra na tarefa de instalação ou entrega, pelo detalhe da
        tarefa: veículo, km previstos e horário. O km é custo de deslocamento,
        não tempo de trabalho (MO-2).
      </p>
    </div>
  )
}
