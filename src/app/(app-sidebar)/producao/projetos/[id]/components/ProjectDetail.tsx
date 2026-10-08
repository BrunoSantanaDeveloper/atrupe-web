'use client'

// O projeto por dentro (GP-8, GP-16, GP-18): informações da venda, a
// entrega com o prazo em atraso, e as tarefas agrupadas por item — uma por
// etapa da composição, com código, tipo, etapa atual, situação e tempo.

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
  getManagerConfig,
  setProjectStatus,
} from '@/actions/production-manager'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { projectStatusObj } from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconSearch,
  IconCalendar,
  IconPlayerPlay,
  IconCircleCheck,
  IconBan,
  IconFileText,
  IconChevronRight,
} from '@tabler/icons-react'

const EDIT = ['production:production:view']

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

  const detail = data?.data
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['production-project', id] }),
      queryClient.invalidateQueries({ queryKey: ['production-projects'] }),
      queryClient.invalidateQueries({ queryKey: ['production-config'] }),
    ])

  if (isLoading || !detail) return <Skeleton className="h-[480px] w-full" />

  const { project, tasks, late } = detail
  const items = Array.from(new Set(tasks.map((task) => task.itemName)))
  const task = tasks.find((item) => item.id === taskId) || null

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
            ? 'Só é possível com todas as tarefas concluídas.'
            : 'As tarefas abertas são canceladas.',
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
          primaryCta={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="neutralOutline"
                LeftIcon={IconFileText}
                RightIcon={IconChevronRight}
                asChild
              >
                <Link href={`/producao/projetos/${id}/ficha`}>
                  Ficha de produção
                </Link>
              </Button>
              <PermissionGate permissions={EDIT}>
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6 text-sm">
              <p className="flex justify-between">
                <span className="text-gray">Status</span>
                <Badge variant={projectStatusObj[project.status].variant}>
                  {projectStatusObj[project.status].text}
                </Badge>
              </p>
              <p className="flex justify-between">
                <span className="text-gray">Vendedor</span>
                {project.seller}
              </p>
              <p className="flex justify-between">
                <span className="text-gray">Aprovação</span>
                {date(project.approvedAt)}
              </p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle>Entrega</CardTitle>
                <CardDescription>{project.deliveryType}</CardDescription>
              </div>
              <PermissionGate permissions={EDIT}>
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
                      variant="errorGhost"
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
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>
              Uma para cada etapa da composição dos itens, na medida vendida. O
              acabamento espera a base quando o tipo dele manda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[10%]">Código</TableHead>
                  <TableHead className="w-[24%]">Etapa</TableHead>
                  <TableHead className="w-[22%]">Tipo · etapa atual</TableHead>
                  <TableHead className="w-[16%]">Status</TableHead>
                  <TableHead numeric className="w-[14%]">
                    Estimado · realizado
                  </TableHead>
                  <TableHead className="w-[10%]">Quem faz</TableHead>
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
                              <p className="text-sm font-medium text-gray-800">
                                {row.stageName}
                              </p>
                              <p className="text-xs text-gray">
                                {row.measureText}
                                {row.fields.length
                                  ? ` · ${row.fields.join(' · ')}`
                                  : ''}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="flex items-center gap-2 text-sm text-gray-800">
                                <span
                                  className="size-2.5 rounded-full"
                                  style={{
                                    backgroundColor: row.taskType.color,
                                  }}
                                />
                                {row.taskType.name}
                              </p>
                              <p className="text-xs text-gray">
                                {row.stepIndex + 1}º {row.step.name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={badge.variant}>
                                {badge.text}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right text-sm text-gray-700">
                              {duration(row.estimatedMinutes)} ·{' '}
                              {duration(row.actualMinutes)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-700">
                              {row.assignee?.name || '-'}
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
                  O primeiro prazo prometido continua registrado.
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
              variant="outline"
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
                toast.success('Entrega alterada')
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
