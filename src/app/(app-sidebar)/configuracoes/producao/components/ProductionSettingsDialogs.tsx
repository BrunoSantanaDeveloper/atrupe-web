'use client'

// Diálogos da configuração da produção: gerenciador (setor, controle de
// tempo, intervalo), acesso dos colaboradores, inativar com destino, tipo
// de tarefa (sem cor: usa a do setor), as etapas dele e os veículos.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useState } from 'react'
import { getAssets } from '@/actions/asset'
import { useQuery } from '@tanstack/react-query'

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
import { SectorIcon } from '@/components/common/SectorIcon'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type {
  Vehicle,
  TaskType,
  TimeMode,
  ReleaseRule,
  Collaborator,
  ProductionFlow,
  ProductionManager,
  ManagerHours,
  LiveSchedule,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'
import { NO_HOURS } from '@/app/(app-sidebar)/producao/gerenciador/manager'
import type { ProductionCalendar } from '@/actions/production-manager'

// Hooks / Store / Consts
import { usePending } from '@/hooks/usePending'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { useCompanySectors } from '@/hooks/queries/useCompanySectors'
import { timeModeObj, releaseRuleObj } from '@/consts/productionManager'

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
 * Gerenciador: um setor de trabalho, com o jeito de capturar o tempo (GP-43)
 * e o intervalo entre tarefas (GP-20)
 * ------------------------------------------------------------------------- */

export type ManagerValues = {
  name: string
  sector: string
  flowId: string
  timeMode: TimeMode
  intervalMinutes: number
  hours: ManagerHours
  liveSchedule: LiveSchedule
  afterDoneMinutes: number
}

export function ManagerDialog({
  open,
  manager,
  flows,
  calendar,
  onOpenChange,
  onSave,
}: {
  open: boolean
  manager?: ProductionManager
  flows: ProductionFlow[]
  // O gerenciador novo nasce com o expediente da empresa (GP-49)
  calendar?: ProductionCalendar
  onOpenChange: (open: boolean) => void
  onSave: (values: ManagerValues) => void | Promise<unknown>
}) {
  const { sectors } = useCompanySectors()
  const { pending, track } = usePending()
  const { hasFeature } = usePlanFeatures()
  // O controle de tempo é do ELITE (production_manager); o PRO, com a tela
  // por setor, só tem o modo sem tempo (GP-47)
  const withTime = hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
  const [values, setValues] = useState<ManagerValues>({
    name: '',
    sector: '',
    flowId: '',
    timeMode: withTime ? 'PLAY_STOP' : 'NONE',
    intervalMinutes: 0,
    hours: NO_HOURS,
    liveSchedule: 'WARN',
    afterDoneMinutes: 0,
  })

  useEffect(() => {
    if (open) {
      setValues({
        name: manager?.name || '',
        sector: manager?.sector || '',
        flowId: manager?.flowId || flows[0]?.id || '',
        timeMode: manager?.timeMode || (withTime ? 'PLAY_STOP' : 'NONE'),
        intervalMinutes: manager?.intervalMinutes || 0,
        hours:
          manager?.hours ||
          (calendar
            ? {
                workStart: calendar.startTime,
                workEnd: calendar.endTime,
                breakStart: calendar.breakStart,
                breakEnd: calendar.breakEnd,
                runsThroughBreak: false,
              }
            : NO_HOURS),
        liveSchedule: manager?.liveSchedule || 'WARN',
        afterDoneMinutes: manager?.afterDoneMinutes || 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, manager, flows])

  const sectorOptions = Array.from(
    new Set([...(sectors || []), values.sector].filter(Boolean)),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>
                {manager ? `Editar ${manager.name}` : 'Novo gerenciador'}
              </DialogTitle>
              <DialogDescription>
                O gerenciador é o setor na produção: a fila dele, o jeito de
                capturar o tempo e a cor, que vem do cadastro de setores.
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
            <div className="flex items-end gap-2">
              <SelectBasic
                name="manager-sector"
                label="Setor"
                className="flex-1"
                options={sectorOptions.map((name) => ({
                  value: name,
                  label: name,
                }))}
                value={values.sector}
                onChange={(value) =>
                  value &&
                  setValues((current) => ({
                    ...current,
                    sector: String(value),
                    name: current.name || String(value),
                  }))
                }
              />
              {values.sector && (
                <SectorIcon name={values.sector} size="lg" className="mb-0.5" />
              )}
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
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="manager-interval">
                  Intervalo entre tarefas (min)
                </Label>
                <InfoHint title="Intervalo entre tarefas">
                  <p>
                    O tempo entre uma tarefa e a seguinte no mesmo equipamento:
                    troca de material, limpeza.
                  </p>
                  <p>
                    Não é o preparo da tarefa. Quem já conta a troca dentro do
                    preparo deixa zero.
                  </p>
                </InfoHint>
              </div>
              <Input
                id="manager-interval"
                type="number"
                min={0}
                value={values.intervalMinutes}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    intervalMinutes: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Controle de tempo</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(Object.keys(timeModeObj) as TimeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={mode !== 'NONE' && !withTime}
                  onClick={() =>
                    setValues((current) => ({ ...current, timeMode: mode }))
                  }
                  className={cn(
                    // O botão centraliza o conteúdo: o cartão de texto curto
                    // começava mais baixo que o vizinho
                    'flex flex-col justify-start rounded-lg border p-3 text-left',
                    values.timeMode === mode
                      ? 'border-brand-500 bg-brand-25 ring-1 ring-brand-500'
                      : 'border-gray-200 hover:border-gray-300',
                    mode !== 'NONE' && !withTime && 'opacity-50',
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
            {!withTime && (
              <p className="text-xs text-gray">
                Iniciar, pausar e medir o tempo das tarefas são do plano Elite.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="manager-after-done">
                Tempo após a conclusão (min)
              </Label>
              <InfoHint title="Tempo após a conclusão">
                <p>
                  A espera depois de concluir antes da etapa seguinte começar,
                  como a secagem da impressão antes do acabamento.
                </p>
                <p>Entra na previsão da entrega. Sem espera, deixe zero.</p>
              </InfoHint>
            </div>
            <Input
              id="manager-after-done"
              type="number"
              min={0}
              className="sm:max-w-[200px]"
              value={values.afterDoneMinutes}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  afterDoneMinutes: Number(event.target.value) || 0,
                }))
              }
            />
          </div>
          {values.timeMode !== 'NONE' && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Expediente</Label>
                  <InfoHint title="Expediente do gerenciador">
                    <p>
                      O horário deste setor. A fila prevê o início e o fim de
                      cada trabalho por ele, e o que passar do fim fica em
                      vermelho.
                    </p>
                    <p>
                      O gerenciador novo vem com o expediente da empresa, que
                      pode ser editado aqui. Em branco, vale o da empresa. O
                      intervalo (almoço) é opcional.
                    </p>
                  </InfoHint>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      ['workStart', 'Início'],
                      ['workEnd', 'Fim'],
                      ['breakStart', 'Intervalo de'],
                      ['breakEnd', 'Intervalo até'],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field} className="space-y-1">
                      <Label
                        htmlFor={`manager-${field}`}
                        className="text-xs text-gray"
                      >
                        {label}
                      </Label>
                      <Input
                        id={`manager-${field}`}
                        type="time"
                        value={values.hours[field] || ''}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            hours: {
                              ...current.hours,
                              [field]: event.target.value || null,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <Switch
                    checked={values.hours.runsThroughBreak}
                    onCheckedChange={(checked) =>
                      setValues((current) => ({
                        ...current,
                        hours: { ...current.hours, runsThroughBreak: checked },
                      }))
                    }
                  />
                  A máquina segue trabalhando no intervalo
                </label>
              </div>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!values.name.trim() || !values.sector || !values.flowId}
            isLoading={!!pending}
            onClick={() => track('save', () => onSave(values))}
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
                O operador vê as tarefas do setor ou só as atribuídas a ele; o
                gerente de produção vê tudo, em qualquer gerenciador.
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
                {person.role === 'MANAGER' && (
                  <span className="font-normal text-gray"> · gerente</span>
                )}
              </span>
              <SelectBasic
                name={`access-${person.id}`}
                label=""
                className="w-[220px]"
                disabled={person.role === 'MANAGER'}
                options={[
                  { value: 'NONE', label: 'Sem acesso' },
                  { value: 'ALL', label: 'Todas as tarefas' },
                  { value: 'ASSIGNED', label: 'Só as atribuídas a ele' },
                ]}
                value={person.role === 'MANAGER' ? 'ALL' : accessOf(person.id)}
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
                As etapas que passam por ele vão para outro gerenciador. Nenhuma
                tarefa fica sem lugar.
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
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="errorOutline"
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
 * Tipo de tarefa (GP-12, GP-13): sem cor própria, usa a do setor
 * ------------------------------------------------------------------------- */

export type TaskTypeValues = {
  name: string
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
  onSave: (values: TaskTypeValues) => void | Promise<unknown>
}) {
  const { pending, track } = usePending()
  const [values, setValues] = useState<TaskTypeValues>({
    name: '',
    release: 'WITH_BASE',
    timeControl: true,
  })

  useEffect(() => {
    if (open) {
      setValues({
        name: taskType?.name || '',
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
                quais gerenciadores a tarefa passa e quando ela é liberada. A
                cor é a do setor de cada etapa.
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
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800">
                  Controla tempo
                </span>
                <InfoHint title="Relógio">
                  <p>
                    Ligado, o relógio mede o tempo apontado nas tarefas deste
                    tipo. É esse tempo que a produtividade compara com o
                    vendido.
                  </p>
                </InfoHint>
              </div>
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
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!values.name.trim() || (!taskType && !values.managerId)}
            isLoading={!!pending}
            onClick={() => track('save', () => onSave(values))}
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
  const { pending, track } = usePending()
  const active = managers.filter((item) => item.active)

  useEffect(() => {
    setEditing(null)
    setName('')
    setManagerId(active[0]?.id || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskType?.id])

  if (!taskType) return null
  const managerOf = (id: string) => managers.find((item) => item.id === id)

  return (
    <Dialog open={!!taskType} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>Etapas de {taskType.name}</DialogTitle>
              <DialogDescription>
                A tarefa passa pelas etapas nesta ordem. Cada etapa pode estar
                num gerenciador diferente: a impressão na Impressão, o refile na
                Produção.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {taskType.steps.map((item, index) => {
              const manager = managerOf(item.managerId)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="font-semibold">{index + 1}º</span>
                    {manager && <SectorIcon name={manager.sector} size="sm" />}
                    {item.name}
                    <span className="text-gray">· {manager?.name || '-'}</span>
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
              )
            })}
          </div>

          <form
            className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            onSubmit={async (event) => {
              event.preventDefault()
              const saved = await track('step', () =>
                onSave({
                  stepId: editing || undefined,
                  name,
                  managerId,
                }),
              )
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
                isLoading={!!pending}
              >
                {editing ? 'Salvar etapa' : 'Adicionar etapa'}
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

/* ---------------------------------------------------------------------------
 * Veículo da frota (VS-7)
 * ------------------------------------------------------------------------- */

export function VehicleDialog({
  open,
  vehicle,
  onOpenChange,
  onSave,
}: {
  open: boolean
  vehicle?: Vehicle
  onOpenChange: (open: boolean) => void
  onSave: (values: {
    name: string
    plate: string
    assetId?: string | null
  }) => void | Promise<unknown>
}) {
  const { pending, track } = usePending()
  const [name, setName] = useState('')
  const [plate, setPlate] = useState('')
  // O veículo é o patrimônio (VE-1): o bem da frota, com o custo por km e
  // a manutenção
  const [assetId, setAssetId] = useState('')
  const { data: assets } = useQuery({
    queryKey: ['assets-vehicles'],
    queryFn: () => getAssets({ filters: { kind: 'VEHICLES' } }),
    enabled: open,
  })

  useEffect(() => {
    if (open) {
      setName(vehicle?.name || '')
      setPlate(vehicle?.plate || '')
      setAssetId(vehicle?.assetId || '')
    }
  }, [open, vehicle])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {vehicle ? `Editar ${vehicle.name}` : 'Novo veículo'}
          </DialogTitle>
          <DialogDescription>
            A instalação e a entrega ocupam o veículo na agenda: horário, km e
            quem sai.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vehicle-name">Nome</Label>
            <Input
              id="vehicle-name"
              placeholder="Ex.: Fiorino"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle-plate">Placa</Label>
            <Input
              id="vehicle-plate"
              placeholder="ABC-1D23"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <SelectBasic
              name="vehicle-asset"
              label="Patrimônio"
              placeholder="Escolher o bem da frota"
              options={[
                { value: 'none', label: 'Sem patrimônio' },
                ...(assets?.data || []).map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
              value={assetId || 'none'}
              onChange={(value) =>
                setAssetId(value === 'none' ? '' : String(value))
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!name.trim()}
            isLoading={!!pending}
            onClick={() =>
              track('save', () =>
                onSave({ name, plate, assetId: assetId || null }),
              )
            }
          >
            {vehicle ? 'Salvar' : 'Cadastrar veículo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
