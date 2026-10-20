'use client'

// Acompanhamento dos projetos (GP-8, GP-18, PCP-4): cada venda aprovada vira
// um projeto, com as tarefas geradas da composição (a API cria na
// aprovação). Situação na URL (?status=), abas segmentadas no Topbar com a
// contagem do servidor, busca pelo número ou cliente e paginação no
// servidor; card com ícone de destaque (design.md §18.4).

// React / Next
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

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
import { Input } from '@/components/ui/input'
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
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { ProjectStatus } from '../../gerenciador/manager'

// Actions
import { getProjects, getProjectQuantity } from '@/actions/production-manager'

// Hooks / Store / Consts
import { projectStatusObj } from '@/consts/productionManager'
import { updateFilterParam } from '@/lib/filter-utils'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import {
  IconSearch,
  IconListCheck,
  IconClipboardList,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

const tabs: { value: ProjectStatus; label: string }[] = [
  { value: 'PRODUCTION', label: 'Em produção' },
  { value: 'STANDBY', label: 'Stand-by' },
  { value: 'DONE', label: 'Concluídos' },
  { value: 'CANCELED', label: 'Cancelados' },
]

export function Projects() {
  const router = useRouter()
  const params = useSearchParams()
  const status = (params.get('status') as ProjectStatus) || 'PRODUCTION'
  const page = Number(params.get('page')) || 1
  const search = params.get('busca') || ''
  const [text, setText] = useState(search)

  // A busca vai para a URL depois de uma pausa na digitação
  useEffect(() => {
    if (text === search) return
    const timer = setTimeout(
      () => updateFilterParam('busca', text.trim(), { router, params }),
      400,
    )
    return () => clearTimeout(timer)
  }, [text, search, router, params])

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['production-projects', status, page, search],
    queryFn: () => getProjects({ status, page, search }),
    // Aba, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
  })
  const { data: quantityRes, isLoading: quantityLoading } = useQuery({
    queryKey: ['production-projects', 'quantity'],
    queryFn: () => getProjectQuantity(),
  })
  const projects = data?.data?.data || []
  const quantity = quantityRes?.data

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Projetos"
          supportText="As vendas em produção, com as tarefas de cada item"
          paramName="status"
          activeTab={status}
          tabs={tabs.map((tab) => ({
            value: tab.value,
            tab: tab.value,
            label: tab.label,
            count: quantity?.[tab.value] ?? 0,
          }))}
          countsLoading={quantityLoading}
        />

        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-4 space-y-0">
            <div className="flex items-center gap-3">
              <FeaturedIcon tone="neutral" Icon={IconClipboardList} />
              <div>
                <CardTitle>Projetos</CardTitle>
                <CardDescription>
                  O projeto nasce quando a venda é aprovada: uma tarefa para
                  cada etapa da composição dos itens.
                </CardDescription>
              </div>
            </div>
            <Input
              aria-label="Buscar projeto"
              placeholder="Número da venda ou cliente"
              className="w-full sm:w-[260px]"
              startAdornment={
                <Icon icon={IconSearch} size="sm" className="text-gray" />
              }
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </CardHeader>
          <FetchingRegion isFetching={isPlaceholderData}>
            {/* Carregando, a tabela real fica com linhas de esqueleto */}
            {!isLoading && !projects.length ? (
              <ListDataTotalEmpty
                icon={IconListCheck}
                title={
                  search
                    ? `Nenhum projeto encontrado para "${search}"`
                    : `Nenhum projeto para o status: ${tabs.find((tab) => tab.value === status)?.label}`
                }
                description="O projeto nasce quando a venda é aprovada."
              />
            ) : (
              <CardContent>
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[12%]">Venda</TableHead>
                      <TableHead className="w-[26%]">Cliente</TableHead>
                      <TableHead className="w-[14%]">Aprovação</TableHead>
                      <TableHead className="w-[18%]">Entrega</TableHead>
                      <TableHead className="w-[24%]">Tarefas</TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeletonRows cols={6} rows={4} />
                    ) : (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.number}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-800">
                              {project.client}
                            </p>
                            <p className="text-xs text-gray">
                              {project.deliveryType}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {date(project.approvedAt)}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-gray-800">
                              {date(project.due)}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {project.late && (
                                <Badge variant="errorLight">Em atraso</Badge>
                              )}
                              {!project.late && project.risk && (
                                <Badge variant="warningLight">
                                  Entrega em risco
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full bg-success-500"
                                  style={{
                                    width: `${project.total ? (project.done / project.total) * 100 : 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-700">
                                {project.done} / {project.total}
                              </span>
                              {project.alerts > 0 && (
                                <span className="flex items-center gap-1 text-xs text-error-700">
                                  <Icon icon={IconAlertTriangle} size="sm" />
                                  {project.alerts}
                                </span>
                              )}
                            </div>
                            <Badge
                              variant={projectStatusObj[project.status].variant}
                              className="mt-1"
                            >
                              {projectStatusObj[project.status].text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <ActionButton
                                gesto="ver"
                                tooltip={`Abrir ${project.number}`}
                                link={`/producao/projetos/${project.id}`}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {(data?.data?.lastPage ?? 1) > 1 && (
                  <TablePagination
                    searchParams={Object.fromEntries(params.entries())}
                    lastPage={data?.data?.lastPage}
                  />
                )}
              </CardContent>
            )}
          </FetchingRegion>
        </Card>
      </div>
    </TooltipProvider>
  )
}
