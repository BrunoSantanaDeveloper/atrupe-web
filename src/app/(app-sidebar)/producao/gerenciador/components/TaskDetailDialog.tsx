'use client'

// O detalhe da tarefa do ELITE (área 9 §4.14): o que a composição diz
// (recursos, campos, observação de produção MS-13), os seis estados com as
// ações de cada um (GP-28), os anexos por etapa com versão (GP-25/26), os
// apontamentos por pessoa com correção registrada (GP-43/44), a pendência
// descrita, "liberar próxima" com quantidade opcional (FL-13), a agenda com
// o preparo ocupando a máquina, o veículo da saída (VS-7) e o histórico. É o
// mesmo diálogo no gerenciador, na agenda e no projeto.

// React
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskLotUse } from './TaskLotUse'
import { TaskSlots } from './TaskSlots'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/ui/icon'

// Hooks
import { usePending } from '@/hooks/usePending'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type {
  Vehicle,
  TaskView,
  TaskAction,
  Collaborator,
  AttachmentKind,
} from '../manager'

// Actions
import {
  actOnTask,
  stopWork,
  startWork,
  assignTask,
  releaseNext,
  addPendency,
  addComment,
  setTaskPriority,
  scheduleTask,
  lockTask,
  addTimeEntry,
  setTaskVehicle,
  correctTimeEntry,
  setCurrentVersion,
  deleteAttachment,
} from '@/actions/production-manager'
import { useAlertDialog } from '@/store/useAlertDialog'

// Hooks / Store / Consts
import {
  taskActionObj,
  taskStatusObj,
  actionsByStatus,
  PRODUCTION_VIEW,
  PRODUCTION_MANAGE,
  attachmentKindObj,
} from '@/consts/productionManager'
import { resourceKindObj } from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'

// Third-party
import { toast } from 'sonner'

// Utils
import {
  formatBytes,
  type ProductionStorage,
  fetchProductionStorage,
  uploadProductionAttachment,
} from '@/lib/production-upload'

// Icons
import {
  IconBan,
  IconPaperclip,
  IconPlayerPlay,
  IconPlayerStop,
  IconCircleCheck,
  IconPlayerPause,
  IconArrowBackUp,
  IconMessage,
  IconFlag,
  IconAlertTriangle,
  IconArrowBigRight,
  IconLock,
  IconLockOpen,
  IconHourglass,
  IconTrash,
} from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const when = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const clock = (value: string) =>
  new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

const size = (bytes: number) =>
  bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1).replace('.', ',')} MB`
    : `${Math.max(1, Math.round(bytes / 1000))} KB`

// Tempo em horas e minutos (IP-33)
export const duration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes - hours * 60)
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`
}

export const taskStatusBadge = (task: TaskView) =>
  task.blocked && task.status === 'NOT_STARTED'
    ? { text: `Aguardando ${task.blockedBy}`, variant: 'neutralLight' as const }
    : taskStatusObj[task.status]

const actionIcon: { [key in TaskAction]: typeof IconPlayerPlay } = {
  START: IconPlayerPlay,
  PAUSE: IconPlayerPause,
  RESUME: IconPlayerPlay,
  FINISH: IconCircleCheck,
  CANCEL: IconBan,
  RESTART: IconArrowBackUp,
}

interface Props {
  task: TaskView | null
  collaborators: Collaborator[]
  vehicles?: Vehicle[]
  // O colaborador da sessão (se for um): o padrão de "Quem faz"
  viewerCollaboratorId?: string | null
  // Sem controle de tempo (GP-47): o gerenciador NONE ou o PRO, que não tem
  // production_manager. A tarefa só se conclui: sem agenda com hora, relógio,
  // pessoas na tarefa nem apontamentos
  timeless?: boolean
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function TaskDetailDialog({
  task,
  collaborators,
  vehicles = [],
  viewerCollaboratorId = null,
  timeless = false,
  onOpenChange,
  onChanged,
}: Props) {
  // Compras e lotes (FULL): o rolo aberto no setor e a baixa do impressor
  const { hasFeature } = usePlanFeatures()
  const canUseLots = hasFeature(FEATURES.STOCK.PURCHASING)
  const [schedule, setSchedule] = useState({
    date: '',
    start: '08:00',
    minutes: 60,
  })
  // Agendar só o dia, sem horário (GP-49)
  const [dayOnly, setDayOnly] = useState(false)
  const [worker, setWorker] = useState('')
  const { pending, track } = usePending()
  const [pendencyOpen, setPendencyOpen] = useState(false)
  const [pendencyText, setPendencyText] = useState('')
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseQty, setReleaseQty] = useState('')
  // O comentário da equipe (VS-5; GP-47, item 3)
  const [commentText, setCommentText] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [km, setKm] = useState('')
  // Anexos
  const [attachOpen, setAttachOpen] = useState<string | 'new' | null>(null)
  const [attachName, setAttachName] = useState('')
  const [attachKind, setAttachKind] = useState<AttachmentKind>('ART')
  // Vários arquivos de uma vez no anexo novo; um na versão nova
  const [attachFiles, setAttachFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<{
    index: number
    total: number
    ratio: number
  } | null>(null)
  const [storage, setStorage] = useState<ProductionStorage | null>(null)
  const { data: session } = useSession()
  const alertDialog = useAlertDialog()
  const token = session?.accessToken
  // O espaço dos arquivos de produção da empresa (GP-48 item 27)
  const loadStorage = useCallback(
    () => fetchProductionStorage(token).then(setStorage),
    [token],
  )
  // Correção de apontamento
  const [correcting, setCorrecting] = useState<string | 'new' | null>(null)
  const [correctMinutes, setCorrectMinutes] = useState('')
  const [correctWho, setCorrectWho] = useState('')
  const [correctNote, setCorrectNote] = useState('')

  useEffect(() => {
    if (!task) return
    setSchedule({
      date: task.schedule?.date || new Date().toISOString().slice(0, 10),
      start: task.schedule?.start || '08:00',
      minutes: task.schedule?.minutes || task.estimatedMinutes || 60,
    })
    setDayOnly(!!task.schedule && !task.schedule.start)
    setWorker(
      task.assigneeId || viewerCollaboratorId || collaborators[0]?.id || '',
    )
    setVehicleId(task.vehicleId || '')
    setKm(task.km ? String(task.km) : '')
    setPendencyOpen(false)
    setPendencyText('')
    setReleaseOpen(false)
    setReleaseQty('')
    setCommentText('')
    setAttachOpen(null)
    setCorrecting(null)
  }, [task, collaborators, viewerCollaboratorId])

  useEffect(() => {
    if (task?.id) loadStorage()
  }, [task?.id, loadStorage])

  if (!task) return null

  // `key` diz qual botão fica em progresso enquanto a ação grava
  const run = (
    key: string,
    action: () => Promise<{
      success: boolean
      message: string
      data?: unknown
    }>,
    success?: string,
  ) =>
    track(key, async () => {
      const res = await action()
      if (!res.success) {
        toast.error(res.message)
        return false
      }
      toast.success(
        typeof res.data === 'string'
          ? res.data
          : success || 'Tarefa atualizada',
      )
      onChanged()
      return true
    })

  const badge = taskStatusBadge(task)
  const open = task.status !== 'DONE' && task.status !== 'CANCELED'
  const lastStep = task.stepIndex >= task.taskType.steps.length - 1
  // Sem tempo não se inicia nem se pausa: conclui, cancela, retoma a
  // pendência ou reabre
  const actions = actionsByStatus[task.status].filter(
    (action) => !timeless || (action !== 'START' && action !== 'PAUSE'),
  )
  const canRelease = open && !task.releasedNext
  const occupies =
    task.setupMinutes + Math.max(task.estimatedMinutes - task.setupMinutes, 0)
  const personName = (id: string | null) =>
    collaborators.find((item) => item.id === id)?.name || '-'
  // Quem está no relógio desta tarefa agora
  const myWork = task.workers.find((person) => person.id === worker)

  const act = (action: TaskAction) =>
    run(`act-${action}`, () =>
      actOnTask({
        id: task.id,
        action,
        // Iniciar pelo diálogo liga o relógio de quem foi escolhido em
        // "Quem faz" (individual); no coletivo, arrasta-se no quadro
        collaboratorId:
          action === 'START' || action === 'RESUME' ? worker || null : null,
      }),
    )

  // O arquivo vai do navegador direto ao armazenamento privado, um de cada
  // vez, com o progresso; a tela recebe o link assinado (GP-27, GP-48 item 27)
  const sendAttachment = () =>
    track('attachment', async () => {
      const files = attachOpen === 'new' ? attachFiles : attachFiles.slice(0, 1)
      let sent = 0
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        setProgress({ index, total: files.length, ratio: 0 })
        const res = await uploadProductionAttachment({
          token,
          taskId: task.id,
          attachmentId: attachOpen === 'new' ? null : attachOpen,
          // Um arquivo leva o nome digitado; vários, o nome de cada arquivo
          name:
            files.length === 1 && attachName.trim()
              ? attachName.trim()
              : file.name.replace(/\.[^.]+$/, ''),
          kind: attachKind,
          file,
          storage,
          onProgress: (ratio) =>
            setProgress({ index, total: files.length, ratio }),
        })
        if (!res.success) {
          toast.error(res.message)
          break
        }
        sent += 1
      }
      setProgress(null)
      if (sent) {
        toast.success(
          sent === 1 ? 'Anexo guardado' : `${sent} anexos guardados`,
        )
        onChanged()
      }
      loadStorage()
      if (sent === files.length) {
        setAttachOpen(null)
        setAttachName('')
        setAttachFiles([])
      } else {
        setAttachFiles(files.slice(sent))
      }
      return sent === files.length
    })

  // Apagar libera o espaço: o anexo inteiro ou uma versão
  const removeAttachment = (
    attachmentId: string,
    label: string,
    version?: number,
  ) =>
    alertDialog.open({
      title: version === undefined ? 'Apagar o anexo?' : 'Apagar a versão?',
      description:
        version === undefined
          ? `${label} e todas as versões saem da etapa e o espaço é liberado. Não dá para desfazer.`
          : `${label} v${version} sai da etapa e o espaço é liberado. Não dá para desfazer.`,
      confirmLabel: 'Apagar',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        const res = await deleteAttachment({
          id: task.id,
          attachmentId,
          version,
        })
        if (!res.success) {
          toast.error(res.message)
          return
        }
        toast.success(res.data || 'Anexo apagado')
        onChanged()
        loadStorage()
      },
    })

  const quotaRatio = storage?.quotaBytes
    ? storage.usedBytes / storage.quotaBytes
    : 0

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <SectorIcon name={task.sector} size="lg" />
            <div className="min-w-0 flex-1">
              <DialogTitle>
                <span className="mr-2 font-mono text-sm text-gray">
                  {task.code}
                </span>
                {task.stageName}
              </DialogTitle>
              <DialogDescription>
                {task.project.number} · {task.project.client} · {task.itemName}
                {' · '}entrega {task.project.due.split('-').reverse().join('/')}
              </DialogDescription>
            </div>
            {task.itemImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={task.itemImage}
                alt={task.itemName}
                className="size-14 shrink-0 rounded-lg border border-gray-200 object-cover"
              />
            )}
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[68vh] space-y-5 overflow-y-auto">
          {/* Estado, etapa, medida */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badge.variant} status>
              {badge.text}
            </Badge>
            <Badge variant="neutralLight">
              {task.taskType.name} · {task.stepIndex + 1}º {task.step.name}
            </Badge>
            {task.priority === 'URGENT' && (
              <Badge variant="errorLight">Urgente</Badge>
            )}
            {task.late && <Badge variant="errorLight">Prazo em atraso</Badge>}
            {task.releasedNext && (
              <Badge variant="successLight">
                Próxima liberada
                {task.releasedNext.quantity
                  ? ` · ${task.releasedNext.quantity} de ${task.releasedNext.of}`
                  : ''}
              </Badge>
            )}
            <span className="text-sm text-gray">
              {task.measureText}
              {task.fields.length ? ` · ${task.fields.join(' · ')}` : ''}
            </span>
          </div>

          {task.alert && (
            <p className="flex items-start gap-2 rounded-lg bg-error-50 px-4 py-2 text-sm text-error-700">
              <Icon icon={IconAlertTriangle} size="sm" className="mt-0.5" />
              {task.alert.text}
            </p>
          )}
          {task.blocked && task.status === 'NOT_STARTED' && (
            <p className="flex items-start gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700">
              <Icon icon={IconHourglass} size="sm" className="mt-0.5" />
              Só começa quando {task.blockedBy} terminar ou liberar a próxima
              etapa.
            </p>
          )}
          {task.pendency && (
            <div className="rounded-lg bg-warning-50 px-4 py-2 text-sm text-warning-700">
              <p className="font-medium">Pendência</p>
              <p>{task.pendency.text}</p>
              <p className="text-xs">
                {task.pendency.by} · {when(task.pendency.at)}
              </p>
            </div>
          )}
          {task.completedBy && (
            <p className="text-sm text-gray-700">
              Concluída por{' '}
              <span className="font-medium">{task.completedBy}</span>
              {task.completedAt ? ` em ${when(task.completedAt)}` : ''}.
            </p>
          )}

          {/* As ações do estado (GP-28) */}
          <PermissionGate permissions={PRODUCTION_VIEW}>
            <div className="flex flex-wrap items-center gap-2">
              {actions.map((action) => (
                <Button
                  key={action}
                  isLoading={pending === `act-${action}`}
                  type="button"
                  size="sm"
                  variant={
                    action === 'FINISH'
                      ? 'default'
                      : action === 'CANCEL'
                        ? 'errorOutline'
                        : 'neutralOutline'
                  }
                  LeftIcon={actionIcon[action]}
                  // Concluir a que nem começou também espera a anterior,
                  // como a API recusa (patch 32, 03/11/2026)
                  disabled={
                    task.blocked &&
                    (action === 'START' ||
                      action === 'RESUME' ||
                      (action === 'FINISH' && task.status === 'NOT_STARTED'))
                  }
                  onClick={() => act(action)}
                >
                  {action === 'FINISH' && !lastStep
                    ? `Finalizar ${task.step.name}`
                    : taskActionObj[action]}
                </Button>
              ))}
              {open && task.status !== 'PENDING' && (
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconAlertTriangle}
                  onClick={() => setPendencyOpen((value) => !value)}
                >
                  Adicionar pendência
                </Button>
              )}
              {canRelease && (
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconArrowBigRight}
                  onClick={() => setReleaseOpen((value) => !value)}
                >
                  Liberar próxima etapa
                </Button>
              )}
              {/* Urgente sobe na fila do setor (GP-47, item 4) */}
              {open && (
                <PermissionGate permissions={PRODUCTION_MANAGE}>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      task.priority === 'URGENT'
                        ? 'errorOutline'
                        : 'neutralOutline'
                    }
                    LeftIcon={IconFlag}
                    isLoading={pending === 'priority'}
                    onClick={() =>
                      run('priority', () =>
                        setTaskPriority({
                          id: task.id,
                          priority:
                            task.priority === 'URGENT' ? 'NORMAL' : 'URGENT',
                        }),
                      )
                    }
                  >
                    {task.priority === 'URGENT' ? 'Tirar urgência' : 'Urgente'}
                  </Button>
                </PermissionGate>
              )}
            </div>
            {pendencyOpen && (
              <div className="space-y-2 rounded-lg border border-warning-200 bg-warning-25 p-4">
                <Label htmlFor="task-pendency">Descrição da pendência</Label>
                <Textarea
                  id="task-pendency"
                  value={pendencyText}
                  placeholder="O que está impedindo esta etapa"
                  onChange={(event) => setPendencyText(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    isLoading={pending === 'pendency'}
                    type="button"
                    size="sm"
                    disabled={!pendencyText.trim()}
                    onClick={async () => {
                      if (
                        await run(
                          'pendency',
                          () =>
                            addPendency({
                              id: task.id,
                              text: pendencyText,
                            }),
                          'Pendência registrada',
                        )
                      ) {
                        setPendencyOpen(false)
                        setPendencyText('')
                      }
                    }}
                  >
                    Registrar pendência
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    onClick={() => setPendencyOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            {releaseOpen && (
              <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  Libera a etapa seguinte para começar antes desta terminar.
                  Fica registrado quem liberou e quando. Se quiser, informe
                  quanto já está pronto; não é obrigatório.
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="release-qty">
                      Quantidade pronta (opcional)
                    </Label>
                    <Input
                      id="release-qty"
                      type="number"
                      min={1}
                      max={task.quantity}
                      className="w-[160px]"
                      placeholder={`de ${task.quantity}`}
                      value={releaseQty}
                      onChange={(event) => setReleaseQty(event.target.value)}
                    />
                  </div>
                  <Button
                    isLoading={pending === 'release'}
                    type="button"
                    size="sm"
                    onClick={async () => {
                      if (
                        await run('release', () =>
                          releaseNext({
                            id: task.id,
                            quantity: Number(releaseQty) || null,
                          }),
                        )
                      )
                        setReleaseOpen(false)
                    }}
                  >
                    Liberar
                  </Button>
                </div>
              </div>
            )}
          </PermissionGate>

          {/* O que a composição diz (GP-4, MS-13) */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">
              O que a composição diz
            </p>
            {task.note && (
              <p className="mb-2 rounded-lg bg-warning-50 px-4 py-2 text-sm text-warning-700">
                Observação de produção: {task.note}
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[20%]">Tipo</TableHead>
                  <TableHead className="w-[55%]">Recurso</TableHead>
                  <TableHead numeric className="w-[25%]">
                    Quantidade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {task.consumption.map((line, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm text-gray">
                      {line.kind in resourceKindObj ? (
                        <ResourceKindLabel
                          kind={line.kind as keyof typeof resourceKindObj}
                          label={
                            resourceKindObj[
                              line.kind as keyof typeof resourceKindObj
                            ]
                          }
                        />
                      ) : (
                        line.kind
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-800">
                      {line.resource}
                    </TableCell>
                    <TableCell numeric className="text-sm">
                      {line.quantity === null
                        ? '-'
                        : line.unit === 'min'
                          ? duration(line.quantity)
                          : `${num(line.quantity)} ${line.unit}`}
                    </TableCell>
                  </TableRow>
                ))}
                {!task.consumption.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-gray">
                      Sem recursos nesta etapa.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="mt-2 text-sm text-gray">
              Previsto {duration(task.estimatedMinutes)} · apontado{' '}
              {duration(task.actualMinutes)}
              {task.setupMinutes > 0 && task.machine
                ? ` · preparo de ${duration(task.setupMinutes)} ocupa ${task.machine}`
                : task.setupMinutes > 0
                  ? ` · preparo de ${duration(task.setupMinutes)}`
                  : ''}
            </p>
          </div>

          {/* A baixa do impressor no rolo aberto no setor (ES-16, FULL) */}
          {canUseLots &&
            task.status !== 'DONE' &&
            task.status !== 'CANCELED' && (
              <TaskLotUse taskId={task.id} onChanged={onChanged} />
            )}

          {/* Anexos por etapa, com versão (GP-25, GP-26) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-800">
                Anexos desta etapa
              </p>
              {storage && (
                <div className="ml-auto flex min-w-0 items-center gap-2 text-xs text-gray">
                  {storage.quotaBytes !== null && (
                    <div
                      className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100"
                      aria-hidden
                    >
                      <div
                        className={cn(
                          'h-full rounded-full',
                          quotaRatio >= 0.95
                            ? 'bg-error-500'
                            : quotaRatio >= 0.8
                              ? 'bg-warning-500'
                              : 'bg-brand-600',
                        )}
                        style={{ width: `${Math.min(quotaRatio, 1) * 100}%` }}
                      />
                    </div>
                  )}
                  <span className="whitespace-nowrap">
                    {formatBytes(storage.usedBytes)}
                    {storage.quotaBytes !== null &&
                      ` de ${formatBytes(storage.quotaBytes)}`}
                  </span>
                  {(!storage.tier || quotaRatio >= 0.8) && (
                    <Link
                      href="/assinatura/contratacao?modo=complementos"
                      className="whitespace-nowrap text-brand-700 hover:underline"
                    >
                      Mais espaço
                    </Link>
                  )}
                </div>
              )}
              <PermissionGate permissions={PRODUCTION_VIEW}>
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  LeftIcon={IconPaperclip}
                  onClick={() => {
                    setAttachOpen('new')
                    setAttachName('')
                    setAttachKind('ART')
                    setAttachFiles([])
                  }}
                >
                  Anexar
                </Button>
              </PermissionGate>
            </div>
            {task.attachments.length ? (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {task.attachments.map((attachment) => {
                  const current = attachment.versions.find(
                    (item) => item.current,
                  )
                  return (
                    <li key={attachment.id} className="space-y-1 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {current?.dataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={current.dataUrl}
                            alt={attachment.name}
                            className="size-10 rounded border border-gray-200 object-cover"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {attachment.name}
                        </span>
                        <Badge variant="neutralLight">
                          {attachmentKindObj[attachment.kind]}
                        </Badge>
                        {current && (
                          <Badge variant="successLight">
                            v{current.version} válida
                          </Badge>
                        )}
                        <PermissionGate permissions={PRODUCTION_VIEW}>
                          <Button
                            type="button"
                            size="sm"
                            variant="link"
                            className="ml-auto h-auto p-0"
                            onClick={() => {
                              setAttachOpen(attachment.id)
                              setAttachName(attachment.name)
                              setAttachKind(attachment.kind)
                              setAttachFiles([])
                            }}
                          >
                            Nova versão
                          </Button>
                          <button
                            type="button"
                            aria-label={`Apagar ${attachment.name}`}
                            title="Apagar o anexo"
                            className="text-gray hover:text-error-600"
                            onClick={() =>
                              removeAttachment(attachment.id, attachment.name)
                            }
                          >
                            <Icon icon={IconTrash} size="sm" />
                          </button>
                        </PermissionGate>
                      </div>
                      <ul className="space-y-0.5 text-xs text-gray">
                        {[...attachment.versions].reverse().map((version) => (
                          <li
                            key={version.version}
                            className={cn(
                              'flex flex-wrap items-center gap-2',
                              version.current && 'text-gray-800',
                            )}
                          >
                            <span className="font-mono">
                              v{version.version}
                            </span>
                            {version.removedAt ? (
                              <span className="line-through">
                                {version.fileName}
                              </span>
                            ) : version.url ? (
                              <a
                                href={version.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-700 hover:underline"
                              >
                                {version.fileName}
                              </a>
                            ) : (
                              <span>{version.fileName}</span>
                            )}
                            <span>· {size(version.size)}</span>
                            {version.removedAt && (
                              <span className="text-warning-700">
                                · removido na limpeza de{' '}
                                {new Date(version.removedAt).toLocaleDateString(
                                  'pt-BR',
                                )}
                              </span>
                            )}
                            <span>
                              · {version.uploadedBy}, {when(version.uploadedAt)}
                            </span>
                            {!version.current && (
                              <PermissionGate permissions={PRODUCTION_VIEW}>
                                <button
                                  type="button"
                                  className="text-brand-700 hover:underline"
                                  onClick={() =>
                                    run(
                                      'version',
                                      () =>
                                        setCurrentVersion({
                                          id: task.id,
                                          attachmentId: attachment.id,
                                          version: version.version,
                                        }),
                                      'Versão válida alterada',
                                    )
                                  }
                                >
                                  tornar válida
                                </button>
                              </PermissionGate>
                            )}
                            {attachment.versions.length > 1 && (
                              <PermissionGate permissions={PRODUCTION_VIEW}>
                                <button
                                  type="button"
                                  className="text-gray hover:text-error-600 hover:underline"
                                  onClick={() =>
                                    removeAttachment(
                                      attachment.id,
                                      attachment.name,
                                      version.version,
                                    )
                                  }
                                >
                                  apagar
                                </button>
                              </PermissionGate>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray">
                Nenhum anexo. A arte vai na impressão, o desenho de corte no
                router, a foto do trabalho pronto na última etapa.
              </p>
            )}
            {attachOpen && (
              <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">
                  {attachOpen === 'new' ? 'Novo anexo' : 'Nova versão'}
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="attach-name">Nome</Label>
                    <Input
                      id="attach-name"
                      value={attachFiles.length > 1 ? '' : attachName}
                      disabled={attachOpen !== 'new' || attachFiles.length > 1}
                      placeholder={
                        attachFiles.length > 1
                          ? 'O nome de cada arquivo'
                          : 'Ex.: Arte final'
                      }
                      onChange={(event) => setAttachName(event.target.value)}
                    />
                  </div>
                  <SelectBasic
                    name="attach-kind"
                    label="Tipo"
                    disabled={attachOpen !== 'new'}
                    options={(
                      Object.keys(attachmentKindObj) as AttachmentKind[]
                    ).map((kind) => ({
                      value: kind,
                      label: attachmentKindObj[kind],
                    }))}
                    value={attachKind}
                    onChange={(value) =>
                      value && setAttachKind(value as AttachmentKind)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor="attach-file">
                      {attachOpen === 'new' ? 'Arquivos' : 'Arquivo'}
                    </Label>
                    <Input
                      id="attach-file"
                      type="file"
                      multiple={attachOpen === 'new'}
                      onChange={(event) => {
                        const files = Array.from(event.target.files || [])
                        setAttachFiles(files)
                        // Um arquivo só: o nome sugerido é o do arquivo
                        if (
                          attachOpen === 'new' &&
                          files.length === 1 &&
                          !attachName.trim()
                        ) {
                          setAttachName(files[0].name.replace(/\.[^.]+$/, ''))
                        }
                      }}
                    />
                  </div>
                </div>
                {storage && (
                  <p className="text-xs text-gray">
                    Até {formatBytes(storage.maxFileBytes)} por arquivo
                    {storage.freeBytes !== null &&
                      ` · ${formatBytes(storage.freeBytes)} livres`}
                    {!storage.tier &&
                      ' · com os arquivos de produção contratados, até 2 GB por arquivo'}
                  </p>
                )}
                {attachFiles.length > 1 && (
                  <ul className="space-y-0.5 text-xs text-gray-800">
                    {attachFiles.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex gap-2">
                        <span className="truncate">{file.name}</span>
                        <span className="text-gray">
                          · {formatBytes(file.size)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {progress && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray">
                      {progress.total > 1 &&
                        `${progress.index + 1} de ${progress.total} · `}
                      {Math.round(progress.ratio * 100)}%
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{
                          width: `${((progress.index + progress.ratio) / progress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    isLoading={pending === 'attachment'}
                    disabled={
                      !attachFiles.length ||
                      (attachOpen === 'new' &&
                        attachFiles.length === 1 &&
                        !attachName.trim())
                    }
                    onClick={sendAttachment}
                  >
                    {attachFiles.length > 1
                      ? `Guardar ${attachFiles.length} arquivos`
                      : 'Guardar'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    onClick={() => setAttachOpen(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <PermissionGate permissions={PRODUCTION_VIEW}>
            {!timeless && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Agenda: data, início e duração; o preparo ocupa a máquina */}
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-800">Agenda</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3 space-y-1 sm:col-span-1">
                      <Label htmlFor="task-date">Dia</Label>
                      <Input
                        id="task-date"
                        type="date"
                        value={schedule.date}
                        onChange={(event) =>
                          setSchedule((current) => ({
                            ...current,
                            date: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="task-start">Início</Label>
                      <Input
                        id="task-start"
                        type="time"
                        disabled={dayOnly}
                        value={schedule.start}
                        onChange={(event) =>
                          setSchedule((current) => ({
                            ...current,
                            start: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="task-minutes">Duração (min)</Label>
                      <Input
                        id="task-minutes"
                        type="number"
                        min={1}
                        disabled={dayOnly}
                        value={schedule.minutes}
                        onChange={(event) =>
                          setSchedule((current) => ({
                            ...current,
                            minutes: Number(event.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={dayOnly}
                      onCheckedChange={(value) => setDayOnly(value === true)}
                    />
                    Só o dia, sem horário
                  </label>
                  {task.machine && (
                    <p className="text-xs text-gray">
                      Ocupa {task.machine} por {duration(occupies)}: preparo de{' '}
                      {duration(task.setupMinutes)} mais a produção.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      isLoading={pending === 'schedule'}
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      disabled={
                        !schedule.date || (!dayOnly && !schedule.minutes)
                      }
                      onClick={() =>
                        run(
                          'schedule',
                          () =>
                            scheduleTask({
                              id: task.id,
                              schedule: dayOnly
                                ? {
                                    date: schedule.date,
                                    start: null,
                                    minutes: null,
                                  }
                                : schedule,
                            }),
                          'Tarefa agendada',
                        )
                      }
                    >
                      {task.schedule ? 'Reagendar' : 'Agendar'}
                    </Button>
                    {task.schedule && task.status === 'NOT_STARTED' && (
                      <Button
                        isLoading={pending === 'lock'}
                        type="button"
                        size="sm"
                        variant={task.locked ? 'secondary' : 'neutralOutline'}
                        onClick={() =>
                          run(
                            'lock',
                            () => lockTask(task.id, !task.locked),
                            task.locked
                              ? 'Destravada na agenda'
                              : 'Travada na agenda',
                          )
                        }
                      >
                        <Icon
                          icon={task.locked ? IconLock : IconLockOpen}
                          size="sm"
                        />
                        {task.locked ? 'Travada na agenda' : 'Travar na agenda'}
                      </Button>
                    )}
                    {task.schedule && (
                      <Button
                        isLoading={pending === 'unschedule'}
                        type="button"
                        size="sm"
                        variant="link"
                        onClick={() =>
                          run(
                            'unschedule',
                            () =>
                              scheduleTask({
                                id: task.id,
                                schedule: null,
                              }),
                            'Agendamento removido',
                          )
                        }
                      >
                        Tirar da agenda
                      </Button>
                    )}
                  </div>
                  {/* Os blocos de agenda (GP-52): dividir em dois dias,
                      acrescentar tempo, quem e quanto em cada bloco */}
                  <TaskSlots
                    task={task}
                    collaborators={collaborators}
                    run={run}
                    pending={pending}
                  />
                  {/* Frota (VS-7): a saída com veículo */}
                  {vehicles.length > 0 && (
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                      <p className="type-eyebrow">Saída com veículo</p>
                      <div className="grid grid-cols-2 gap-2">
                        <SelectBasic
                          name="task-vehicle"
                          label="Veículo"
                          options={[
                            { value: 'none', label: 'Sem veículo' },
                            ...vehicles.map((vehicle) => ({
                              value: vehicle.id,
                              label: `${vehicle.name} · ${vehicle.plate}`,
                            })),
                          ]}
                          value={vehicleId || 'none'}
                          onChange={(value) =>
                            setVehicleId(value === 'none' ? '' : String(value))
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor="task-km">Km previstos</Label>
                          <Input
                            id="task-km"
                            type="number"
                            min={0}
                            value={km}
                            onChange={(event) => setKm(event.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        isLoading={pending === 'vehicle'}
                        type="button"
                        size="sm"
                        variant="neutralOutline"
                        onClick={() =>
                          run(
                            'vehicle',
                            () =>
                              setTaskVehicle({
                                id: task.id,
                                vehicleId: vehicleId || null,
                                km: Number(km) || null,
                              }),
                            'Veículo reservado',
                          )
                        }
                      >
                        Reservar veículo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quem faz e o relógio individual (GP-43) */}
                <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-800">Quem faz</p>
                  <SelectBasic
                    name="task-worker"
                    label=""
                    options={collaborators.map((item) => ({
                      value: item.id,
                      label: item.working
                        ? `${item.name} (trabalhando)`
                        : item.name,
                    }))}
                    value={worker}
                    onChange={(value) => value && setWorker(String(value))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      isLoading={pending === 'assign'}
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      disabled={!worker}
                      onClick={() =>
                        run(
                          'assign',
                          () =>
                            assignTask({
                              id: task.id,
                              collaboratorId: worker,
                            }),
                          'Tarefa atribuída',
                        )
                      }
                    >
                      Atribuir
                    </Button>
                    {task.taskType.timeControl && open && !myWork && (
                      <Button
                        isLoading={pending === 'start-work'}
                        type="button"
                        size="sm"
                        variant="neutralOutline"
                        LeftIcon={IconPlayerPlay}
                        disabled={!worker || task.blocked}
                        onClick={() =>
                          run(
                            'start-work',
                            () =>
                              startWork({
                                id: task.id,
                                collaboratorId: worker,
                              }),
                            'Relógio iniciado',
                          )
                        }
                      >
                        Play
                      </Button>
                    )}
                  </div>
                  {task.workers.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-lg bg-success-50 px-3 py-2 text-sm text-success-700"
                    >
                      {person.name} está na tarefa desde{' '}
                      {clock(person.working!.since)}
                      <Button
                        isLoading={pending === `stop-${person.id}`}
                        type="button"
                        size="sm"
                        variant="errorGhost"
                        LeftIcon={IconPlayerStop}
                        onClick={() =>
                          run(
                            `stop-${person.id}`,
                            () =>
                              stopWork({
                                id: task.id,
                                collaboratorId: person.id,
                              }),
                            'Relógio parado',
                          )
                        }
                      >
                        Stop
                      </Button>
                    </div>
                  ))}
                  {!task.taskType.timeControl && (
                    <p className="text-xs text-gray">
                      Este tipo de tarefa não controla tempo: só se conclui.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Apontamentos por pessoa e correções (GP-43, GP-44) */}
            {!timeless && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-800">
                    Apontamentos
                  </p>
                  <PermissionGate permissions={PRODUCTION_MANAGE}>
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => {
                        setCorrecting('new')
                        setCorrectMinutes('')
                        setCorrectWho(worker)
                        setCorrectNote('')
                      }}
                    >
                      Lançar tempo à mão
                    </Button>
                  </PermissionGate>
                </div>
                {task.timeEntries.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[26%]">Quem</TableHead>
                        <TableHead className="w-[26%]">Início · fim</TableHead>
                        <TableHead className="w-[14%] text-right">
                          Tempo
                        </TableHead>
                        <TableHead className="w-[22%]">Origem</TableHead>
                        <TableHead className="w-[12%]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {task.timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm text-gray-800">
                            {personName(entry.collaboratorId)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {clock(entry.start)} ·{' '}
                            {entry.end ? clock(entry.end) : 'correndo'}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {entry.end ? duration(entry.minutes) : '…'}
                          </TableCell>
                          <TableCell className="text-xs text-gray">
                            {entry.source === 'CLOCK'
                              ? 'relógio'
                              : entry.source === 'DRAG'
                                ? 'arrastado'
                                : `correção${entry.note ? `: ${entry.note}` : ''}`}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.end && (
                              <PermissionGate permissions={PRODUCTION_MANAGE}>
                                <button
                                  type="button"
                                  className="text-xs text-brand-700 hover:underline"
                                  onClick={() => {
                                    setCorrecting(entry.id)
                                    setCorrectMinutes(String(entry.minutes))
                                    setCorrectWho(entry.collaboratorId)
                                    setCorrectNote('')
                                  }}
                                >
                                  corrigir
                                </button>
                              </PermissionGate>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-gray">
                    Nenhum tempo apontado ainda.
                  </p>
                )}
                {correcting && (
                  <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-800">
                      {correcting === 'new'
                        ? 'Lançar tempo'
                        : 'Corrigir apontamento'}
                    </p>
                    <p className="text-xs text-gray">
                      A correção fica registrada: o que era, o que ficou, quem
                      alterou e quando. Quem teve o tempo alterado vê a
                      alteração.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label htmlFor="correct-minutes">Tempo (min)</Label>
                        <Input
                          id="correct-minutes"
                          type="number"
                          min={0}
                          value={correctMinutes}
                          onChange={(event) =>
                            setCorrectMinutes(event.target.value)
                          }
                        />
                      </div>
                      <SelectBasic
                        name="correct-who"
                        label="Quem"
                        options={collaborators.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                        value={correctWho}
                        onChange={(value) =>
                          value && setCorrectWho(String(value))
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="correct-note">Motivo</Label>
                        <Input
                          id="correct-note"
                          value={correctNote}
                          placeholder="Ex.: esqueceu o relógio no almoço"
                          onChange={(event) =>
                            setCorrectNote(event.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        isLoading={pending === 'time-entry'}
                        type="button"
                        size="sm"
                        disabled={!correctNote.trim() || !correctWho}
                        onClick={async () => {
                          const saved = await run(
                            'time-entry',
                            () =>
                              correcting === 'new'
                                ? addTimeEntry({
                                    id: task.id,
                                    collaboratorId: correctWho,
                                    minutes: Number(correctMinutes) || 0,
                                    note: correctNote,
                                  })
                                : correctTimeEntry({
                                    id: task.id,
                                    entryId: correcting,
                                    minutes: Number(correctMinutes) || 0,
                                    collaboratorId: correctWho,
                                    note: correctNote,
                                  }),
                            'Apontamento corrigido',
                          )
                          if (saved) setCorrecting(null)
                        }}
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="neutralOutline"
                        onClick={() => setCorrecting(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                {task.corrections.length > 0 && (
                  <ul className="space-y-1 text-xs text-gray">
                    {task.corrections.map((correction) => (
                      <li key={correction.id}>
                        {when(correction.at)} · {correction.by}{' '}
                        {correction.before ? (
                          <>
                            corrigiu:{' '}
                            {personName(correction.before.collaboratorId)}{' '}
                            {duration(correction.before.minutes)} →{' '}
                          </>
                        ) : (
                          'lançou: '
                        )}
                        {personName(correction.after.collaboratorId)}{' '}
                        {duration(correction.after.minutes)} · {correction.note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Comentários da equipe (VS-5; GP-47, item 3): texto livre, no
                histórico, sem notificação */}
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Icon icon={IconMessage} size="sm" />
                Comentários
                <span className="font-normal text-gray">
                  (
                  {
                    task.history.filter((entry) => entry.kind === 'COMMENT')
                      .length
                  }
                  )
                </span>
              </p>
              <ul className="space-y-1.5">
                {task.history
                  .filter((entry) => entry.kind === 'COMMENT')
                  .map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800"
                    >
                      <p className="whitespace-pre-wrap">{entry.text}</p>
                      <p className="text-xs text-gray">
                        {entry.by} · {when(entry.at)}
                      </p>
                    </li>
                  ))}
              </ul>
              <div className="flex items-end gap-2">
                <Textarea
                  id="task-comment"
                  aria-label="Comentário"
                  value={commentText}
                  rows={2}
                  placeholder="Um recado para quem pega esta tarefa"
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="neutralOutline"
                  isLoading={pending === 'comment'}
                  disabled={!commentText.trim()}
                  onClick={async () => {
                    if (
                      await run(
                        'comment',
                        () => addComment({ id: task.id, text: commentText }),
                        'Comentário registrado',
                      )
                    )
                      setCommentText('')
                  }}
                >
                  Comentar
                </Button>
              </div>
            </div>

            {/* Histórico (sem os comentários, que têm o bloco acima) */}
            {task.history.some((entry) => entry.kind !== 'COMMENT') && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">Histórico</p>
                <ul className="space-y-0.5 text-xs text-gray">
                  {task.history
                    .filter((entry) => entry.kind !== 'COMMENT')
                    .slice(0, 12)
                    .map((entry) => (
                      <li key={entry.id}>
                        {when(entry.at)} · {entry.by}: {entry.text}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </PermissionGate>
        </DialogBody>
        <DialogFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-gray">
            {lastStep
              ? 'Última etapa: finalizar fecha a tarefa e libera o que espera por ela.'
              : `Finalizar ${task.step.name} passa a tarefa para ${task.taskType.steps[task.stepIndex + 1].name}.`}
          </p>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
