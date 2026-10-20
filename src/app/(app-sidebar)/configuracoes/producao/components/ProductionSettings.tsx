'use client'

// Configuração da produção (ELITE), como o legado organiza
// (legado-gerenciador-de-producao.md §6.1 e §9) e as decisões de 05/10/2026
// (área 9 §4.14): os gerenciadores, agrupados por fluxo, com setor (de onde
// vem a cor), controle de tempo, intervalo entre tarefas e quem acessa; os
// tipos de tarefa, com regra de liberação e as etapas em cada gerenciador;
// os colaboradores com o perfil de acesso (GP-11); e os veículos da frota
// (VS-7). "Revisar é tirar": o modelo do gerenciador (simples, Kanban,
// múltiplos) saiu, porque o quadro é um só, com os seis estados.

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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ProductionCalendarCard } from './ProductionCalendar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import {
  StepsDialog,
  UsersDialog,
  ManagerDialog,
  VehicleDialog,
  TaskTypeDialog,
  InactivateManagerDialog,
} from './ProductionSettingsDialogs'

// Types
import type {
  Vehicle,
  TaskType,
  CollaboratorRole,
  ProductionManager,
} from '@/app/(app-sidebar)/producao/gerenciador/manager'

// Actions
import {
  saveManager,
  saveVehicle,
  saveTaskStep,
  saveTaskType,
  moveTaskStep,
  setManagerUser,
  removeTaskStep,
  getManagerConfig,
  setVehicleActive,
  reactivateManager,
  inactivateManager,
  setTaskTypeActive,
  setCollaboratorRole,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import {
  timeModeObj,
  releaseRuleObj,
  PRODUCTION_MANAGE,
  collaboratorRoleObj,
} from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconPlus,
  IconUsers,
  IconTruck,
  IconPencil,
  IconRestore,
  IconListNumbers,
  IconBuildingFactory2,
} from '@tabler/icons-react'

type Dialog =
  | { kind: 'manager'; manager?: ProductionManager }
  | { kind: 'users'; managerId: string }
  | { kind: 'inactivate'; manager: ProductionManager }
  | { kind: 'type'; taskType?: TaskType }
  | { kind: 'steps'; typeId: string }
  | { kind: 'vehicle'; vehicle?: Vehicle }
  | null

type Tab =
  | 'gerenciadores'
  | 'tipos'
  | 'colaboradores'
  | 'veiculos'
  | 'expediente'

const tabs: { value: Tab; label: string }[] = [
  { value: 'gerenciadores', label: 'Gerenciadores' },
  { value: 'tipos', label: 'Tipos de tarefa' },
  { value: 'colaboradores', label: 'Colaboradores' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'expediente', label: 'Expediente' },
]

// Colunas da tabela de cada aba, para o esqueleto da primeira carga
const skeletonCols: { [key in Exclude<Tab, 'expediente'>]: number } = {
  gerenciadores: 6,
  tipos: 5,
  colaboradores: 3,
  veiculos: 4,
}

export function ProductionSettings() {
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<Dialog>(null)
  const requested = params.get('aba') as Tab | null
  const tab: Tab = tabs.some((item) => item.value === requested)
    ? (requested as Tab)
    : 'gerenciadores'

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

  const newLabel: { [key in Tab]: string } = {
    gerenciadores: 'Novo gerenciador',
    tipos: 'Novo tipo de tarefa',
    colaboradores: '',
    veiculos: 'Novo veículo',
    expediente: '',
  }

  // O Topbar não depende da configuração: aparece já, também na carga
  const topbar = (
    <Topbar
      review="new"
      title="Produção"
      supportText="Gerenciadores, tipos de tarefa, colaboradores e veículos do gerenciador de produção"
      paramName="aba"
      activeTab={tab}
      tabs={tabs.map((item) => ({
        value: item.value,
        tab: item.value,
        label: item.label,
      }))}
      primaryCta={
        newLabel[tab] ? (
          <PermissionGate permissions={PRODUCTION_MANAGE}>
            <Button
              LeftIcon={IconPlus}
              onClick={() =>
                setDialog(
                  tab === 'tipos'
                    ? { kind: 'type' }
                    : tab === 'veiculos'
                      ? { kind: 'vehicle' }
                      : { kind: 'manager' },
                )
              }
            >
              {newLabel[tab]}
            </Button>
          </PermissionGate>
        ) : undefined
      }
    />
  )

  if (isLoading || !config)
    return (
      <div className="space-y-5">
        {topbar}
        <Card>
          <CardContent>
            {tab === 'expediente' ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>
                ))}
              </div>
            ) : (
              <TableSkeleton cols={skeletonCols[tab]} />
            )}
          </CardContent>
        </Card>
      </div>
    )

  const { flows, managers, taskTypes, collaborators, vehicles } = config
  const managerOf = (id: string) => managers.find((item) => item.id === id)
  const stepsIn = (managerId: string) =>
    taskTypes.flatMap((type) =>
      type.steps
        .filter((item) => item.managerId === managerId)
        .map((item) => `${type.name} › ${item.name}`),
    )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {topbar}

        {tab === 'gerenciadores' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FeaturedIcon
                  variant="neutralOutline"
                  Icon={IconBuildingFactory2}
                />
                <div>
                  <CardTitle>Gerenciadores</CardTitle>
                  <CardDescription>
                    Um por setor que produz. A cor é a do setor, no cadastro de
                    setores.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[24%]">Gerenciador</TableHead>
                    <TableHead className="w-[22%]">Controle de tempo</TableHead>
                    <TableHead className="w-[12%]">Intervalo</TableHead>
                    <TableHead className="w-[16%]">Quem acessa</TableHead>
                    <TableHead className="w-[18%]">
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
                                <div className="flex items-center gap-3">
                                  <SectorIcon
                                    name={manager.sector}
                                    size="lg"
                                    state={manager.active ? 'default' : 'muted'}
                                  />
                                  <div>
                                    <p className="font-medium">
                                      {manager.name}
                                    </p>
                                    <p className="text-xs text-gray">
                                      Setor {manager.sector}
                                    </p>
                                    {!manager.active && (
                                      <Badge
                                        variant="neutralLight"
                                        className="mt-1"
                                      >
                                        Inativo
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {timeModeObj[manager.timeMode].text}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {manager.intervalMinutes
                                  ? `${manager.intervalMinutes} min`
                                  : '-'}
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
                                <PermissionGate permissions={PRODUCTION_MANAGE}>
                                  <div className="flex justify-end gap-1">
                                    <ActionButton
                                      Icon={IconPencil}
                                      tooltip={`Editar ${manager.name}`}
                                      onClick={() =>
                                        setDialog({ kind: 'manager', manager })
                                      }
                                    />
                                    <ActionButton
                                      Icon={IconUsers}
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
              Cada setor escolhe como captura o tempo: o relógio individual
              (Play & Stop) ou arrastar o colaborador para a tarefa (coletivo).
            </CardFooter>
          </Card>
        )}

        {tab === 'tipos' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FeaturedIcon variant="neutralOutline" Icon={IconListNumbers} />
                <div>
                  <CardTitle>Tipos de tarefa</CardTitle>
                  <CardDescription>
                    O tipo é escolhido na etapa da composição do produto ou do
                    processo (IP-23); é por ele que a tarefa sabe por onde
                    passa.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
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
                        <p className="font-medium">{type.name}</p>
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
                          {type.steps.map((item, index) => {
                            const manager = managerOf(item.managerId)
                            return (
                              <Fragment key={item.id}>
                                {index > 0 && (
                                  <span className="text-gray">→</span>
                                )}
                                <span className="flex items-center gap-1.5 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                  {manager && (
                                    <SectorIcon
                                      name={manager.sector}
                                      size="sm"
                                      bare
                                    />
                                  )}
                                  {index + 1}º {item.name} ·{' '}
                                  {manager?.name || '-'}
                                </span>
                              </Fragment>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PermissionGate permissions={PRODUCTION_MANAGE}>
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              Icon={IconPencil}
                              tooltip={`Editar ${type.name}`}
                              onClick={() =>
                                setDialog({ kind: 'type', taskType: type })
                              }
                            />
                            <ActionButton
                              Icon={IconListNumbers}
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
          </Card>
        )}

        {tab === 'colaboradores' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FeaturedIcon variant="neutralOutline" Icon={IconUsers} />
                <div>
                  <CardTitle>Colaboradores na produção</CardTitle>
                  <CardDescription>
                    Quem vê o quê é configuração de acesso (GP-11): o perfil diz
                    se a pessoa vê tudo; o acesso a cada gerenciador diz o que o
                    operador vê nele.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[26%]">Colaborador</TableHead>
                    <TableHead className="w-[28%]">Perfil</TableHead>
                    <TableHead className="w-[46%]">Gerenciadores</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collaborators.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-xs text-gray">
                          {person.email || 'sem usuário ligado'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <PermissionGate
                          permissions={PRODUCTION_MANAGE}
                          fallback={
                            <span className="text-sm text-gray-700">
                              {collaboratorRoleObj[person.role].text}
                            </span>
                          }
                        >
                          <SelectBasic
                            name={`role-${person.id}`}
                            label=""
                            className="w-[220px]"
                            options={(
                              Object.keys(
                                collaboratorRoleObj,
                              ) as CollaboratorRole[]
                            ).map((role) => ({
                              value: role,
                              label: collaboratorRoleObj[role].text,
                            }))}
                            value={person.role}
                            onChange={(value) =>
                              value &&
                              run(
                                setCollaboratorRole({
                                  collaboratorId: person.id,
                                  role: value as CollaboratorRole,
                                }),
                                'Perfil alterado',
                              )
                            }
                          />
                        </PermissionGate>
                        <p className="mt-1 text-xs text-gray">
                          {collaboratorRoleObj[person.role].help}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {person.role === 'MANAGER'
                          ? 'Todos'
                          : managers
                              .filter(
                                (manager) =>
                                  manager.active &&
                                  manager.users.some(
                                    (user) => user.collaboratorId === person.id,
                                  ),
                              )
                              .map((manager) => {
                                const user = manager.users.find(
                                  (item) => item.collaboratorId === person.id,
                                )
                                return `${manager.name}${user?.onlyAssigned ? ' (só as dele)' : ''}`
                              })
                              .join(', ') || 'Nenhum'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-sm text-gray">
              A produtividade por pessoa só aparece para quem edita a produção
              (gerente). O acesso por gerenciador é dado em &quot;Quem
              acessa&quot;, na aba Gerenciadores.
            </CardFooter>
          </Card>
        )}

        {tab === 'expediente' && (
          <ProductionCalendarCard
            calendar={config.calendar}
            onSaved={refresh}
          />
        )}

        {tab === 'veiculos' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FeaturedIcon variant="neutralOutline" Icon={IconTruck} />
                <div>
                  <CardTitle>Veículos</CardTitle>
                  <CardDescription>
                    A frota que a instalação e a entrega ocupam na agenda
                    (VS-7).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[44%]">Veículo</TableHead>
                    <TableHead className="w-[30%]">Placa</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[12%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-700">
                        {vehicle.plate || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vehicle.active ? 'successLight' : 'neutralLight'
                          }
                        >
                          {vehicle.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PermissionGate permissions={PRODUCTION_MANAGE}>
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              Icon={IconPencil}
                              tooltip={`Editar ${vehicle.name}`}
                              onClick={() =>
                                setDialog({ kind: 'vehicle', vehicle })
                              }
                            />
                            <ActionButton
                              Icon={vehicle.active ? IconBan : IconRestore}
                              variant={
                                vehicle.active ? 'errorGhost' : 'neutralGhost'
                              }
                              tooltip={
                                vehicle.active
                                  ? `Inativar ${vehicle.name}`
                                  : `Reativar ${vehicle.name}`
                              }
                              onClick={() =>
                                run(
                                  setVehicleActive({
                                    id: vehicle.id,
                                    active: !vehicle.active,
                                  }),
                                  vehicle.active
                                    ? 'Veículo inativado'
                                    : 'Veículo reativado',
                                )
                              }
                            />
                          </div>
                        </PermissionGate>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!vehicles.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-sm text-gray">
                        Nenhum veículo cadastrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
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
      <VehicleDialog
        open={dialog?.kind === 'vehicle'}
        vehicle={dialog?.kind === 'vehicle' ? dialog.vehicle : undefined}
        onOpenChange={() => setDialog(null)}
        onSave={async (values) => {
          const id = dialog?.kind === 'vehicle' ? dialog.vehicle?.id : undefined
          if (await run(saveVehicle({ id, values }), 'Veículo salvo'))
            setDialog(null)
        }}
      />
    </TooltipProvider>
  )
}
