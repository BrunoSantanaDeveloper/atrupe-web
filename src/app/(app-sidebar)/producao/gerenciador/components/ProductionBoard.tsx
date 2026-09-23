'use client'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SectorFilter } from './SectorFilter'
import { CapacityCards } from './CapacityCards'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { StageStatus } from '../types'

// Actions
import {
  moveStage,
  releaseStageEarly,
  getProductionStages,
  getSectorCapacities,
} from '@/actions/production'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'
import { stageColumns, stageStatusObj } from '@/consts/production'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react'

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)

  return hours
    ? `${hours}h${minutes % 60 ? ` ${minutes % 60}min` : ''}`
    : `${minutes} min`
}

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })

const nextStatus: { [key in StageStatus]?: StageStatus } = {
  READY: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
}

export function ProductionBoard({ searchParams }: SearchParamsType) {
  const queryClient = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: capacities } = useQuery({
    staleTime: Infinity,
    queryKey: ['sector-capacities'],
    queryFn: () => getSectorCapacities(),
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['production-stages', searchParams],
    queryFn: () => getProductionStages({ filters: searchParams }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['production-stages'] })
    queryClient.invalidateQueries({ queryKey: ['sector-capacities'] })
    queryClient.invalidateQueries({ queryKey: ['productivity'] })
  }

  const { mutate: move } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StageStatus }) =>
      moveStage({ id, status }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Etapa atualizada')
      invalidate()
    },
    onError: () => toast.error('Erro ao atualizar a etapa'),
  })

  const { mutate: release } = useMutation({
    mutationFn: (id: string) => releaseStageEarly({ id }),
    onSuccess: () => {
      toast.success('Próxima etapa liberada')
      invalidate()
    },
    onError: () => toast.error('Erro ao liberar a etapa'),
  })

  const stages = data?.data || []
  const late = stages.filter(
    (stage) => stage.status !== 'DONE' && stage.dueDate < today,
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Gerenciador de produção"
          supportText="Etapas por setor, com tempo previsto e dependências"
        />

        {late.length > 0 && (
          <Card className="p-4 flex items-center gap-3 border-error-200 bg-error-25">
            <IconAlertTriangle className="size-5 text-error-600 shrink-0" />
            <p className="text-sm text-gray-900">
              <span className="font-medium">
                {late.length}{' '}
                {late.length === 1
                  ? 'etapa passou da data'
                  : 'etapas passaram da data'}
                .
              </span>{' '}
              As etapas seguintes precisam ser reagendadas, e a entrega pode
              atrasar.
            </p>
          </Card>
        )}

        <CapacityCards capacities={capacities?.data || []} />

        <SectorFilter searchParams={searchParams} />

        {isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stageColumns.map((column) => {
              const columnStages = stages.filter(
                (stage) => stage.status === column.status,
              )

              return (
                <div key={column.status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold">{column.label}</h2>
                    <Badge variant="neutralLight">{columnStages.length}</Badge>
                  </div>

                  {columnStages.length ? (
                    columnStages.map((stage) => {
                      const isLate =
                        stage.status !== 'DONE' && stage.dueDate < today
                      const forward = nextStatus[stage.status]

                      return (
                        <Card key={stage.id} className="p-4 space-y-3">
                          <div>
                            <p className="text-sm font-medium">
                              {stage.stageName}
                            </p>
                            <p className="text-sm text-gray">
                              {stage.orderNumber} · {stage.client}
                            </p>
                            <p className="text-sm text-gray">{stage.product}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="neutralLight">{stage.sector}</Badge>
                            <Badge
                              variant={
                                isLate
                                  ? 'errorLight'
                                  : stageStatusObj[stage.status].variant
                              }
                            >
                              {isLate
                                ? `Atrasada · ${formatDate(stage.dueDate)}`
                                : `Entrega ${formatDate(stage.dueDate)}`}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray">Previsto</span>
                            <span>{formatMinutes(stage.plannedMinutes)}</span>
                          </div>
                          {stage.actualMinutes !== null && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray">Realizado</span>
                              <span
                                className={cn(
                                  stage.actualMinutes > stage.plannedMinutes &&
                                    'text-error-700 font-medium',
                                )}
                              >
                                {formatMinutes(stage.actualMinutes)}
                              </span>
                            </div>
                          )}
                          {stage.assignee && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray">Responsável</span>
                              <span>{stage.assignee}</span>
                            </div>
                          )}

                          {stage.status === 'BLOCKED' && (
                            <p className="text-sm text-gray">
                              Aguardando a etapa anterior. Libere a etapa
                              anterior para começar antes.
                            </p>
                          )}

                          <PermissionGate
                            permissions={['production:production:edit']}
                          >
                            <div className="flex flex-wrap gap-2">
                              {forward && (
                                <Button
                                  size="sm"
                                  RightIcon={IconArrowRight}
                                  onClick={() =>
                                    move({ id: stage.id, status: forward })
                                  }
                                >
                                  {forward === 'IN_PROGRESS'
                                    ? 'Iniciar'
                                    : 'Concluir'}
                                </Button>
                              )}
                              {stage.status === 'IN_PROGRESS' &&
                                !stage.releasedEarly && (
                                  <Button
                                    size="sm"
                                    variant="neutralOutline"
                                    onClick={() => release(stage.id)}
                                  >
                                    Liberar próxima
                                  </Button>
                                )}
                            </div>
                          </PermissionGate>
                        </Card>
                      )
                    })
                  ) : (
                    <Card>
                      <CardContent className="py-6">
                        <p className="text-sm text-gray text-center">
                          Nenhuma etapa
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
