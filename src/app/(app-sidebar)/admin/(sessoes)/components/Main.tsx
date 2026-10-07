'use client'

import { useState } from 'react'

// Components
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
import { Topbar } from '@/components/common/Topbar'
import { Avatar } from '@/components/AvatarComponent'
import { SessionDetailsDialog } from './SessionDetailsDialog'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataStatusEmpty } from '@/components/common/TableEmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Hooks
import { useActiveSessions } from '@/hooks/queries/useActiveSessions'

// Icons
import {
  IconEye,
  IconClock,
  IconRefresh,
  IconCircleCheck,
  IconBuildingCommunity,
} from '@tabler/icons-react'

// Utils
import { TooltipProvider } from '@/components/ui/tooltip'
import type { SessionUser } from '@/types/admin/sessions'
import { formatToLocaleDateTime } from '@/lib/formatDate'

export function Main() {
  const [selectedUser, setSelectedUser] = useState<SessionUser | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { sessions, isLoading, isRefetching, refetch } = useActiveSessions()

  const handleViewDetails = (user: SessionUser) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const getTimeAgo = (dateString: string): string => {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'agora mesmo'
    if (diffMins === 1) return 'há 1 minuto'
    if (diffMins < 60) return `há ${diffMins} minutos`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return 'há 1 hora'
    if (diffHours < 24) return `há ${diffHours} horas`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'há 1 dia'
    return `há ${diffDays} dias`
  }

  const totalSessions = sessions.reduce(
    (acc, user) => acc + user.sessions.length,
    0,
  )

  return (
    <div className="space-y-6">
      <Topbar
        title="Dashboard"
        primaryCta={
          <Button
            size="iconMd"
            variant="neutralOutline"
            onClick={() => refetch()}
            RightIcon={IconRefresh}
            isLoading={isRefetching}
          />
        }
        badge={{
          variant: sessions.length > 0 ? 'successLight' : 'neutralLight',
          text: `${sessions.length} ${sessions.length === 1 ? 'Usuário' : 'Usuários'} Online`,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Usuários Online</CardTitle>
            <IconCircleCheck className="text-green-400" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="type-kpi-value">{sessions.length}</div>
            <p className="text-xs text-gray">Ativos nos últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Empresas Online</CardTitle>
            <IconBuildingCommunity className="text-purple-400" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="type-kpi-value">
              {new Set(sessions.map((s) => s.companyId)).size}
            </div>
            <p className="text-xs text-gray">Empresas com usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total de Sessões Ativas</CardTitle>
            <IconClock className="text-blue-400" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="type-kpi-value">{totalSessions}</div>
            <p className="text-xs text-gray">Sessões ativas no momento</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários Online</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton cols={5} rows={5} />
          ) : sessions.length === 0 ? (
            <ListDataStatusEmpty title="Nenhum usuário online" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Endpoint Atual</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((user) => {
                  const primarySession = user.sessions[0]
                  return (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            url={user.avatar || ''}
                            name={user.userName}
                            size="sm"
                            variant="default"
                          />
                          <div>
                            <p className="font-medium text-gray-700">
                              {user.userName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700">
                          {user.companyName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="blueLight">
                          {user.sessions.length}{' '}
                          {user.sessions.length === 1 ? 'sessão' : 'sessões'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {primarySession?.endpoint ? (
                          <Badge variant="neutralLight">
                            {primarySession.endpoint}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-600">
                          {primarySession?.ipAddress || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm text-gray-700">
                            {getTimeAgo(user.lastActive)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatToLocaleDateTime(user.lastActive)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <ActionButton
                            Icon={IconEye}
                            tooltip="Ver detalhes"
                            onClick={() => handleViewDetails(user)}
                          />
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SessionDetailsDialog
        user={selectedUser}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  )
}
