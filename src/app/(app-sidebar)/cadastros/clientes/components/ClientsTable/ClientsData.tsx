'use client'

// React
import { useState } from 'react'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

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
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { ListClientsDataType } from '../../types'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Consts
import { clientStatusObj } from '@/consts/client'

// Icons
import { IconEye } from '@tabler/icons-react'
import { NewClientModal, NewClientTriggerButton } from '../NewClient'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function ClientsData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('')

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['client-list', searchParams],
    queryFn: () => getDataOld({ route: 'clientRoute', filters }),
  })

  const clients: ListClientsDataType[] = data?.data || []
  const hasData = clients.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[2%]"></TableHead>
                <TableHead className="w-[38%]">Cliente</TableHead>
                <TableHead className="w-[20%]">Categoria</TableHead>
                <TableHead className="w-[20%]">Contato</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="text-sm text-gray ">
                    {client?.kind === 'COMPANY' ? 'PJ' : 'PF'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {client?.name}
                  </TableCell>
                  <TableCell className="text-gray">Sem categoria</TableCell>
                  <TableCell>
                    <p>{client?.phoneNumber || '-'}</p>
                    <p className="text-sm text-gray">{client?.email || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      status
                      variant={clientStatusObj[client?.status]?.variant}
                    >
                      {clientStatusObj[client?.status]?.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <PermissionGate permissions={['register:client:view']}>
                          <ActionButton
                            link={`/cadastros/clientes/${client?.id}/dados`}
                            Icon={IconEye}
                            tooltip="Detalhes"
                          />
                        </PermissionGate>
                        <PermissionGate permissions={['register:client:edit']}>
                          <NewClientTriggerButton
                            editMode
                            onOpenChange={() => {
                              setSelectedClientId(client?.id)
                              setOpenDialog('edit-client')
                            }}
                          />
                        </PermissionGate>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <FilteredDataEmpty
            title="Cliente não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo cliente"
            cta={
              <PermissionGate permissions={['register:client:create']}>
                <NewClientTriggerButton
                  onOpenChange={() => {
                    setOpenDialog('new-client')
                  }}
                />
              </PermissionGate>
            }
          />
        )}
      </CardContent>
      <NewClientModal
        open={openDialog === 'new-client'}
        onOpenChange={() => setOpenDialog('')}
      />
      <NewClientModal
        open={openDialog === 'edit-client'}
        editMode
        clientId={selectedClientId}
        onOpenChange={() => {
          setOpenDialog('')
          setSelectedClientId('')
        }}
      />
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
