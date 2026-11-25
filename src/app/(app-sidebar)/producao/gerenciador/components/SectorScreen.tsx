'use client'

// A tela de um setor (GP-45, GP-46; 29/10/2026). O modelo é do gerenciador
// (GP-43), e todos ficam na Fila do dia, a lista das tarefas por dia
// (Maicol, 24/11/2026, como no legado; o Quadro saiu). No coletivo (arrastar
// colaborador), a pessoa sai da caixa de colaboradores, é solta na linha do
// trabalho e fica no espaço da linha; tirar a pessoa do espaço pausa (como no
// legado e na primeira versão, Maicol 25/11/2026). No individual (Play &
// Stop), cada um liga o relógio na linha.
// Sem controle de tempo (NONE, GP-47; o modo do PRO): só a fila, ordenada
// pela entrega, e a tarefa só se conclui. Sem relógio, pessoas nem agenda.

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { useMemo, useRef, useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { PersonAvatar } from './PersonAvatar'
import { QueueList, type QueueGroup, type QueueRow } from './QueueList'
import { BatchPrintDialog } from './BatchPrintDialog'
import { ProductionFilters } from './GeneralViews'
import { duration, TaskDetailDialog } from './TaskDetailDialog'
import {
  today,
  dayLabel,
  endTime,
  dayInPeriod,
  taskMatches,
  urgentFirst,
  BoardSkeleton,
  useProductionRefresh,
  type Period,
} from './shared'

// Types
import type { TaskView, TaskStatus, TaskAction } from '../manager'
import { NO_HOURS, blocksOf } from '../manager'
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
  IconPlayerPause,
  IconX,
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
  // Quem está sendo arrastado e de qual tarefa saiu (sem from: da caixa)
  const [dragging, setDragging] = useState<{
    id: string
    from?: string
  } | null>(null)
  // A pessoa tirada da linha e solta fora de outra linha pausa: o drop
  // marca que alguém recebeu
  const received = useRef(false)
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
  // Na caixa ficam os livres; quem trabalha numa tarefa daqui está na linha
  const free = people.filter(
    (worker) =>
      !board?.tasks.some((item) => item.id === worker.working?.taskId),
  )
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

  // Tirar a pessoa da tarefa (25/11/2026): se era a única, a tarefa pausa;
  // com outras pessoas, só o relógio dela para
  const removeFrom = async (taskId: string, collaboratorId: string) => {
    const item = board?.tasks.find((task) => task.id === taskId)
    if (!item) return
    const alone =
      item.status === 'IN_PROGRESS' &&
      item.workers.every((worker) => worker.id === collaboratorId)
    const res = alone
      ? await actOnTask({ id: taskId, action: 'PAUSE', collaboratorId })
      : await stopWork({ id: taskId, collaboratorId })
    if (!res.success) return toast.error(res.message)
    toast.success(alone ? 'Tarefa pausada' : 'Relógio parado')
    await refresh()
  }

  const dropOn = async (target: TaskView) => {
    received.current = true
    const moving = dragging
    setDragging(null)
    if (!moving || moving.from === target.id) return
    const res = await startWork({
      id: target.id,
      collaboratorId: moving.id,
      source: 'DRAG',
    })
    if (!res.success) return toast.error(res.message)
    // Trocou de tarefa: a de antes, sem mais ninguém, fica pausada
    const before = moving.from
      ? board?.tasks.find((task) => task.id === moving.from)
      : undefined
    if (
      before?.status === 'IN_PROGRESS' &&
      before.workers.every((worker) => worker.id === moving.id)
    ) {
      await actOnTask({ id: before.id, action: 'PAUSE' })
    }
    toast.success('Colaborador na tarefa: o relógio começou')
    await refresh()
  }

  const dragPerson = (id: string, from?: string) => {
    received.current = false
    setDragging({ id, from })
  }
  // Fim do arrasto de quem estava numa linha: solta fora de outra linha
  // (na caixa de colaboradores ou em qualquer lugar), pausa
  const leave = (from: string, id: string) => {
    setDragging(null)
    if (!received.current) removeFrom(from, id)
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
    // No coletivo, o relógio é o espaço da linha (coluna Na tarefa): quem
    // está nele trabalha; soltar a pessoa liga, tirar pausa. Sem Play nem Pausa
    return (
      <>
        {!collective && canStart && (
          <Button
            size="sm"
            onClick={() => act(item, 'START', 'Tarefa iniciada')}
          >
            <Icon icon={IconPlayerPlay} size="sm" />
            Play
          </Button>
        )}
        {/* Iniciar e pausar num botão só (24/11/2026): quem está na tarefa
            pausa; quem não está liga o relógio; pausada, retoma */}
        {!collective &&
          item.status === 'IN_PROGRESS' &&
          (working ? (
            <Button
              size="sm"
              variant="neutralOutline"
              onClick={() => act(item, 'PAUSE', 'Tarefa pausada')}
            >
              <Icon icon={IconPlayerPause} size="sm" />
              Pausa
            </Button>
          ) : (
            <Button size="sm" onClick={() => clock(item)}>
              <Icon icon={IconPlayerPlay} size="sm" />
              Play
            </Button>
          ))}
        {!collective && item.status === 'PAUSED' && (
          <Button
            size="sm"
            onClick={() => act(item, 'RESUME', 'Tarefa retomada')}
          >
            <Icon icon={IconPlayerPlay} size="sm" />
            Play
          </Button>
        )}
        {item.status === 'PENDING' && (
          <Button
            size="sm"
            variant="neutralOutline"
            onClick={() => act(item, 'RESUME', 'Pendência resolvida')}
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

  // A coluna Na tarefa do coletivo: o espaço reservado de cada linha
  const slotOf = (item: TaskView) =>
    OPEN.includes(item.status) &&
    item.status !== 'PENDING' &&
    !(item.blocked && item.status === 'NOT_STARTED') ? (
      <PersonSlot
        item={item}
        highlight={!!dragging && dragging.from !== item.id}
        onDragPerson={dragPerson}
        onLeave={leave}
        onRemove={removeFrom}
      />
    ) : null

  // A fila do dia: o que está andando, depois por dia, depois sem agenda;
  // as fechadas ficam recolhidas no fim. Por dia, bloco a bloco (GP-52): a
  // tarefa dividida aparece em cada dia em que tem bloco no período
  const queue = useMemo(() => {
    const open = tasks.filter((item) => OPEN.includes(item.status))
    const running = open.filter((item) => item.status !== 'NOT_STARTED')
    const waiting = open.filter((item) => item.status === 'NOT_STARTED')
    // Só o dia vai depois das que têm hora (GP-49)
    const byTime = (a: QueueRow, b: QueueRow) =>
      `${a.block!.date} ${a.block!.start ?? '99:99'}`.localeCompare(
        `${b.block!.date} ${b.block!.start ?? '99:99'}`,
      )
    const scheduled = urgentFirst(
      waiting
        .flatMap((item) =>
          blocksOf(item)
            .filter((block) => dayInPeriod(block.date, period))
            .map((block): QueueRow => ({ ...item, block })),
        )
        .sort(byTime),
    )
    const days = Array.from(new Set(scheduled.map((t) => t.block!.date)))
    // Sem tempo não há agenda: a fila segue a entrega da ordem
    const byDue = (a: TaskView, b: TaskView) =>
      a.project.due.localeCompare(b.project.due)
    return {
      running,
      days: days.map((day) => ({
        day,
        tasks: scheduled.filter((item) => item.block!.date === day),
      })),
      unscheduled: urgentFirst(
        timeless
          ? [...waiting].sort(byDue)
          : waiting.filter((item) => !item.schedule),
      ),
      closed: tasks.filter((item) => !OPEN.includes(item.status)),
    }
  }, [tasks, timeless, period])

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
              // Os minutos do bloco de cada tarefa naquele dia (GP-52)
              minutes: inDay.reduce(
                (sum, item) => sum + (item.block?.minutes || 0),
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
    // Reagenda e avisa: quantos andaram pela sequência (GP-48 item 20); a
    // tarefa dividida conta uma vez, ande um bloco ou mais (GP-52)
    moved: new Set(
      Array.from(forecasts.values())
        .filter((forecast) => forecast.delayMinutes > 0)
        .map((forecast) => forecast.taskId),
    ).size,
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
            </>
          }
        />

        <div className="space-y-3">
          {/* Colaboradores (GP-17), só no coletivo: a pessoa sai daqui e é
              solta na linha do trabalho; quem está trabalhando fica no
              espaço da linha. Soltar aqui de volta pausa (25/11/2026) */}
          {collective && (
            <Card
              onDragOver={(event) => dragging?.from && event.preventDefault()}
              className={cn(
                'transition',
                dragging?.from &&
                  'bg-error-25 outline-dashed outline-1 outline-error-400',
              )}
            >
              <CardContent className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="flex items-center gap-1.5 pr-1 text-sm font-medium text-gray-800">
                  Colaboradores
                  <InfoHint title="Colaboradores">
                    <p>{timeModeObj[board.manager.timeMode].help}</p>
                  </InfoHint>
                </span>
                {free.map((worker) => (
                  <div
                    key={worker.id}
                    draggable
                    onDragStart={() => dragPerson(worker.id)}
                    onDragEnd={() => setDragging(null)}
                    title={
                      worker.working
                        ? `${worker.name} está em outro setor`
                        : `${worker.name}: arraste para a linha do trabalho`
                    }
                    className="cursor-grab rounded-full p-0.5 ring-1 ring-gray-200 hover:ring-brand-400 active:cursor-grabbing"
                  >
                    <PersonAvatar
                      name={worker.name}
                      imageUrl={worker.avatarUrl}
                    />
                  </div>
                ))}
                <span className="text-xs text-gray">
                  {dragging?.from
                    ? 'Solte aqui para tirar da tarefa e pausar'
                    : free.length
                      ? 'Arraste a pessoa para a linha do trabalho. Para pausar, tire ela da linha.'
                      : people.length
                        ? 'Todos estão em alguma tarefa. Para pausar, tire a pessoa da linha.'
                        : 'Ninguém tem acesso a este gerenciador. Configure em Configurações › Produção.'}
                </span>
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
                    person={collective ? (dragging?.id ?? null) : null}
                    onDropPerson={collective ? dropOn : undefined}
                    slot={collective ? slotOf : undefined}
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

// O espaço da linha no coletivo (25/11/2026, como no legado): quem está na
// tarefa fica aqui. Soltar a pessoa na linha liga o relógio; arrastar para
// fora (de volta à caixa ou para qualquer lugar) pausa; para outra linha,
// troca de tarefa. Cabem várias pessoas: as bolinhas pequenas, lado a lado, como um
// grupo de avatares. O X (ao passar o mouse) faz o mesmo que tirar
function PersonSlot({
  item,
  highlight,
  onDragPerson,
  onLeave,
  onRemove,
}: {
  item: TaskView
  highlight: boolean
  onDragPerson: (id: string, from: string) => void
  onLeave: (from: string, id: string) => void
  onRemove: (from: string, id: string) => void
}) {
  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-y-1 rounded-lg border border-dashed py-1.5 pl-1.5 pr-3',
        highlight ? 'border-brand-400 bg-brand-25' : 'border-gray-300',
      )}
    >
      {item.workers.map((worker) => (
        <div
          key={worker.id}
          draggable
          onDragStart={(event) => {
            // A linha também arrasta (trocar a ordem): o arrasto é da pessoa
            event.stopPropagation()
            onDragPerson(worker.id, item.id)
          }}
          onDragEnd={(event) => {
            event.stopPropagation()
            onLeave(item.id, worker.id)
          }}
          title={`${worker.name}: arraste para fora para pausar`}
          className="group relative mr-0.5 cursor-grab rounded-full bg-white p-0.5 ring-2 ring-success-500 hover:z-10 active:cursor-grabbing"
        >
          <PersonAvatar
            name={worker.name}
            imageUrl={worker.avatarUrl}
            size="sm"
          />
          <button
            type="button"
            aria-label={`Tirar ${worker.name} da tarefa`}
            title="Tirar da tarefa"
            className="absolute -right-1 -top-1 hidden size-4 items-center justify-center rounded-full bg-error-600 text-white hover:bg-error-700 focus-visible:flex group-hover:flex"
            onClick={() => onRemove(item.id, worker.id)}
          >
            {/* eslint-disable-next-line no-restricted-syntax -- marca de controle no canto da bolinha, menor que a escala */}
            <IconX className="size-3" aria-hidden />
          </button>
        </div>
      ))}
      {!item.workers.length && (
        <span className="px-1 text-xs text-gray">
          {item.status === 'PAUSED' ? 'Solte para retomar' : 'Solte aqui'}
        </span>
      )}
    </div>
  )
}
