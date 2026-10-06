'use client'

// O detalhe da tarefa do ELITE (área 9 §4.14): o que a composição diz
// (recursos, campos, observação de produção MS-13), os seis estados com as
// ações de cada um (GP-28), os anexos por etapa com versão (GP-25/26), os
// apontamentos por pessoa com correção registrada (GP-43/44), a pendência
// descrita, "liberar próxima" com quantidade opcional (FL-13), a agenda com
// o preparo ocupando a máquina, o veículo da saída (VS-7) e o histórico. É o
// mesmo diálogo no gerenciador, na agenda e no projeto.

// React
import { useEffect, useState } from 'react'

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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
  scheduleTask,
  addTimeEntry,
  addAttachment,
  setTaskVehicle,
  correctTimeEntry,
  setCurrentVersion,
} from '@/actions/production-manager'

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

// Icons
import {
  IconBan,
  IconPaperclip,
  IconPlayerPlay,
  IconPlayerStop,
  IconCircleCheck,
  IconPlayerPause,
  IconArrowBackUp,
  IconAlertTriangle,
  IconArrowBigRight,
  IconLock,
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
  // Quem está usando a tela: o nome vai para o histórico, e o colaborador
  // (se for um) é quem o relógio individual registra
  userName: string
  viewerCollaboratorId?: string | null
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function TaskDetailDialog({
  task,
  collaborators,
  vehicles = [],
  userName,
  viewerCollaboratorId = null,
  onOpenChange,
  onChanged,
}: Props) {
  const [schedule, setSchedule] = useState({
    date: '',
    start: '08:00',
    minutes: 60,
  })
  const [worker, setWorker] = useState('')
  const [pendencyOpen, setPendencyOpen] = useState(false)
  const [pendencyText, setPendencyText] = useState('')
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [releaseQty, setReleaseQty] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [km, setKm] = useState('')
  // Anexos
  const [attachOpen, setAttachOpen] = useState<string | 'new' | null>(null)
  const [attachName, setAttachName] = useState('')
  const [attachKind, setAttachKind] = useState<AttachmentKind>('ART')
  const [attachFile, setAttachFile] = useState<File | null>(null)
  // Correção de apontamento
  const [correcting, setCorrecting] = useState<string | 'new' | null>(null)
  const [correctMinutes, setCorrectMinutes] = useState('')
  const [correctWho, setCorrectWho] = useState('')
  const [correctNote, setCorrectNote] = useState('')

  useEffect(() => {
    if (!task) return
    setSchedule(
      task.schedule || {
        date: new Date().toISOString().slice(0, 10),
        start: '08:00',
        minutes: task.estimatedMinutes || 60,
      },
    )
    setWorker(
      task.assigneeId || viewerCollaboratorId || collaborators[0]?.id || '',
    )
    setVehicleId(task.vehicleId || '')
    setKm(task.km ? String(task.km) : '')
    setPendencyOpen(false)
    setPendencyText('')
    setReleaseOpen(false)
    setReleaseQty('')
    setAttachOpen(null)
    setCorrecting(null)
  }, [task, collaborators, viewerCollaboratorId])

  if (!task) return null

  const run = async (
    action: Promise<{ success: boolean; message: string; data?: unknown }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) {
      toast.error(res.message)
      return false
    }
    toast.success(
      typeof res.data === 'string' ? res.data : success || 'Tarefa atualizada',
    )
    onChanged()
    return true
  }

  const badge = taskStatusBadge(task)
  const open = task.status !== 'DONE' && task.status !== 'CANCELED'
  const lastStep = task.stepIndex >= task.taskType.steps.length - 1
  const actions = actionsByStatus[task.status]
  const canRelease = open && !task.releasedNext
  const occupies =
    task.setupMinutes + Math.max(task.estimatedMinutes - task.setupMinutes, 0)
  const personName = (id: string | null) =>
    collaborators.find((item) => item.id === id)?.name || '-'
  // Quem está no relógio desta tarefa agora
  const myWork = task.workers.find((person) => person.id === worker)

  const act = (action: TaskAction) =>
    run(
      actOnTask({
        id: task.id,
        action,
        by: userName,
        // Iniciar pelo diálogo liga o relógio de quem foi escolhido em
        // "Quem faz" (individual); no coletivo, arrasta-se no quadro
        collaboratorId:
          action === 'START' || action === 'RESUME' ? worker || null : null,
      }),
    )

  const readFile = (file: File) =>
    new Promise<string | null>((resolve) => {
      // Só imagens pequenas viram prévia; o arquivo mesmo vai para o
      // armazenamento de objetos (GP-27, backend)
      if (!file.type.startsWith('image/') || file.size > 300_000) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })

  const sendAttachment = async () => {
    if (!attachFile) return
    const dataUrl = await readFile(attachFile)
    const saved = await run(
      addAttachment({
        id: task.id,
        attachmentId: attachOpen === 'new' ? null : attachOpen,
        name: attachName,
        kind: attachKind,
        file: {
          fileName: attachFile.name,
          size: attachFile.size,
          mime: attachFile.type,
          dataUrl,
        },
        by: userName,
      }),
      'Anexo guardado',
    )
    if (saved) {
      setAttachOpen(null)
      setAttachName('')
      setAttachFile(null)
    }
  }

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
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
              {task.alert.text}
            </p>
          )}
          {task.blocked && task.status === 'NOT_STARTED' && (
            <p className="flex items-start gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700">
              <IconLock className="mt-0.5 size-4 shrink-0" />
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
                  disabled={
                    (action === 'START' || action === 'RESUME') && task.blocked
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
                    type="button"
                    size="sm"
                    disabled={!pendencyText.trim()}
                    onClick={async () => {
                      if (
                        await run(
                          addPendency({
                            id: task.id,
                            text: pendencyText,
                            by: userName,
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
                    type="button"
                    size="sm"
                    onClick={async () => {
                      if (
                        await run(
                          releaseNext({
                            id: task.id,
                            by: userName,
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
                  <TableHead className="w-[25%] text-right">
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
                    <TableCell className="text-right text-sm">
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

          {/* Anexos por etapa, com versão (GP-25, GP-26) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-800">
                Anexos desta etapa
              </p>
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
                    setAttachFile(null)
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
                              setAttachFile(null)
                            }}
                          >
                            Nova versão
                          </Button>
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
                            <span>{version.fileName}</span>
                            <span>· {size(version.size)}</span>
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
                                      setCurrentVersion({
                                        id: task.id,
                                        attachmentId: attachment.id,
                                        version: version.version,
                                        by: userName,
                                      }),
                                      'Versão válida alterada',
                                    )
                                  }
                                >
                                  tornar válida
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
                      value={attachName}
                      disabled={attachOpen !== 'new'}
                      placeholder="Ex.: Arte final"
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
                    <Label htmlFor="attach-file">Arquivo</Label>
                    <Input
                      id="attach-file"
                      type="file"
                      onChange={(event) =>
                        setAttachFile(event.target.files?.[0] || null)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      !attachFile ||
                      (attachOpen === 'new' && !attachName.trim())
                    }
                    onClick={sendAttachment}
                  >
                    Guardar
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
                {task.machine && (
                  <p className="text-xs text-gray">
                    Ocupa {task.machine} por {duration(occupies)}: preparo de{' '}
                    {duration(task.setupMinutes)} mais a produção.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    disabled={!schedule.date || !schedule.minutes}
                    onClick={() =>
                      run(
                        scheduleTask({ id: task.id, schedule, by: userName }),
                        'Tarefa agendada',
                      )
                    }
                  >
                    {task.schedule ? 'Reagendar' : 'Agendar'}
                  </Button>
                  {task.schedule && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      onClick={() =>
                        run(
                          scheduleTask({
                            id: task.id,
                            schedule: null,
                            by: userName,
                          }),
                          'Agendamento removido',
                        )
                      }
                    >
                      Tirar da agenda
                    </Button>
                  )}
                </div>
                {/* Frota (VS-7): a saída com veículo */}
                {vehicles.length > 0 && (
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray">
                      Saída com veículo
                    </p>
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
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      onClick={() =>
                        run(
                          setTaskVehicle({
                            id: task.id,
                            vehicleId: vehicleId || null,
                            km: Number(km) || null,
                            by: userName,
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
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    disabled={!worker}
                    onClick={() =>
                      run(
                        assignTask({
                          id: task.id,
                          collaboratorId: worker,
                          by: userName,
                        }),
                        'Tarefa atribuída',
                      )
                    }
                  >
                    Atribuir
                  </Button>
                  {task.taskType.timeControl && open && !myWork && (
                    <Button
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      LeftIcon={IconPlayerPlay}
                      disabled={!worker || task.blocked}
                      onClick={() =>
                        run(
                          startWork({ id: task.id, collaboratorId: worker }),
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
                      type="button"
                      size="sm"
                      variant="errorGhost"
                      LeftIcon={IconPlayerStop}
                      onClick={() =>
                        run(
                          stopWork({ collaboratorId: person.id }),
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

            {/* Apontamentos por pessoa e correções (GP-43, GP-44) */}
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
                    alterou e quando. Quem teve o tempo alterado vê a alteração.
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
                        onChange={(event) => setCorrectNote(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={!correctNote.trim() || !correctWho}
                      onClick={async () => {
                        const saved = await run(
                          correcting === 'new'
                            ? addTimeEntry({
                                id: task.id,
                                collaboratorId: correctWho,
                                minutes: Number(correctMinutes) || 0,
                                note: correctNote,
                                by: userName,
                              })
                            : correctTimeEntry({
                                id: task.id,
                                entryId: correcting,
                                minutes: Number(correctMinutes) || 0,
                                collaboratorId: correctWho,
                                note: correctNote,
                                by: userName,
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
                      {when(correction.at)} · {correction.by} corrigiu:{' '}
                      {personName(correction.before.collaboratorId)}{' '}
                      {duration(correction.before.minutes)} →{' '}
                      {personName(correction.after.collaboratorId)}{' '}
                      {duration(correction.after.minutes)} · {correction.note}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Histórico */}
            {task.history.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">Histórico</p>
                <ul className="space-y-0.5 text-xs text-gray">
                  {task.history.slice(0, 12).map((entry) => (
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
