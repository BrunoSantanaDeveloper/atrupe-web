'use client'

// A tela de um setor (GP-45, GP-46; 29/10/2026). O modelo é do gerenciador
// (GP-43), e todos ficam na Fila do dia, a lista das tarefas por dia
// (Maicol, 24/11/2026, como no legado; o Quadro saiu). No coletivo (arrastar
// colaborador), a caixa de colaboradores fica ao lado da lista e a pessoa é
// solta na linha do trabalho; no individual (Play & Stop), cada um liga o
// relógio na linha.
// Sem controle de tempo (NONE, GP-47; o modo do PRO): só a fila, ordenada
// pela entrega, e a tarefa só se conclui. Sem relógio, pessoas nem agenda.

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { useMemo, useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { PersonAvatar } from './PersonAvatar'
import { QueueList, type QueueGroup } from './QueueList'
import { BatchPrintDialog } from './BatchPrintDialog'
import { ProductionFilters } from './GeneralViews'
import { duration, TaskDetailDialog } from './TaskDetailDialog'
import {
  today,
  dayLabel,
  endTime,
  taskMatches,
  urgentFirst,
  BoardSkeleton,
  useProductionRefresh,
  type Period,
} from './shared'

// Types
import type { TaskView, TaskStatus, TaskAction } from '../manager'
import { NO_HOURS } from '../manager'
import { blocksTask, dayOff, forecastQueue, remainingOf } from '../forecast'

// Actions
import {
  stopWork,
  getViewer,
  startWork,
  actOnTask,
  scheduleTask,
  lockTask,
  getManagerBoard,
} from '@/actions/production-manager'

// Hooks / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { timeModeObj, PRODUCTION_MANAGE } from '@/consts/productionManager'

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

type QueueTab = 'a-fazer' | 'concluidos'

const OPEN: TaskStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'PENDING']

export function SectorScreen({ id }: { id: string }) {
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
  // A baixa conjunta no rolo (VS-2, FULL): os trabalhos marcados numa
  // impressão só
  const [batchOpen, setBatchOpen] = useState(false)
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
  // Todos os gerenciadores em lista (Maicol, 24/11/2026, como no legado): o
  // modo só muda como o tempo corre, arrastando a pessoa (coletivo) ou no
  // Play & Stop de cada um. O Quadro saiu: com 20 trabalhos não funciona.

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

  // O cadeado na agenda (24/11/2026)
  const toggleLock = async (item: TaskView) => {
    const res = await lockTask(item.id, !item.locked)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
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
      maintenance: board?.maintenance,
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
            // A manutenção das máquinas do setor naquele dia (GP-49 item 6),
            // casada pela configuração vendida de cada tarefa
            const stops = (board?.maintenance || [])
              .filter(
                (block) =>
                  block.date === day &&
                  inDay.some((item) => blocksTask(block, item)),
              )
              .map(
                (block) =>
                  `${block.machine} em manutenção das ${block.start} às ${endTime(block.start, block.minutes)} (${block.name})`,
              )
            const offHint = off
              ? off === 'HOLIDAY'
                ? 'Feriado: dá para agendar, mas o dia fica em vermelho.'
                : 'Dia sem expediente: dá para agendar, mas fica em vermelho.'
              : ''
            return {
              key: day,
              title: day === today() ? 'Hoje' : dayLabel(day),
              alert: !!off,
              hint:
                [offHint, ...stops].filter(Boolean).join(' · ') || undefined,
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

  // Sem tempo (PRO) também em lista (24/11/2026): só Concluir na linha
  const section = (title: string, items: TaskView[], hint?: string) => (
    <QueueList
      groups={[{ key: title, title, hint, tasks: items }]}
      onOpen={setTaskId}
      actions={actions}
      showForecast={false}
    />
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
          // As abas da fila e os totais na mesma linha (24/11/2026)
          before={
            timeless ? undefined : (
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
            )
          }
          after={
            <>
              {!timeless && (
                <p className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
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
                      <strong className="font-semibold">{totals.urgent}</strong>{' '}
                      urgente(s)
                    </span>
                  )}
                </p>
              )}
              <InfoHint title="Como o tempo corre neste gerenciador">
                <p>
                  {timeless
                    ? timeModeObj.NONE.help
                    : timeModeObj[manager!.timeMode]?.help}
                </p>
              </InfoHint>
            </>
          }
        />

        <div className="space-y-3">
          {/* Colaboradores: disponíveis e trabalhando (GP-17), só no
                coletivo, onde arrastar é o gesto que liga o relógio */}
          {collective && (
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-3">
                <span className="flex items-center gap-1.5 pr-1 text-sm font-medium text-gray-800">
                  Colaboradores
                  <InfoHint title="Colaboradores">
                    <p>{timeModeObj[board.manager.timeMode].help}</p>
                  </InfoHint>
                </span>
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
                        'w-full rounded-lg border px-3 py-1.5 sm:w-[260px]',
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
          <div className="min-w-0">
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
                  {board.manager.liveSchedule === 'RESCHEDULE' &&
                    totals.moved > 0 && (
                      <p className="rounded-lg border border-warning-200 bg-warning-25 px-4 py-2 text-sm text-warning-800">
                        {totals.moved} trabalho(s) andaram na sequência da
                        máquina por causa de um atraso. A previsão mostra o
                        horário novo e o que era antes.
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
                      {hasFeature(FEATURES.STOCK.PURCHASING) && (
                        <Button
                          size="sm"
                          variant="neutralOutline"
                          onClick={() => setBatchOpen(true)}
                        >
                          Apontar impressão
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="neutralOutline"
                        onClick={() => setSelected(new Set())}
                      >
                        Limpar seleção
                      </Button>
                    </div>
                  )}
                  <BatchPrintDialog
                    taskIds={Array.from(selected)}
                    open={batchOpen}
                    onOpenChange={setBatchOpen}
                    onDone={async () => {
                      setSelected(new Set())
                      await refresh()
                    }}
                  />
                  <QueueList
                    groups={listGroups}
                    forecasts={forecasts}
                    selected={selected}
                    onSelect={select}
                    onOpen={setTaskId}
                    actions={actions}
                    onReorder={queueTab === 'a-fazer' ? swapSlots : undefined}
                    showForecast={queueTab === 'a-fazer'}
                    onLock={isManager ? toggleLock : undefined}
                    person={collective ? dragging : null}
                    onDropPerson={collective ? dropOn : undefined}
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
                    {showClosed ? 'Ocultar' : 'Mostrar'} concluídas e canceladas
                    ({queue.closed.length})
                  </Button>
                  {showClosed &&
                    section('Concluídas e canceladas', queue.closed)}
                </div>
              )}
            </div>
          </div>
        </div>
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
