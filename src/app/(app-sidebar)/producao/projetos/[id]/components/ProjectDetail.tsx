'use client'

// O projeto por dentro (GP-8, GP-16, GP-18): a venda, a entrega com o prazo
// em atraso e o risco da cadeia, e as tarefas agrupadas por item, uma por
// etapa da composição, com setor (na cor dele), estado, previsto × apontado
// e quem faz. Cards com ícone de destaque (design.md §18.4).

// React / Next
import Link from 'next/link'
import { Fragment, useState } from 'react'

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
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  duration,
  taskStatusBadge,
  TaskDetailDialog,
} from '../../../gerenciador/components/TaskDetailDialog'

// Actions
import {
  getProject,
  changeDelivery,
  getViewer,
  getManagerConfig,
  setProjectStatus,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { projectStatusObj, PRODUCTION_MANAGE } from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconSearch,
  IconPrinter,
  IconCalendar,
  IconPlayerPlay,
  IconCircleCheck,
  IconReportMoney,
  IconTruckDelivery,
  IconListCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

export function ProjectDetail({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [deliveryOpen, setDeliveryOpen] = useState(false)
  const [due, setDue] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['production-project', id],
    queryFn: () => getProject({ id }),
  })
  const { data: configRes } = useQuery({
    queryKey: ['production-config'],
    queryFn: () => getManagerConfig(),
  })
  // Quem está olhando: o padrão de "Quem faz" no diálogo da tarefa
  const { data: viewerRes } = useQuery({
    queryKey: ['production-viewer'],
    queryFn: () => getViewer(),
    staleTime: 60_000,
  })

  const detail = data?.data
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['production-project', id] }),
      queryClient.invalidateQueries({ queryKey: ['production-projects'] }),
      queryClient.invalidateQueries({ queryKey: ['production-config'] }),
      queryClient.invalidateQueries({ queryKey: ['production-board'] }),
    ])

  if (isLoading || !detail) return <Skeleton className="h-[480px] w-full" />

  const { project, tasks, late, risk } = detail
  const items = Array.from(new Set(tasks.map((task) => task.itemName)))
  const task = tasks.find((item) => item.id === taskId) || null
  const alerts = tasks.filter((item) => item.alert).length

  const changeStatus = (status: 'PRODUCTION' | 'DONE' | 'CANCELED') =>
    alertDialog.open({
      title:
        status === 'PRODUCTION'
          ? `Liberar a produção de ${project.number}?`
          : status === 'DONE'
            ? `Concluir ${project.number}?`
            : `Cancelar ${project.number}?`,
      description:
        status === 'PRODUCTION'
          ? 'As tarefas entram nas filas dos gerenciadores, cada uma pela regra de liberação do seu tipo.'
          : status === 'DONE'
            ? 'Só é possível com todas as tarefas finalizadas.'
            : 'As tarefas abertas são canceladas. Esta ação não poderá ser desfeita.',
      confirmLabel:
        status === 'PRODUCTION'
          ? 'Liberar'
          : status === 'DONE'
            ? 'Concluir'
            : 'Cancelar projeto',
      cancelLabel: 'Cancelar',
      confirmVariant: status === 'CANCELED' ? 'error' : 'primary',
      onConfirm: async () => {
        const res = await setProjectStatus({ id, status })
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: {
        success: 'Projeto atualizado',
        error: 'Não foi possível atualizar',
      },
    })

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={`Projeto ${project.number}`}
          previousPage="/producao/projetos"
          supportText={project.client}
          badge={projectStatusObj[project.status]}
          primaryCta={
            <div className="flex flex-wrap gap-2">
              <Button variant="neutralOutline" LeftIcon={IconPrinter} asChild>
                <Link href={`/producao/projetos/${id}/ficha`}>
                  Ficha de produção
                </Link>
              </Button>
              <PermissionGate permissions={PRODUCTION_MANAGE}>
                {project.status === 'STANDBY' && (
                  <Button
                    LeftIcon={IconPlayerPlay}
                    onClick={() => changeStatus('PRODUCTION')}
                  >
                    Liberar produção
                  </Button>
                )}
                {project.status === 'PRODUCTION' && (
                  <Button
                    LeftIcon={IconCircleCheck}
                    onClick={() => changeStatus('DONE')}
                  >
                    Concluir projeto
                  </Button>
                )}
              </PermissionGate>
            </div>
          }
        />

        {(late || risk || alerts > 0) && (
          <p className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
            {late
              ? 'O prazo de entrega já passou.'
              : 'A entrega está em risco: o que falta na cadeia não cabe até o prazo.'}{' '}
            {alerts > 0 &&
              `${alerts} etapa(s) com alerta. Reagendar é manual: abra a etapa e ajuste a agenda, ou altere a entrega.`}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FeaturedIcon variant="neutralOutline" Icon={IconReportMoney} />
                <CardTitle>Venda</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6 text-sm">
              <p className="flex justify-between">
                <span className="text-gray">Vendedor</span>
                {project.seller}
              </p>
              <p className="flex justify-between">
                <span className="text-gray">Aprovação</span>
                {date(project.approvedAt)}
              </p>
              <p className="flex justify-between">
                <span className="text-gray">Itens</span>
                {items.length}
              </p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div className="flex items-center gap-3">
                <FeaturedIcon
                  variant="neutralOutline"
                  Icon={IconTruckDelivery}
                />
                <div>
                  <CardTitle>Entrega</CardTitle>
                  <CardDescription>{project.deliveryType}</CardDescription>
                </div>
              </div>
              <PermissionGate permissions={PRODUCTION_MANAGE}>
                {project.status !== 'DONE' && project.status !== 'CANCELED' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="neutralOutline"
                      LeftIcon={IconCalendar}
                      onClick={() => {
                        setDue(project.due)
                        setDeliveryOpen(true)
                      }}
                    >
                      Alterar entrega
                    </Button>
                    <Button
                      size="sm"
                      variant="errorOutline"
                      LeftIcon={IconBan}
                      onClick={() => changeStatus('CANCELED')}
                    >
                      Cancelar projeto
                    </Button>
                  </div>
                )}
              </PermissionGate>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 px-6 pb-6 text-sm">
              <p>
                <span className="block text-gray">Primeiro prazo</span>
                {date(project.firstDue)}
              </p>
              <p>
                <span className="block text-gray">Prazo atual</span>
                {date(project.due)}
                {late && (
                  <Badge variant="errorLight" className="ml-2">
                    Em atraso
                  </Badge>
                )}
                {!late && risk && (
                  <Badge variant="warningLight" className="ml-2">
                    Em risco
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FeaturedIcon variant="neutralOutline" Icon={IconListCheck} />
              <div>
                <CardTitle>Tarefas</CardTitle>
                <CardDescription>
                  Uma para cada etapa da composição dos itens, na medida
                  vendida. O acabamento espera a base quando o tipo dele manda.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[9%]">Código</TableHead>
                  <TableHead className="w-[27%]">Etapa</TableHead>
                  <TableHead className="w-[18%]">Tipo · etapa atual</TableHead>
                  <TableHead className="w-[16%]">Status</TableHead>
                  <TableHead numeric className="w-[14%]">
                    Previsto · apontado
                  </TableHead>
                  <TableHead className="w-[12%]">Quem faz</TableHead>
                  <TableHead className="w-[4%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <Fragment key={item}>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell colSpan={7} className="font-medium">
                        {item}
                      </TableCell>
                    </TableRow>
                    {tasks
                      .filter((row) => row.itemName === item)
                      .map((row) => {
                        const badge = taskStatusBadge(row)
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="font-mono text-sm text-gray-700">
                              {row.code}
                            </TableCell>
                            <TableCell className={row.baseTaskId ? 'pl-8' : ''}>
                              <div className="flex items-center gap-2">
                                <SectorIcon name={row.sector} size="sm" />
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {row.stageName}
                                  </p>
                                  <p className="text-xs text-gray">
                                    {row.measureText}
                                    {row.fields.length
                                      ? ` · ${row.fields.join(' · ')}`
                                      : ''}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-800">
                                {row.taskType.name}
                              </p>
                              <p className="text-xs text-gray">
                                {row.stepIndex + 1}º {row.step.name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={badge.variant} status>
                                  {badge.text}
                                </Badge>
                                {row.alert && (
                                  <Badge variant="errorLight">Alerta</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right text-sm text-gray-700">
                              {duration(row.estimatedMinutes)} ·{' '}
                              {duration(row.actualMinutes)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {row.completedBy
                                ? `${row.completedBy} (concluiu)`
                                : row.workers.length
                                  ? row.workers.map((w) => w.name).join(', ')
                                  : row.assignee?.name || '-'}
                            </TableCell>
                            <TableCell>
                              <ActionButton
                                Icon={IconSearch}
                                tooltip={`Abrir ${row.stageName}`}
                                onClick={() => setTaskId(row.id)}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={configRes?.data?.collaborators || []}
        vehicles={configRes?.data?.vehicles || []}
        viewerCollaboratorId={viewerRes?.data?.collaboratorId ?? null}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />

      <Dialog open={deliveryOpen} onOpenChange={setDeliveryOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconCalendar} />
              <div>
                <DialogTitle>Alterar entrega</DialogTitle>
                <DialogDescription>
                  O primeiro prazo prometido continua registrado. A cadeia de
                  produção é conferida de novo contra a data nova.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody className="space-y-2">
            <Label htmlFor="project-due">Novo prazo</Label>
            <Input
              id="project-due"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setDeliveryOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!due}
              onClick={async () => {
                const res = await changeDelivery({ id, due })
                if (!res.success) return toast.error(res.message)
                toast.success(res.data || 'Entrega alterada')
                setDeliveryOpen(false)
                await refresh()
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
