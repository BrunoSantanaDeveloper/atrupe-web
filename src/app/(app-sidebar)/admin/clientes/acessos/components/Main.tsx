'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input-uncontrolled'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePaginationControlled } from '@/components/common/TablePaginationControlled'
import { ListDataStatusEmpty } from '@/components/common/TableEmptyState'
import { ActionButton } from '@/components/common/ActionButton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Avatar } from '@/components/AvatarComponent'
import {
  useAccessSessions,
  useAccessSummary,
} from '@/hooks/queries/useActiveSessions'
import { formatToLocaleDateTime } from '@/lib/formatDate'
import type { SearchParamsType } from '@/types/coreTypes'
import type { AccessSession } from '@/types/admin/sessions'
import {
  IconActivity,
  IconBuildingCommunity,
  IconClock,
  IconEye,
  IconRefresh,
  IconUsers,
} from '@tabler/icons-react'
import { AccessDetailsDialog } from './AccessDetailsDialog'

const methodOptions = [
  { value: 'default', label: 'Todos' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
]

const statusOptions = [
  { value: 'default', label: 'Todos' },
  { value: 'active', label: 'Ativas' },
  { value: 'inactive', label: 'Encerradas' },
]

export function Main({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const [selectedSession, setSelectedSession] = useState<AccessSession | null>(
    null,
  )
  const [detailsOpen, setDetailsOpen] = useState(false)

  const page = Number(searchParams.page || 1)
  const { accessSessions, total, lastPage, isLoading, isRefetching, refetch } =
    useAccessSessions({
      page,
      limit: 10,
      search: searchParams.search,
      method: searchParams.method,
      status: searchParams.status,
      companyId: searchParams.companyId,
      userId: searchParams.userId,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    })
  const { summary } = useAccessSummary(30, searchParams.companyId)

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    router.push(`?${params.toString()}`)
  }

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (!value || value === 'default') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleViewDetails = (session: AccessSession) => {
    setSelectedSession(session)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Acessos"
        supportText="Histórico de empresas e usuários"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
        primaryCta={
          <Button
            size="iconMd"
            variant="neutralLight"
            onClick={() => refetch()}
            RightIcon={IconRefresh}
            isLoading={isRefetching}
          />
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Sessões"
          value={summary?.totalSessions || 0}
          icon={<IconClock className="text-blue-500" />}
        />
        <SummaryCard
          title="Ativas"
          value={summary?.activeSessions || 0}
          icon={<IconActivity className="text-green-500" />}
        />
        <SummaryCard
          title="Usuários"
          value={summary?.uniqueUsers || 0}
          icon={<IconUsers className="text-violet-500" />}
        />
        <SummaryCard
          title="Empresas"
          value={summary?.uniqueCompanies || 0}
          icon={<IconBuildingCommunity className="text-orange-500" />}
        />
      </div>

      <Card>
        <TableFiltersHeader searchParams={searchParams}>
          <SelectBasic
            name="status"
            label="Status"
            value={searchParams.status || 'default'}
            onChange={(value) => handleFilter('status', value)}
            options={statusOptions}
            className="w-[180px]"
          />
          <SelectBasic
            name="method"
            label="Método"
            value={searchParams.method || 'default'}
            onChange={(value) => handleFilter('method', value)}
            options={methodOptions}
            className="w-[160px]"
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Inicio</label>
            <Input
              type="date"
              value={searchParams.startDate || ''}
              onChange={(event) =>
                handleFilter('startDate', event.target.value)
              }
              className="w-[170px]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Fim</label>
            <Input
              type="date"
              value={searchParams.endDate || ''}
              onChange={(event) => handleFilter('endDate', event.target.value)}
              className="w-[170px]"
            />
          </div>
        </TableFiltersHeader>

        <CardContent>
          {isLoading ? (
            <TableSkeleton cols={8} rows={8} />
          ) : accessSessions.length === 0 ? (
            <ListDataStatusEmpty title="Nenhum acesso encontrado" />
          ) : (
            <>
              <div className="rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Usuário</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Eventos</TableHead>
                      <TableHead>Última atividade</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              url={session.avatar || ''}
                              name={session.userName}
                              size="sm"
                              variant="default"
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                {session.userName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {session.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{session.companyName || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            status
                            variant={
                              session.isActive ? 'successLight' : 'neutralLight'
                            }
                          >
                            {session.isActive ? 'Ativa' : 'Encerrada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="blueLight">
                            {session.method || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-80 break-all">
                          {session.endpoint || '-'}
                        </TableCell>
                        <TableCell>{session.eventsCount}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-gray-800">
                              {formatToLocaleDateTime(session.lastActive)}
                            </span>
                            <span className="font-mono text-xs text-gray-500">
                              {session.ipAddress || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <ActionButton
                              Icon={IconEye}
                              tooltip="Ver detalhes"
                              onClick={() => handleViewDetails(session)}
                            />
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <p className="px-5 pt-5 text-sm text-gray-600">
                  {total} registros
                </p>
              </div>
              <TablePaginationControlled
                page={page}
                lastPage={lastPage}
                setPage={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>

      <AccessDetailsDialog
        session={selectedSession}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: JSX.Element
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  )
}
