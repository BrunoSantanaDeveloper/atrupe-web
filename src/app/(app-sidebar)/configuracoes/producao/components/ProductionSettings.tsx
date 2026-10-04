'use client'

// Configuração da produção (ELITE), como o legado organiza
// (legado-gerenciador-de-producao.md §6.1 e §9): os gerenciadores, agrupados
// por fluxo, com modelo, controle de tempo e quem acessa; e os tipos de
// tarefa, com cor, regra de liberação e as etapas em cada gerenciador.

// React / Next
import { Fragment, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  StepsDialog,
  UsersDialog,
  ManagerDialog,
  TaskTypeDialog,
  InactivateManagerDialog,
} from './ProductionSettingsDialogs'

// Types
import type {
  TaskType,
  ProductionManager,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

// Actions
import {
  saveManager,
  saveTaskStep,
  saveTaskType,
  moveTaskStep,
  setManagerUser,
  removeTaskStep,
  getManagerConfig,
  reactivateManager,
  inactivateManager,
  setTaskTypeActive,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import {
  timeModeObj,
  releaseRuleObj,
  managerModelObj,
} from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconUsers,
  IconPencil,
  IconRestore,
  IconPlus,
  IconListNumbers,
} from '@tabler/icons-react'

// Utils

const EDIT = ['production:production:view']

type Dialog =
  | { kind: 'manager'; manager?: ProductionManager }
  | { kind: 'users'; managerId: string }
  | { kind: 'inactivate'; manager: ProductionManager }
  | { kind: 'type'; taskType?: TaskType }
  | { kind: 'steps'; typeId: string }
  | null

const tabs = [
  { value: 'gerenciadores', label: 'Gerenciadores' },
  { value: 'tipos', label: 'Tipos de tarefa' },
]

export function ProductionSettings() {
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  const tab = params.get('aba') === 'tipos' ? 'tipos' : 'gerenciadores'

  const { data, isLoading } = useQuery({
    queryKey: ['production-config'],
    queryFn: () => getManagerConfig(),
  })
  const config = data?.data

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['production-config'] })

  const run = async (
    action: Promise<{ success: boolean; message: string }>,
    success?: string,
  ) => {
    const res = await action
    if (!res.success) {
      toast.error(res.message)
      return false
    }
    if (success) toast.success(success)
    await refresh()
    return true
  }

  if (isLoading || !config) return <Skeleton className="h-[480px] w-full" />

  const { flows, managers, taskTypes, collaborators } = config
  const managerName = (id: string) =>
    managers.find((item) => item.id === id)?.name || '-'
  const stepsIn = (managerId: string) =>
    taskTypes.flatMap((type) =>
      type.steps
        .filter((item) => item.managerId === managerId)
        .map((item) => `${type.name} › ${item.name}`),
    )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Produção"
          supportText="Gerenciadores e tipos de tarefa do gerenciador de produção"
          paramName="aba"
          activeTab={tab}
          tabs={tabs.map((item) => ({
            value: item.value,
            tab: item.value,
            label: item.label,
          }))}
          primaryCta={
            <PermissionGate permissions={EDIT}>
              <Button
                LeftIcon={IconPlus}
                onClick={() =>
                  setDialog(
                    tab === 'tipos' ? { kind: 'type' } : { kind: 'manager' },
                  )
                }
              >
                {tab === 'tipos' ? 'Novo tipo de tarefa' : 'Novo gerenciador'}
              </Button>
            </PermissionGate>
          }
        />

        {tab === 'gerenciadores' ? (
          <Card>
            <CardContent>
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[22%]">Gerenciador</TableHead>
                    <TableHead className="w-[14%]">Modelo</TableHead>
                    <TableHead className="w-[20%]">Controle de tempo</TableHead>
                    <TableHead className="w-[14%]">Quem acessa</TableHead>
                    <TableHead className="w-[22%]">
                      Etapas que passam por ele
                    </TableHead>
                    <TableHead className="w-[8%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flows.map((flow) => (
                    <Fragment key={flow.id}>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableCell colSpan={6}>
                          <span className="font-medium">
                            Fluxo · {flow.name}
                          </span>
                        </TableCell>
                      </TableRow>
                      {managers
                        .filter((item) => item.flowId === flow.id)
                        .map((manager) => {
                          const steps = stepsIn(manager.id)
                          return (
                            <TableRow key={manager.id}>
                              <TableCell>
                                <p className="font-medium">{manager.name}</p>
                                {!manager.active && (
                                  <Badge
                                    variant="neutralLight"
                                    className="mt-1"
                                  >
                                    Inativo
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {managerModelObj[manager.model].text}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {timeModeObj[manager.timeMode].text}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {manager.users.length
                                  ? manager.users
                                      .map(
                                        (user) =>
                                          collaborators.find(
                                            (item) =>
                                              item.id === user.collaboratorId,
                                          )?.name +
                                          (user.onlyAssigned
                                            ? ' (só as dele)'
                                            : ''),
                                      )
                                      .join(', ')
                                  : 'Ninguém'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {steps.length ? (
                                  <div className="flex flex-wrap gap-1">
                                    {steps.map((text) => (
                                      <span
                                        key={text}
                                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                                      >
                                        {text}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <PermissionGate permissions={EDIT}>
                                  <div className="flex justify-end gap-1">
                                    <ActionButton
                                      Icon={IconPencil}
                                      variant="neutralGhost"
                                      tooltip={`Editar ${manager.name}`}
                                      onClick={() =>
                                        setDialog({ kind: 'manager', manager })
                                      }
                                    />
                                    <ActionButton
                                      Icon={IconUsers}
                                      variant="neutralGhost"
                                      tooltip="Quem acessa"
                                      onClick={() =>
                                        setDialog({
                                          kind: 'users',
                                          managerId: manager.id,
                                        })
                                      }
                                    />
                                    {manager.active ? (
                                      <ActionButton
                                        Icon={IconBan}
                                        variant="errorGhost"
                                        tooltip={`Inativar ${manager.name}`}
                                        onClick={() =>
                                          setDialog({
                                            kind: 'inactivate',
                                            manager,
                                          })
                                        }
                                      />
                                    ) : (
                                      <ActionButton
                                        Icon={IconRestore}
                                        variant="neutralGhost"
                                        tooltip={`Reativar ${manager.name}`}
                                        onClick={() =>
                                          run(
                                            reactivateManager({
                                              id: manager.id,
                                            }),
                                            'Gerenciador reativado',
                                          )
                                        }
                                      />
                                    )}
                                  </div>
                                </PermissionGate>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-gray">
              Cada setor escolhe como trabalha: a fila simples ou o quadro por
              etapa, o relógio individual ou arrastar o colaborador.
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[20%]">Tipo de tarefa</TableHead>
                    <TableHead className="w-[22%]">Liberação</TableHead>
                    <TableHead className="w-[12%]">Tempo</TableHead>
                    <TableHead className="w-[38%]">Etapas</TableHead>
                    <TableHead className="w-[8%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taskTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <p className="flex items-center gap-2 font-medium">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </p>
                        {!type.active && (
                          <Badge variant="neutralLight" className="mt-1">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {releaseRuleObj[type.release].text}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {type.timeControl ? 'Controla tempo' : 'Sem controle'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          {type.steps.map((item, index) => (
                            <Fragment key={item.id}>
                              {index > 0 && (
                                <span className="text-gray">→</span>
                              )}
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                {index + 1}º {item.name} ·{' '}
                                {managerName(item.managerId)}
                              </span>
                            </Fragment>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PermissionGate permissions={EDIT}>
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              Icon={IconPencil}
                              variant="neutralGhost"
                              tooltip={`Editar ${type.name}`}
                              onClick={() =>
                                setDialog({ kind: 'type', taskType: type })
                              }
                            />
                            <ActionButton
                              Icon={IconListNumbers}
                              variant="neutralGhost"
                              tooltip="Etapas"
                              onClick={() =>
                                setDialog({ kind: 'steps', typeId: type.id })
                              }
                            />
                            <ActionButton
                              Icon={type.active ? IconBan : IconRestore}
                              variant={
                                type.active ? 'errorGhost' : 'neutralGhost'
                              }
                              tooltip={
                                type.active
                                  ? `Inativar ${type.name}`
                                  : `Reativar ${type.name}`
                              }
                              onClick={() =>
                                run(
                                  setTaskTypeActive({
                                    id: type.id,
                                    active: !type.active,
                                  }),
                                  type.active
                                    ? 'Tipo inativado'
                                    : 'Tipo reativado',
                                )
                              }
                            />
                          </div>
                        </PermissionGate>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-gray">
              O tipo de tarefa é escolhido na etapa da composição do produto ou
              do processo; é por ele que a tarefa sabe por onde passa.
            </CardFooter>
          </Card>
        )}
      </div>

      <ManagerDialog
        open={dialog?.kind === 'manager'}
        manager={dialog?.kind === 'manager' ? dialog.manager : undefined}
        flows={flows}
        onOpenChange={() => setDialog(null)}
        onSave={async (values) => {
          const id = dialog?.kind === 'manager' ? dialog.manager?.id : undefined
          if (await run(saveManager({ id, values }), 'Gerenciador salvo'))
            setDialog(null)
        }}
      />
      <UsersDialog
        manager={
          dialog?.kind === 'users'
            ? managers.find((item) => item.id === dialog.managerId)
            : undefined
        }
        collaborators={collaborators}
        onOpenChange={() => setDialog(null)}
        onChange={(collaboratorId, access) => {
          if (dialog?.kind !== 'users') return
          run(
            setManagerUser({
              managerId: dialog.managerId,
              collaboratorId,
              access,
            }),
            'Acesso alterado',
          )
        }}
      />
      <InactivateManagerDialog
        manager={dialog?.kind === 'inactivate' ? dialog.manager : undefined}
        managers={managers}
        onOpenChange={() => setDialog(null)}
        onConfirm={async (destinationId) => {
          if (dialog?.kind !== 'inactivate') return
          if (
            await run(
              inactivateManager({ id: dialog.manager.id, destinationId }),
              'Gerenciador inativado; as etapas foram para o destino',
            )
          )
            setDialog(null)
        }}
      />
      <TaskTypeDialog
        open={dialog?.kind === 'type'}
        taskType={dialog?.kind === 'type' ? dialog.taskType : undefined}
        managers={managers}
        onOpenChange={() => setDialog(null)}
        onSave={async (values) => {
          const id = dialog?.kind === 'type' ? dialog.taskType?.id : undefined
          if (await run(saveTaskType({ id, values }), 'Tipo de tarefa salvo'))
            setDialog(null)
        }}
      />
      <StepsDialog
        taskType={
          dialog?.kind === 'steps'
            ? taskTypes.find((item) => item.id === dialog.typeId)
            : undefined
        }
        managers={managers}
        onOpenChange={() => setDialog(null)}
        onSave={(values) =>
          dialog?.kind === 'steps'
            ? run(
                saveTaskStep({ typeId: dialog.typeId, ...values }),
                'Etapa salva',
              )
            : Promise.resolve(false)
        }
        onRemove={(stepId) =>
          dialog?.kind === 'steps' &&
          run(
            removeTaskStep({ typeId: dialog.typeId, stepId }),
            'Etapa removida',
          )
        }
        onMove={(stepId, direction) =>
          dialog?.kind === 'steps' &&
          run(moveTaskStep({ typeId: dialog.typeId, stepId, direction }))
        }
      />
    </TooltipProvider>
  )
}
