'use client'

// A tela do setor no LITE (área 9 §4.16; Maicol, 26/11/2026): a lista de
// trabalhos daquele setor, na ordem da entrega. Concluir aqui conclui o
// ícone do setor na Agenda de entrega, e o contrário também: é o mesmo
// registro (a etapa do item). Quem concluiu fica gravado.

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  IconArrowBackUp,
  IconChevronRight,
  IconCircleCheck,
  IconRoute,
} from '@tabler/icons-react'

import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { updateItemNew } from '@/actions/_cruds'
import { FEATURES } from '@/consts/features'
import { useSector } from '@/hooks/queries/useSector'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { useAlertDialog } from '@/store/useAlertDialog'
import { cn } from '@/lib/utils'
import { StagePendingDialog } from '../../agenda-de-entrega/components/DeliveryScheduleTable/Stages/StagePendingDialog'
import { WORK_QUERY, fetchWork, type WorkItem } from '../work'

type View = 'open' | 'done'

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  })

const isLate = (iso: string) => {
  const day = new Date(iso)
  const today = new Date()
  day.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return day < today
}

export function SectorWork({ sectorId }: { sectorId: string }) {
  const [view, setView] = useState<View>('open')
  const [pending, setPending] = useState<WorkItem | null>(null)
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const { notifyActionError } = usePlanErrorToast()
  const { hasPermission } = usePermissions()
  const { hasFeature } = usePlanFeatures()
  const canAct =
    hasPermission('production:delivery_schedule:edit') &&
    hasFeature(FEATURES.PRODUCTS.DELIVERY_STAGE_STATUS_CHANGE)

  const { data: sectors } = useSector({ isProductionStage: true })
  const sector = sectors?.find((item) => item.id === sectorId)

  const { data, isLoading } = useQuery({
    queryKey: [WORK_QUERY, sectorId, view],
    queryFn: () => fetchWork({ stageId: sectorId, view }),
  })
  const items = data?.items ?? []
  const openCount = view === 'open' ? items.length : data?.counts?.[sectorId]

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [WORK_QUERY] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
  }

  const setStatus = async (work: WorkItem, status: string, ok: string) => {
    const res = await updateItemNew({
      route: `/sale/production-stage/item/${work.id}`,
      data: { status },
    })
    if (!res.success) {
      notifyActionError(res, 'Não foi possível alterar o trabalho')
      return
    }
    refresh()
    toast.success(ok)
  }

  const conclude = (work: WorkItem) => {
    if (!work.waitingFor.length) {
      setStatus(work, 'DONE', 'Trabalho concluído')
      return
    }
    // O setor anterior ainda não terminou: avisa, sem travar (no LITE a
    // ordem é a sequência dos ícones, e a edição é livre)
    alertDialog.open({
      title: 'Concluir mesmo assim?',
      description: `Neste item, ainda falta concluir: ${work.waitingFor.join(' e ')}.`,
      confirmLabel: 'Concluir',
      onConfirm: () => setStatus(work, 'DONE', 'Trabalho concluído'),
    })
  }

  return (
    <div className="space-y-5">
      <Topbar
        title={sector?.name ?? 'Setor'}
        previousPage="/producao/setores"
        supportText="Os trabalhos deste setor, na ordem da entrega. Concluir aqui conclui o ícone do setor na Agenda de entrega."
      />

      <Tabs value={view} onValueChange={(value) => setView(value as View)}>
        <TabsList>
          <TabsTrigger value="open">
            A fazer{openCount !== undefined ? ` (${openCount})` : ''}
          </TabsTrigger>
          <TabsTrigger value="done">Concluídos nos últimos 30 dias</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : !items.length ? (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-gray">
              {sector && (
                <SectorIcon
                  name={sector.name}
                  icon={sector.icon}
                  sectorId={sector.id}
                  size="lg"
                />
              )}
              {view === 'open'
                ? 'Nenhum trabalho a fazer neste setor.'
                : 'Nenhum trabalho concluído neste setor nos últimos 30 dias.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Entrega</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell
                      className={cn(
                        'whitespace-nowrap capitalize',
                        view === 'open' &&
                          isLate(work.scheduledDate) &&
                          'font-medium text-error-700',
                      )}
                    >
                      {dayLabel(work.scheduledDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/vendas/orcamentos/${work.quotationId}`}
                        className="font-medium text-gray-900 hover:text-brand-700 hover:underline"
                      >
                        {work.reference || '-'}
                      </Link>
                      <p className="text-xs text-gray">
                        {work.client || work.description || '-'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="min-w-0">
                          <p className="text-gray-900">{work.item || '-'}</p>
                          <p className="text-xs text-gray">{work.measure}</p>
                        </div>
                        {work.flow.length > 1 && <FlowButton work={work} />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <WorkStatus work={work} view={view} />
                    </TableCell>
                    <TableCell className="text-right">
                      {canAct &&
                        (view === 'open' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="neutralOutline"
                              onClick={() => setPending(work)}
                            >
                              Pendência
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              RightIcon={IconCircleCheck}
                              onClick={() => conclude(work)}
                            >
                              Concluir
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="neutralOutline"
                            RightIcon={IconArrowBackUp}
                            onClick={() =>
                              setStatus(
                                work,
                                'NOT_STARTED',
                                'Trabalho voltou para a lista',
                              )
                            }
                          >
                            Reabrir
                          </Button>
                        ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <StagePendingDialog
        searchParams={{}}
        open={!!pending}
        setOpen={(value) => {
          if (!value) {
            setPending(null)
            refresh()
          }
        }}
        rowData={
          pending
            ? {
                id: pending.id,
                stage: {
                  id: pending.sector.id,
                  name: pending.sector.name,
                  icon: pending.sector.icon ?? '',
                },
                status: pending.status,
                prevStatus: '',
                notes: pending.notes ?? '',
              }
            : undefined
        }
        route={
          pending ? `/sale/production-stage/item/${pending.id}` : undefined
        }
      />
    </div>
  )
}

function WorkStatus({ work, view }: { work: WorkItem; view: View }) {
  if (view === 'done') {
    const when = work.doneAt
      ? new Date(work.doneAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : null
    return (
      <div className="flex flex-col items-start gap-0.5">
        <Badge status variant="successLight">
          Concluído
        </Badge>
        {(work.doneByName || when) && (
          <span className="text-xs text-gray">
            {[work.doneByName, when].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
    )
  }
  if (work.status === 'PENDING') {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <Badge status variant="warningLight">
          Pendência
        </Badge>
        {work.notes && (
          <span
            className="max-w-64 truncate text-xs text-gray"
            title={work.notes}
          >
            {work.notes}
          </span>
        )}
      </div>
    )
  }
  if (work.waitingFor.length) {
    return (
      <Badge status variant="neutralLight">
        Depois de {work.waitingFor.join(' e ')}
      </Badge>
    )
  }
  if (work.status === 'IN_PROGRESS') {
    return (
      <Badge status variant="blueLight">
        Em andamento
      </Badge>
    )
  }
  return (
    <Badge status variant="blueGreenLight">
      Pode começar
    </Badge>
  )
}

// O fluxo inteiro do item (área 9 §4.16): a sequência dos setores, para ter
// noção do que falta. Só para ver: na tela do setor se conclui só a etapa
// dele; as outras se concluem na tela de cada setor ou na Agenda de entrega
function FlowButton({ work }: { work: WorkItem }) {
  const stateText = (status: string, current: boolean) =>
    current
      ? 'este setor'
      : status === 'DONE'
        ? 'concluído'
        : status === 'PENDING'
          ? 'com pendência'
          : status === 'CANCELED'
            ? 'cancelado'
            : 'a fazer'
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="iconSm"
          variant="neutralGhost"
          aria-label="Ver o fluxo do item"
          title="Ver o fluxo do item"
        >
          <Icon icon={IconRoute} size="sm" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-[560px] p-4">
        <p className="mb-3 text-xs font-medium text-gray-600">
          O fluxo de {work.item || 'este item'}
        </p>
        <div className="flex flex-wrap items-start gap-1">
          {work.flow.map((step, index) => (
            <div key={step.id} className="flex items-start gap-1">
              {index > 0 && (
                <Icon
                  icon={IconChevronRight}
                  size="sm"
                  className="mt-2 text-gray-400"
                />
              )}
              <div
                className={cn(
                  'flex w-20 flex-col items-center gap-1 rounded-lg p-1 text-center',
                  step.current && 'bg-brand-50 ring-1 ring-brand-300',
                )}
              >
                <SectorIcon
                  name={step.sector.name}
                  icon={step.sector.icon}
                  sectorId={step.sector.id}
                  size="md"
                  state={
                    step.status === 'DONE'
                      ? 'done'
                      : step.current
                        ? 'default'
                        : 'muted'
                  }
                />
                <span className="text-xs font-medium text-gray-900">
                  {step.sector.name}
                </span>
                <span
                  className={cn(
                    'text-xs',
                    step.status === 'DONE'
                      ? 'text-success-700'
                      : step.status === 'PENDING'
                        ? 'text-warning-700'
                        : 'text-gray',
                  )}
                >
                  {stateText(step.status, step.current)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
