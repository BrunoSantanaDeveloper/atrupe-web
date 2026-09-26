'use client'

// O detalhe da tarefa (GP-4 a GP-6, GP-13, GP-14): o item e a etapa, a
// medida e os campos da venda, a lista de consumo da composição, a
// observação de produção, a etapa atual e a situação, a agenda, quem faz e o
// relógio. É o mesmo diálogo no gerenciador e no acompanhamento do projeto.

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

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { Collaborator, TaskStatus, TaskView } from '../manager'

// Actions
import {
  stopWork,
  startWork,
  assignTask,
  advanceTask,
  scheduleTask,
  setTaskStatus,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { taskStatusObj } from '@/consts/productionManager'
import { resourceKindObj } from '@/consts/processes'

// Third-party
import { toast } from 'sonner'

// Icons
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconCircleCheck,
} from '@tabler/icons-react'

const EDIT = ['production:production:view']

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

// Tempo em horas e minutos (IP-33)
export const duration = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes - hours * 60)
  return rest ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`
}

export const taskStatusBadge = (task: TaskView) =>
  task.waitingBase
    ? { text: 'Aguardando a base', variant: 'neutralLight' as const }
    : taskStatusObj[task.status]

interface Props {
  task: TaskView | null
  collaborators: Collaborator[]
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

export function TaskDetailDialog({
  task,
  collaborators,
  onOpenChange,
  onChanged,
}: Props) {
  const [schedule, setSchedule] = useState({
    date: '',
    start: '08:00',
    minutes: 60,
  })
  const [status, setStatus] = useState<TaskStatus>('PRODUCTION')
  const [stepIndex, setStepIndex] = useState(0)
  const [worker, setWorker] = useState('')

  useEffect(() => {
    if (!task) return
    setSchedule(
      task.schedule || {
        date: new Date().toISOString().slice(0, 10),
        start: '08:00',
        minutes: task.estimatedMinutes || 60,
      },
    )
    setStatus(task.status)
    setStepIndex(task.stepIndex)
    setWorker(task.assigneeId || collaborators[0]?.id || '')
  }, [task, collaborators])

  if (!task) return null

  const run = async (
    action: Promise<{ success: boolean; message: string; data?: unknown }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) return toast.error(res.message)
    toast.success(
      typeof res.data === 'string' ? res.data : success || 'Tarefa atualizada',
    )
    onChanged()
  }

  const badge = taskStatusBadge(task)
  const working = collaborators.filter(
    (item) => item.working?.taskId === task.id,
  )
  const lastStep = task.stepIndex >= task.taskType.steps.length - 1
  const open = task.status !== 'DONE' && task.status !== 'CANCELED'

  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <span
              className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: task.taskType.color }}
            />
            <div>
              <DialogTitle>
                <span className="mr-2 font-mono text-sm text-gray">
                  {task.code}
                </span>
                {task.stageName}
              </DialogTitle>
              <DialogDescription>
                {task.project.number} · {task.project.client} · {task.itemName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[65vh] space-y-5 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badge.variant}>{badge.text}</Badge>
            <Badge variant="neutralLight">
              {task.taskType.name} · {task.stepIndex + 1}º {task.step.name}
            </Badge>
            {task.late && <Badge variant="errorLight">Prazo em atraso</Badge>}
            <span className="text-sm text-gray">
              {task.measureText}
              {task.fields.length ? ` · ${task.fields.join(' · ')}` : ''}
            </span>
          </div>

          {task.waitingBase && (
            <p className="rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700">
              Esta tarefa é um acabamento e só é liberada quando a base terminar
              ({task.taskType.name}: depois que a base terminar).
            </p>
          )}
          {task.note && (
            <p className="rounded-lg bg-warning-50 px-4 py-2 text-sm text-warning-700">
              Observação da venda: {task.note}
            </p>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-gray-800">
              O que consumir
            </p>
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
                      {resourceKindObj[
                        line.kind as keyof typeof resourceKindObj
                      ] || line.kind}
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
              </TableBody>
            </Table>
            <p className="mt-2 text-sm text-gray">
              Estimado {duration(task.estimatedMinutes)} · realizado{' '}
              {duration(task.actualMinutes)}
            </p>
          </div>

          <PermissionGate permissions={EDIT}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="neutralOutline"
                    disabled={!schedule.date || !schedule.minutes}
                    onClick={() =>
                      run(
                        scheduleTask({ id: task.id, schedule }),
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
                          scheduleTask({ id: task.id, schedule: null }),
                          'Agendamento removido',
                        )
                      }
                    >
                      Tirar da agenda
                    </Button>
                  )}
                </div>
              </div>

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
                        assignTask({ id: task.id, collaboratorId: worker }),
                        'Tarefa atribuída',
                      )
                    }
                  >
                    Atribuir
                  </Button>
                  {task.taskType.timeControl && open && (
                    <Button
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      LeftIcon={IconPlayerPlay}
                      disabled={!worker || task.waitingBase}
                      onClick={() =>
                        run(
                          startWork({ id: task.id, collaboratorId: worker }),
                          'Relógio iniciado',
                        )
                      }
                    >
                      Iniciar
                    </Button>
                  )}
                </div>
                {working.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between rounded-lg bg-success-50 px-3 py-2 text-sm text-success-700"
                  >
                    {person.name} está trabalhando desde{' '}
                    {new Date(person.working!.since).toLocaleTimeString(
                      'pt-BR',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
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
                      Parar
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-4">
              <SelectBasic
                name="task-step"
                label="Etapa atual"
                className="w-[240px]"
                options={task.taskType.steps.map((item, index) => ({
                  value: String(index),
                  label: `${index + 1}º ${item.name}`,
                }))}
                value={String(stepIndex)}
                onChange={(value) => value && setStepIndex(Number(value))}
              />
              <SelectBasic
                name="task-status"
                label="Situação"
                className="w-[220px]"
                options={(Object.keys(taskStatusObj) as TaskStatus[]).map(
                  (key) => ({
                    value: key,
                    label: taskStatusObj[key].text,
                  }),
                )}
                value={status}
                onChange={(value) => value && setStatus(value as TaskStatus)}
              />
              <Button
                type="button"
                variant="neutralOutline"
                disabled={
                  status === task.status && stepIndex === task.stepIndex
                }
                onClick={() =>
                  run(
                    setTaskStatus({ id: task.id, status, stepIndex }),
                    'Situação alterada',
                  )
                }
              >
                Salvar situação
              </Button>
            </div>
          </PermissionGate>
        </DialogBody>
        <DialogFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-gray">
            {lastStep
              ? 'Última etapa: concluir fecha a tarefa e libera os acabamentos que esperam por ela.'
              : `Concluir esta etapa passa a tarefa para ${task.taskType.steps[task.stepIndex + 1].name}.`}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <PermissionGate permissions={EDIT}>
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                disabled={!open || task.waitingBase}
                onClick={() => run(advanceTask({ id: task.id }))}
              >
                {lastStep ? 'Concluir tarefa' : 'Concluir etapa'}
              </Button>
            </PermissionGate>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
