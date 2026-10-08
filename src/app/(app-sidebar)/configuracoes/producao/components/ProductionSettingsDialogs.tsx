'use client'

// Diálogos da configuração da produção: gerenciador, acesso dos
// colaboradores, inativar com destino, tipo de tarefa e as etapas dele.

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type {
  TaskType,
  TimeMode,
  ReleaseRule,
  Collaborator,
  ManagerModel,
  ProductionFlow,
  ProductionManager,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

// Hooks / Store / Consts
import {
  timeModeObj,
  releaseRuleObj,
  managerModelObj,
  TASK_TYPE_COLORS,
} from '@/consts/productionManager'

// Icons
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------------------------
 * Gerenciador
 * ------------------------------------------------------------------------- */

export type ManagerValues = {
  name: string
  flowId: string
  model: ManagerModel
  timeMode: TimeMode
}

export function ManagerDialog({
  open,
  manager,
  flows,
  onOpenChange,
  onSave,
}: {
  open: boolean
  manager?: ProductionManager
  flows: ProductionFlow[]
  onOpenChange: (open: boolean) => void
  onSave: (values: ManagerValues) => void
}) {
  const [values, setValues] = useState<ManagerValues>({
    name: '',
    flowId: '',
    model: 'SIMPLE',
    timeMode: 'PLAY_STOP',
  })

  useEffect(() => {
    if (open) {
      setValues({
        name: manager?.name || '',
        flowId: manager?.flowId || flows[0]?.id || '',
        model: manager?.model || 'SIMPLE',
        timeMode: manager?.timeMode || 'PLAY_STOP',
      })
    }
  }, [open, manager, flows])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>
                {manager ? `Editar ${manager.name}` : 'Novo gerenciador'}
              </DialogTitle>
              <DialogDescription>
                O gerenciador é um setor de trabalho, com a fila dele e o jeito
                de controlar o tempo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manager-name">Nome</Label>
              <Input
                id="manager-name"
                placeholder="Ex.: Impressão, Serralheria"
                value={values.name}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <SelectBasic
              name="manager-flow"
              label="Fluxo de produção"
              options={flows.map((flow) => ({
                value: flow.id,
                label: flow.name,
              }))}
              value={values.flowId}
              onChange={(value) =>
                value &&
                setValues((current) => ({ ...current, flowId: String(value) }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(Object.keys(managerModelObj) as ManagerModel[]).map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() =>
                    setValues((current) => ({ ...current, model }))
                  }
                  className={cn(
                    'rounded-lg border p-3 text-left',
                    values.model === model
                      ? 'border-brand-500 bg-brand-25 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <span className="block text-sm font-medium text-gray-800">
                    {managerModelObj[model].text}
                  </span>
                  <span className="block text-xs text-gray">
                    {managerModelObj[model].help}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Controle de tempo</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(timeModeObj) as TimeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setValues((current) => ({ ...current, timeMode: mode }))
                  }
                  className={cn(
                    'rounded-lg border p-3 text-left',
                    values.timeMode === mode
                      ? 'border-brand-500 bg-brand-25 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <span className="block text-sm font-medium text-gray-800">
                    {timeModeObj[mode].text}
                  </span>
                  <span className="block text-xs text-gray">
                    {timeModeObj[mode].help}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!values.name.trim() || !values.flowId}
            onClick={() => onSave(values)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Quem acessa o gerenciador (GP-11)
 * ------------------------------------------------------------------------- */

export function UsersDialog({
  manager,
  collaborators,
  onOpenChange,
  onChange,
}: {
  manager?: ProductionManager
  collaborators: Collaborator[]
  onOpenChange: (open: boolean) => void
  onChange: (
    collaboratorId: string,
    access: 'NONE' | 'ALL' | 'ASSIGNED',
  ) => void
}) {
  if (!manager) return null
  const accessOf = (id: string) => {
    const user = manager.users.find((item) => item.collaboratorId === id)
    return !user ? 'NONE' : user.onlyAssigned ? 'ASSIGNED' : 'ALL'
  }

  return (
    <Dialog open={!!manager} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>Quem acessa {manager.name}</DialogTitle>
              <DialogDescription>
                Quem tem acesso aparece na coluna de colaboradores do
                gerenciador. &quot;Só as atribuídas&quot; vê apenas as tarefas
                dele.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="divide-y divide-gray-100">
          {collaborators.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="text-sm font-medium text-gray-800">
                {person.name}
              </span>
              <SelectBasic
                name={`access-${person.id}`}
                label=""
                className="w-[220px]"
                options={[
                  { value: 'NONE', label: 'Sem acesso' },
                  { value: 'ALL', label: 'Todas as tarefas' },
                  { value: 'ASSIGNED', label: 'Só as atribuídas a ele' },
                ]}
                value={accessOf(person.id)}
                onChange={(value) =>
                  value &&
                  onChange(person.id, value as 'NONE' | 'ALL' | 'ASSIGNED')
                }
              />
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Inativar com destino (GP-15)
 * ------------------------------------------------------------------------- */

export function InactivateManagerDialog({
  manager,
  managers,
  onOpenChange,
  onConfirm,
}: {
  manager?: ProductionManager
  managers: ProductionManager[]
  onOpenChange: (open: boolean) => void
  onConfirm: (destinationId: string) => void
}) {
  const [destination, setDestination] = useState('')
  const options = managers.filter(
    (item) => item.active && item.id !== manager?.id,
  )

  useEffect(() => {
    setDestination(options[0]?.id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manager?.id])

  if (!manager) return null
  return (
    <Dialog open={!!manager} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>Inativar {manager.name}?</DialogTitle>
              <DialogDescription>
                As etapas que passam por ele vão para outro gerenciador —
                nenhuma tarefa fica sem lugar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <SelectBasic
            name="manager-destination"
            label="Gerenciador de destino das etapas"
            options={options.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={destination}
            onChange={(value) => value && setDestination(String(value))}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="error"
            disabled={!destination}
            onClick={() => onConfirm(destination)}
          >
            Inativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Tipo de tarefa (GP-12, GP-13)
 * ------------------------------------------------------------------------- */

export type TaskTypeValues = {
  name: string
  color: string
  release: ReleaseRule
  timeControl: boolean
  managerId?: string
}

export function TaskTypeDialog({
  open,
  taskType,
  managers,
  onOpenChange,
  onSave,
}: {
  open: boolean
  taskType?: TaskType
  managers: ProductionManager[]
  onOpenChange: (open: boolean) => void
  onSave: (values: TaskTypeValues) => void
}) {
  const [values, setValues] = useState<TaskTypeValues>({
    name: '',
    color: TASK_TYPE_COLORS[0],
    release: 'WITH_BASE',
    timeControl: true,
  })

  useEffect(() => {
    if (open) {
      setValues({
        name: taskType?.name || '',
        color: taskType?.color || TASK_TYPE_COLORS[0],
        release: taskType?.release || 'WITH_BASE',
        timeControl: taskType?.timeControl ?? true,
        managerId: taskType ? undefined : managers.find((m) => m.active)?.id,
      })
    }
  }, [open, taskType, managers])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>
                {taskType ? `Editar ${taskType.name}` : 'Novo tipo de tarefa'}
              </DialogTitle>
              <DialogDescription>
                É o &quot;tipo de tarefa&quot; das etapas da composição: diz por
                quais gerenciadores a tarefa passa e quando ela é liberada.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type-name">Nome</Label>
              <Input
                id="type-name"
                placeholder="Ex.: Impressão UV"
                value={values.name}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            {!taskType && (
              <SelectBasic
                name="type-manager"
                label="Gerenciador da primeira etapa"
                options={managers
                  .filter((item) => item.active)
                  .map((item) => ({ value: item.id, label: item.name }))}
                value={values.managerId || ''}
                onChange={(value) =>
                  value &&
                  setValues((current) => ({
                    ...current,
                    managerId: String(value),
                  }))
                }
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Cor na fila</Label>
            <div className="flex flex-wrap gap-2">
              {TASK_TYPE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Cor ${color}`}
                  onClick={() =>
                    setValues((current) => ({ ...current, color }))
                  }
                  className={cn(
                    'size-8 rounded-full border-2',
                    values.color === color ? 'border-gray-900' : 'border-white',
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quando a tarefa é liberada</Label>
            <div className="space-y-2">
              {(Object.keys(releaseRuleObj) as ReleaseRule[]).map((rule) => (
                <button
                  key={rule}
                  type="button"
                  onClick={() =>
                    setValues((current) => ({ ...current, release: rule }))
                  }
                  className={cn(
                    'w-full rounded-lg border p-3 text-left',
                    values.release === rule
                      ? 'border-brand-500 bg-brand-25 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <span className="block text-sm font-medium text-gray-800">
                    {releaseRuleObj[rule].text}
                  </span>
                  <span className="block text-xs text-gray">
                    {releaseRuleObj[rule].help}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start justify-between gap-6 rounded-lg border border-gray-200 p-4">
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Controla tempo
              </span>
              <span className="block text-sm text-gray">
                O relógio mede o tempo realizado das tarefas deste tipo.
              </span>
            </span>
            <Switch
              checked={values.timeControl}
              onCheckedChange={(checked) =>
                setValues((current) => ({ ...current, timeControl: checked }))
              }
              aria-label="Controla tempo"
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!values.name.trim() || (!taskType && !values.managerId)}
            onClick={() => onSave(values)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * Etapas do tipo de tarefa: cada uma no seu gerenciador (GP-14)
 * ------------------------------------------------------------------------- */

export function StepsDialog({
  taskType,
  managers,
  onOpenChange,
  onSave,
  onRemove,
  onMove,
}: {
  taskType?: TaskType
  managers: ProductionManager[]
  onOpenChange: (open: boolean) => void
  onSave: (values: {
    stepId?: string
    name: string
    managerId: string
  }) => Promise<boolean>
  onRemove: (stepId: string) => void
  onMove: (stepId: string, direction: 'UP' | 'DOWN') => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [managerId, setManagerId] = useState('')
  const active = managers.filter((item) => item.active)

  useEffect(() => {
    setEditing(null)
    setName('')
    setManagerId(active[0]?.id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskType?.id])

  if (!taskType) return null
  const managerName = (id: string) =>
    managers.find((item) => item.id === id)?.name || '-'

  return (
    <Dialog open={!!taskType} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>Etapas de {taskType.name}</DialogTitle>
              <DialogDescription>
                A tarefa passa pelas etapas nesta ordem. Cada etapa pode estar
                num gerenciador diferente — a impressão na Impressão, o refile
                na Produção.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {taskType.steps.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-2"
              >
                <span className="text-sm text-gray-800">
                  <span className="mr-2 font-semibold">{index + 1}º</span>
                  {item.name}
                  <span className="text-gray">
                    {' '}
                    · {managerName(item.managerId)}
                  </span>
                </span>
                <div className="flex gap-1">
                  <ActionButton
                    Icon={IconArrowUp}
                    variant="neutralGhost"
                    tooltip="Subir"
                    disabled={index === 0}
                    onClick={() => onMove(item.id, 'UP')}
                  />
                  <ActionButton
                    Icon={IconArrowDown}
                    variant="neutralGhost"
                    tooltip="Descer"
                    disabled={index === taskType.steps.length - 1}
                    onClick={() => onMove(item.id, 'DOWN')}
                  />
                  <ActionButton
                    Icon={IconPencil}
                    variant="neutralGhost"
                    tooltip="Editar etapa"
                    onClick={() => {
                      setEditing(item.id)
                      setName(item.name)
                      setManagerId(item.managerId)
                    }}
                  />
                  <ActionButton
                    Icon={IconTrash}
                    variant="errorGhost"
                    tooltip="Remover etapa"
                    disabled={taskType.steps.length <= 1}
                    onClick={() => onRemove(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <form
            className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            onSubmit={async (event) => {
              event.preventDefault()
              const saved = await onSave({
                stepId: editing || undefined,
                name,
                managerId,
              })
              if (saved) {
                setEditing(null)
                setName('')
              }
            }}
          >
            <p className="text-sm font-medium text-gray-800">
              {editing ? 'Editar etapa' : 'Nova etapa'}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="step-name">Nome</Label>
                <Input
                  id="step-name"
                  placeholder="Ex.: Refile, Conferência"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <SelectBasic
                name="step-manager"
                label="Gerenciador"
                options={active.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={managerId}
                onChange={(value) => value && setManagerId(String(value))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="neutralOutline"
                LeftIcon={editing ? IconPencil : IconPlus}
                disabled={!name.trim() || !managerId}
              >
                {editing ? 'Salvar etapa' : 'Acrescentar etapa'}
              </Button>
              {editing && (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setEditing(null)}
                >
                  Cancelar edição
                </Button>
              )}
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
