'use client'

// A entrada do gerenciador de produção (GP-45, 29/10/2026): um cartão por
// setor, como o legado abre, com a contagem de tarefas abertas e os alertas;
// cada cartão leva à tela do setor. Abaixo, as visões gerais, de todos os
// setores: a Agenda viva e os Veículos, que pedem o tempo (production_manager,
// ELITE); o PRO, com a tela por setor (sector_board), vê só os cartões.

// React / Next
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { TaskDetailDialog } from './TaskDetailDialog'
import { AgendaView, VehiclesView, ProductionFilters } from './GeneralViews'
import { PersonAgenda } from './PersonAgenda'
import { OccupancyMap } from './OccupancyMap'
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
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { updateFilterParam } from '@/lib/filter-utils'
import { FEATURES } from '@/consts/features'
import { timeModeObj, PRODUCTION_MANAGE } from '@/consts/productionManager'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Utils
import { cn } from '@/lib/utils'

// Icons
import {
  IconListCheck,
  IconAlertTriangle,
  IconChevronRight,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

type View = 'agenda' | 'veiculos' | 'pessoas' | 'ocupacao'

export function ManagersHome() {
  const router = useRouter()
  const params = useSearchParams()
  const { hasPermission } = usePermissions()
  const { hasFeature } = usePlanFeatures()
  const refresh = useProductionRefresh()
  const withTime = hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)

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
    // A agenda do colaborador mostra sempre os próximos 7 dias
    queryKey: ['production-agenda', view === 'pessoas' ? 'semana' : period],
    queryFn: () =>
      getAgenda(agendaRange(view === 'pessoas' ? 'semana' : period)),
    enabled: withTime,
  })
  const agenda = agendaRes?.data

  const filter = { search, person: 'todos', period }
  const allTasks = [
    ...(agenda?.scheduled || []),
    ...(agenda?.unscheduled || []),
  ]
  const task = allTasks.find((item) => item.id === taskId) || null

  const viewTabs = (
    <Tabs
      value={view}
      variant="pill"
      onValueChange={(value) =>
        updateFilterParam('visao', value, { router, params })
      }
    >
      <TabsList>
        <TabsTrigger value="agenda">Agenda</TabsTrigger>
        <TabsTrigger value="veiculos">Veículos</TabsTrigger>
        <TabsTrigger value="pessoas">Agenda do colaborador</TabsTrigger>
        {/* Para quando dá para agendar (GP-50) */}
        <TabsTrigger value="ocupacao">Ocupação</TabsTrigger>
      </TabsList>
    </Tabs>
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Gerenciador de produção"
          supportText={
            viewer.manager
              ? withTime
                ? 'Cada setor tem a sua tela. Abaixo, a agenda e os veículos de todos.'
                : 'Cada setor tem a sua tela: a fila do que é dele, na ordem da entrega.'
              : viewer.name
                ? `Olá, ${viewer.name}: os setores em que você trabalha`
                : 'Seu usuário não está ligado a um colaborador da produção'
          }
        />

        {/* Um cartão por setor, com o que está aberto nele */}
        {loadingSummary ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-[48px] rounded-xl" />
            ))}
          </div>
        ) : summary.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summary.map((manager) => (
              // Uma linha só (24/11/2026): as tarefas abertas e os alertas
              // viram ícones com o número, e o cartão fica com metade da altura
              <Link
                key={manager.id}
                href={`/producao/gerenciador/${manager.id}`}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:border-brand-300 hover:shadow-sm"
              >
                <SectorIcon name={manager.sector} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {manager.name}
                  </p>
                  {withTime && (
                    <p className="truncate text-xs text-gray">
                      {timeModeObj[manager.timeMode]?.text ?? manager.timeMode}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1 text-sm font-medium',
                    manager.open ? 'text-blue-700' : 'text-gray',
                  )}
                  title={
                    manager.open === 1
                      ? '1 tarefa aberta'
                      : `${manager.open} tarefas abertas`
                  }
                >
                  <Icon icon={IconListCheck} size="sm" />
                  {manager.open}
                </span>
                {manager.alerts > 0 && (
                  <span
                    className="flex shrink-0 items-center gap-1 text-sm font-medium text-error-700"
                    title={
                      manager.alerts === 1
                        ? '1 com alerta'
                        : `${manager.alerts} com alerta`
                    }
                  >
                    <Icon icon={IconAlertTriangle} size="sm" />
                    {manager.alerts}
                  </span>
                )}
                <Icon
                  icon={IconChevronRight}
                  size="sm"
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

        {/* As visões de todos os setores, com o tempo (ELITE) */}
        {withTime && (
          <>
            {/* As abas e os filtros numa linha só (24/11/2026: mais espaço
                para a agenda) */}
            {view !== 'pessoas' && view !== 'ocupacao' ? (
              <ProductionFilters
                search={search}
                onSearch={setSearch}
                period={period}
                onPeriod={setPeriod}
                before={viewTabs}
              />
            ) : (
              viewTabs
            )}

            {view === 'ocupacao' ? (
              <OccupancyMap />
            ) : loadingAgenda || !agenda ? (
              <AgendaSkeleton />
            ) : view === 'pessoas' ? (
              <PersonAgenda
                scheduled={agenda.scheduled}
                me={viewer.collaboratorId}
                onOpen={setTaskId}
              />
            ) : view === 'agenda' ? (
              <AgendaView
                scheduled={agenda.scheduled.filter((item) =>
                  taskMatches(item, filter),
                )}
                unscheduled={agenda.unscheduled.filter((item) =>
                  taskMatches(item, filter),
                )}
                onOpen={setTaskId}
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
          </>
        )}
      </div>

      <TaskDetailDialog
        task={task}
        collaborators={[]}
        vehicles={agenda?.vehicles || []}
        viewerCollaboratorId={viewer.collaboratorId}
        timeless={!withTime}
        onOpenChange={() => setTaskId(null)}
        onChanged={refresh}
      />
    </TooltipProvider>
  )
}
