'use client'

// Acompanhamento dos projetos (GP-8, GP-18): cada venda aprovada vira um
// projeto em produção, com as tarefas geradas da composição. Situação na
// URL (?status=), como pede o design.md.

// React / Next
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { ProjectStatus } from '../../gerenciador/manager'

// Actions
import { getProjects } from '@/actions/production-manager'

// Hooks / Store / Consts
import { projectStatusObj } from '@/consts/productionManager'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconSearch, IconListCheck } from '@tabler/icons-react'

// Utils

const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

const tabs: { value: ProjectStatus; label: string }[] = [
  { value: 'PRODUCTION', label: 'Em produção' },
  { value: 'STANDBY', label: 'Stand-by' },
  { value: 'DONE', label: 'Concluídos' },
  { value: 'CANCELED', label: 'Cancelados' },
]

export function Projects() {
  const params = useSearchParams()
  const status = (params.get('status') as ProjectStatus) || 'PRODUCTION'

  const { data, isLoading } = useQuery({
    queryKey: ['production-projects'],
    queryFn: () => getProjects(),
  })
  const all = data?.data || []
  const projects = all.filter((item) => item.status === status)

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
            count: all.filter((item) => item.status === tab.value).length,
          }))}
          countsLoading={isLoading}
        />

        <Card>
          {/* Carregando, a tabela real fica com linhas de esqueleto */}
          {!isLoading && !projects.length ? (
            <ListDataTotalEmpty
              icon={IconListCheck}
              title="Nenhum projeto nesta situação"
              description="O projeto nasce quando a venda é aprovada, com uma tarefa para cada etapa da composição dos itens."
            />
          ) : (
            <CardContent>
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[14%]">Venda</TableHead>
                    <TableHead className="w-[28%]">Cliente</TableHead>
                    <TableHead className="w-[16%]">Aprovação</TableHead>
                    <TableHead className="w-[18%]">Entrega</TableHead>
                    <TableHead className="w-[18%]">Tarefas</TableHead>
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
                          {project.late && (
                            <Badge variant="errorLight" className="mt-1">
                              Em atraso
                            </Badge>
                          )}
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
                              Icon={IconSearch}
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
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
