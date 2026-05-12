'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataStatusEmpty } from '@/components/common/TableEmptyState'
import { Avatar } from '@/components/AvatarComponent'
import { useAccessSessionDetails } from '@/hooks/queries/useActiveSessions'
import { formatToLocaleDateTime } from '@/lib/formatDate'
import type { AccessSession } from '@/types/admin/sessions'

interface Props {
  session: AccessSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccessDetailsDialog({ session, open, onOpenChange }: Props) {
  const [page, setPage] = useState(0)
  const limit = 20
  const { details, isLoading } = useAccessSessionDetails(session?.sessionId, {
    limit,
    offset: page * limit,
    enabled: open,
  })

  const selectedSession = details?.session || session
  const totalPages = details ? Math.ceil(details.events.total / limit) : 0

  if (!selectedSession) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Detalhes do acesso</DialogTitle>
          <DialogDescription>
            Sessao, usuario e eventos registrados para este acesso.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList>
              <TabsTrigger value="summary">Resumo da sessao</TabsTrigger>
              <TabsTrigger value="events">
                Eventos ({details?.events.total || selectedSession.eventsCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Usuario</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-4">
                    <Avatar
                      url={selectedSession.avatar || ''}
                      name={selectedSession.userName}
                      size="lg"
                      variant="default"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">
                        {selectedSession.userName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedSession.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedSession.companyName || 'Sem empresa'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sessao</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Info label="Status">
                      <Badge
                        status
                        variant={
                          selectedSession.isActive
                            ? 'successLight'
                            : 'neutralLight'
                        }
                      >
                        {selectedSession.isActive ? 'Ativa' : 'Encerrada'}
                      </Badge>
                    </Info>
                    <Info label="Metodo">
                      <Badge variant="blueLight">
                        {selectedSession.method || '-'}
                      </Badge>
                    </Info>
                    <Info label="Inicio">
                      {formatToLocaleDateTime(selectedSession.createdAt)}
                    </Info>
                    <Info label="Ultima atividade">
                      {formatToLocaleDateTime(selectedSession.lastActive)}
                    </Info>
                    <Info label="Logout">
                      {selectedSession.logoutAt
                        ? formatToLocaleDateTime(selectedSession.logoutAt)
                        : '-'}
                    </Info>
                    <Info label="IP">{selectedSession.ipAddress || '-'}</Info>
                    <Info label="Endpoint">
                      <span className="break-all">
                        {selectedSession.endpoint || '-'}
                      </span>
                    </Info>
                    <Info label="User agent">
                      <span className="break-all">
                        {selectedSession.userAgent || '-'}
                      </span>
                    </Info>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {isLoading ? (
                <TableSkeleton cols={5} rows={6} />
              ) : !details?.events.data.length ? (
                <ListDataStatusEmpty title="Nenhum evento encontrado" />
              ) : (
                <>
                  <div className="rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Metodo</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>User agent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.events.data.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              {formatToLocaleDateTime(event.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="neutralLight">
                                {event.method || '-'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-72 break-all">
                              {event.endpoint || '-'}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {event.ipAddress || '-'}
                            </TableCell>
                            <TableCell className="max-w-80 break-all text-xs">
                              {event.userAgent || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPages > 1 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Pagina {page + 1} de {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={page === 0}
                          onClick={() => setPage((value) => value - 1)}
                        >
                          Anterior
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={page >= totalPages - 1}
                          onClick={() => setPage((value) => value + 1)}
                        >
                          Proxima
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  )
}
