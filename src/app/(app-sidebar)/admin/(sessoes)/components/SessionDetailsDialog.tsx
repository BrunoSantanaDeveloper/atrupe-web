'use client'

import { useState } from 'react'

// Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataStatusEmpty } from '@/components/common/TableEmptyState'
import { Avatar } from '@/components/AvatarComponent'

// Hooks
import { useQuery } from '@tanstack/react-query'
import { getData } from '@/actions/_cruds'

// Icons
import {
  IconMapPin,
  IconClock,
  IconWorld,
  IconDeviceLaptop,
} from '@tabler/icons-react'

// Utils
import { formatToLocaleDateTime } from '@/lib/formatDate'
import type { SessionUser, UserHistoryResponse } from '@/types/admin/sessions'

interface SessionDetailsDialogProps {
  user: SessionUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionDetailsDialog({
  user,
  open,
  onOpenChange,
}: SessionDetailsDialogProps) {
  const [historyPage, setHistoryPage] = useState(0)
  const limit = 10

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['user-history', user?.userId, historyPage],
    queryFn: async () => {
      if (!user?.userId) return null
      const offset = historyPage * limit
      const response = await getData({
        route: `/activity-monitor/history/${user.userId}`,
        filters: { limit: String(limit), offset: String(offset) },
      })
      if (!response.success) throw new Error(response.message)
      return response.data as UserHistoryResponse
    },
    enabled: open && !!user?.userId,
  })

  if (!user) return null

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

  const totalPages = historyData ? Math.ceil(historyData.total / limit) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Sessão</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre as sessões ativas do usuário
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar
                    url={user.avatar || ''}
                    name={user.userName}
                    size="lg"
                    variant="default"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-semibold text-lg text-gray-900">
                        {user.userName}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <IconWorld className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {user.companyName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {getTimeAgo(user.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Tabs */}
            <Tabs defaultValue="sessions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">
                  Sessões Ativas ({user.sessions.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  Histórico ({historyData?.total || 0})
                </TabsTrigger>
              </TabsList>

              {/* Active Sessions Tab */}
              <TabsContent value="sessions" className="space-y-4">
                <div className="rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Session ID</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.sessions.map((session) => (
                        <TableRow key={session.sessionId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconDeviceLaptop className="h-4 w-4 text-gray-500" />
                              <span className="font-mono text-xs text-gray-600">
                                {session.sessionId.substring(0, 8)}...
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="blueLight">
                              {session.endpoint}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconMapPin className="h-4 w-4 text-gray-500" />
                              <span className="font-mono text-xs">
                                {session.ipAddress}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-gray-900">
                                {getTimeAgo(session.lastActive)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatToLocaleDateTime(session.lastActive)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                {isLoadingHistory ? (
                  <TableSkeleton cols={5} rows={5} />
                ) : !historyData?.data || historyData.data.length === 0 ? (
                  <ListDataStatusEmpty title="Nenhum histórico encontrado" />
                ) : (
                  <>
                    <div className="rounded-lg border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Endpoint</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data/Hora</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyData.data.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>
                                <Badge variant="neutralLight">
                                  {activity.endpoint}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    activity.method === 'GET'
                                      ? 'blueLight'
                                      : activity.method === 'POST'
                                        ? 'successLight'
                                        : activity.method === 'DELETE'
                                          ? 'errorLight'
                                          : 'warningLight'
                                  }
                                >
                                  {activity.method}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {activity.ipAddress}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    activity.isActive
                                      ? 'successLight'
                                      : 'neutralLight'
                                  }
                                  status
                                >
                                  {activity.isActive ? 'Ativa' : 'Encerrada'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm text-gray-900">
                                    {getTimeAgo(activity.lastActive)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatToLocaleDateTime(
                                      activity.lastActive,
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Página {historyPage + 1} de {totalPages} (
                          {historyData.total} registros)
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setHistoryPage((p) => Math.max(0, p - 1))
                            }
                            disabled={historyPage === 0}
                          >
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setHistoryPage((p) =>
                                Math.min(totalPages - 1, p + 1),
                              )
                            }
                            disabled={historyPage === totalPages - 1}
                          >
                            Próxima
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
