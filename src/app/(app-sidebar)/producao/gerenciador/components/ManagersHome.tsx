'use client'

// A entrada do gerenciador de produção (GP-45, 29/10/2026): um cartão por
// setor, como o legado abre, com a contagem de tarefas abertas e os alertas;
// cada cartão leva à tela do setor. Abaixo, as visões gerais, de todos os
// setores: a Agenda viva e os Veículos.

// React / Next
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { TaskCard } from './TaskCard'
import { TaskDetailDialog } from './TaskDetailDialog'
import { AgendaView, VehiclesView, ProductionFilters } from './GeneralViews'
import {
  agendaRange,
  taskMatches,
  AgendaSkeleton,
  useProductionRefresh,
  type Period,
} from './shared'

// Actions
import {
  getAgenda,
  getViewer,
  getManagerSummary,
} from '@/actions/production-manager'

// Hooks / Consts
import { usePermissions } from '@/hooks/usePermissions'
import { updateFilterParam } from '@/lib/filter-utils'
import { timeModeObj, PRODUCTION_MANAGE } from '@/consts/productionManager'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconAlertTriangle, IconChevronRight } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

type View = 'agenda' | 'veiculos'

export function ManagersHome() {
  const router = useRouter()
  const params = useSearchParams()
  const { hasPermission } = usePermissions()
  const refresh = useProductionRefresh()

  const [taskId, setTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState<Period>('todas')
  const view = (params.get('visao') as View) || 'agenda'
  const isManager = hasPermission(PRODUCTION_MANAGE[0])

  const { data: viewerRes } = useQuery({
    queryKey: ['production-viewer'],
    queryFn: () => getViewer(),
    staleTime: 60_000,
  })
  const viewer = viewerRes?.data || {
    collaboratorId: null,
    name: null,
    manager: isManager,
  }

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['production-summary'],
    queryFn: () => getManagerSummary(),
  })
  const summary = summaryRes?.data || []

  const { data: agendaRes, isLoading: loadingAgenda } = useQuery({
    queryKey: ['production-agenda', period],
    queryFn: () => getAgenda(agendaRange(period)),
  })
  const agenda = agendaRes?.data

  const filter = { search, person: 'todos', period }
  const allTasks = [
    ...(agenda?.scheduled || []),
    ...(agenda?.unscheduled || []),
  ]
  const task = allTasks.find((item) => item.id === taskId) || null
  const card = (item: (typeof allTasks)[number]) => (
    <TaskCard item={item} showSector onOpen={setTaskId} />
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Gerenciador de produção"
          supportText={
            viewer.manager
              ? 'Cada setor tem a sua tela. Abaixo, a agenda e os veículos de todos.'
              : viewer.name
                ? `Olá, ${viewer.name}: os setores em que você trabalha`
                : 'Seu usuário não está ligado a um colaborador da produção'
          }
        />

        {/* Um cartão por setor, com o que está aberto nele */}
        {loadingSummary ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-[108px] rounded-xl" />
            ))}
          </div>
        ) : summary.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summary.map((manager) => (
              <Link
                key={manager.id}
                href={`/producao/gerenciador/${manager.id}`}
                className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <SectorIcon name={manager.sector} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-gray-900">
                    {manager.name}
                  </p>
                  <p className="truncate text-sm text-gray">
                    {manager.sector} ·{' '}
                    {timeModeObj[manager.timeMode]?.text ?? manager.timeMode}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={manager.open ? 'blueLight' : 'neutralLight'}
                    >
                      {manager.open === 1
                        ? '1 tarefa aberta'
                        : `${manager.open} tarefas abertas`}
                    </Badge>
                    {manager.alerts > 0 && (
                      <Badge variant="errorLight">
                        <Icon
                          icon={IconAlertTriangle}
                          size="sm"
                          className="mr-1"
                        />
                        {manager.alerts === 1
                          ? '1 com alerta'
                          : `${manager.alerts} com alerta`}
                      </Badge>
                    )}
                  </div>
                </div>
                <Icon
                  icon={IconChevronRight}
                  size="md"
                  className="shrink-0 text-gray transition group-hover:text-brand-600"
                />
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-gray">
              Nenhum gerenciador configurado. Crie um por setor em Configurações
              › Produção.
            </CardContent>
          </Card>
        )}

        {/* As visões de todos os setores */}
        <Tabs
          value={view}
          variant="pill"
          onValueChange={(value) =>
            updateFilterParam('visao', value, { router, params })
          }
        >
          <TabsList>
            <TabsTrigger value="agenda">Agenda viva</TabsTrigger>
            <TabsTrigger value="veiculos">Veículos</TabsTrigger>
          </TabsList>
        </Tabs>

        <ProductionFilters
          search={search}
          onSearch={setSearch}
          period={period}
          onPeriod={setPeriod}
        />

        {loadingAgenda || !agenda ? (
          <AgendaSkeleton />
        ) : view === 'agenda' ? (
          <AgendaView
            scheduled={agenda.scheduled.filter((item) =>
              taskMatches(item, filter),
            )}
            unscheduled={agenda.unscheduled.filter((item) =>
              taskMatches(item, filter),
            )}
            card={card}
          />
        ) : (
          <VehiclesView
            vehicles={agenda.vehicles}
            scheduled={agenda.scheduled.filter((item) =>
              taskMatches(item, filter),
            )}
            onOpen={setTaskId}
          />
        )}
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={[]}
        vehicles={agenda?.vehicles || []}
        viewerCollaboratorId={viewer.collaboratorId}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}
