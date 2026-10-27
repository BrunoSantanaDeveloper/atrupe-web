'use client'

// React
import { useState } from 'react'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
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
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { ListClientsDataType } from '../../types'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld, deleteItemNew } from '@/actions/_cruds'

// Third-party
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'

// Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Consts
import { clientStatusObj } from '@/consts/client'

// Icons
import { IconTrash } from '@tabler/icons-react'
import { NewClientModal, NewClientTriggerButton } from '../NewClient'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function ClientsData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const { open: openAlertDialog } = useAlertDialog()
  const queryClient = useQueryClient()
  const { canManageClientResponsible } = usePlanFeatures()
  const showResponsible = canManageClientResponsible()

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['client-list', searchParams],
    queryFn: () => getDataOld({ route: 'clientRoute', filters }),
  })

  const clients: ListClientsDataType[] = data?.data || []
  const hasData = clients.length

  const prospectClients = clients.filter((c) => c.status === 'PROSPECT')
  const isAllProspectsSelected =
    prospectClients.length > 0 &&
    selectedClients.length === prospectClients.length

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(prospectClients.map((c) => c.id))
    } else {
      setSelectedClients([])
    }
  }

  const handleDelete = (ids: string[]) => {
    openAlertDialog({
      title: ids.length > 1 ? 'Excluir clientes' : 'Excluir cliente',
      description:
        'Tem certeza que deseja excluir? Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      iconTone: 'error',
      confirmVariant: 'error',
      onConfirm: async () => {
        try {
          // Deleta em série para não sobrecarregar
          let hasError = false
          for (const id of ids) {
            const res = await deleteItemNew({ route: `/client/${id}` })
            if (!res.success) {
              hasError = true
              toast.error(res.message || 'Erro ao excluir cliente(s)')
              break
            }
          }
          if (!hasError) {
            toast.success(
              ids.length > 1 ? 'Clientes excluídos' : 'Cliente excluído',
            )
          }
          queryClient.invalidateQueries({ queryKey: ['client-list'] })
          queryClient.invalidateQueries({ queryKey: ['clients-totals'] })
          setSelectedClients([])
        } catch (error) {
          toast.error('Erro ao excluir cliente(s)')
        }
      },
    })
  }

  return (
    <>
      <CardContent>
        {selectedClients.length > 0 && (
          <div className="flex items-center justify-between bg-error-50 p-3 rounded-md mb-4 border border-error-100">
            <span className="text-sm text-error-700 font-medium">
              {selectedClients.length}{' '}
              {selectedClients.length === 1
                ? 'cliente selecionado'
                : 'clientes selecionados'}
            </span>
            <Button
              variant="error"
              size="sm"
              LeftIcon={IconTrash}
              onClick={() => handleDelete(selectedClients)}
            >
              Excluir selecionados
            </Button>
          </div>
        )}
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[4%] pr-0">
                    <Checkbox
                      checked={isAllProspectsSelected}
                      onCheckedChange={handleToggleSelectAll}
                      disabled={prospectClients.length === 0}
                      aria-label="Selecionar todos os pré-cadastros"
                    />
                  </TableHead>
                  <TableHead className="w-[2%]"></TableHead>
                  <TableHead className="w-[34%]">Cliente</TableHead>
                  <TableHead className="w-[20%]">Grupo</TableHead>
                  <TableHead className="w-[20%]">Contato</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows cols={7} />
                ) : (
                  clients.map((client) => (
                    <TableRow
                      key={client.id}
                      data-state={
                        selectedClients.includes(client.id)
                          ? 'selected'
                          : undefined
                      }
                    >
                      <TableCell className="pr-0">
                        {client.status === 'PROSPECT' ? (
                          <Checkbox
                            checked={selectedClients.includes(client.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedClients([
                                  ...selectedClients,
                                  client.id,
                                ])
                              } else {
                                setSelectedClients(
                                  selectedClients.filter(
                                    (id) => id !== client.id,
                                  ),
                                )
                              }
                            }}
                            aria-label={`Selecionar cliente ${client.name}`}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-gray ">
                        {client?.type === 'COMPANY' ? 'PJ' : 'PF'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {client?.name}
                      </TableCell>
                      <TableCell className="text-gray">
                        {client?.categoryRelation?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <p>{client?.phoneNumber || '-'}</p>
                        <p className="text-sm text-gray">
                          {client?.email || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          status
                          variant={clientStatusObj[client?.status]?.variant}
                          className="text-nowrap"
                        >
                          {clientStatusObj[client?.status]?.text}
                        </Badge>
                        {/* Bloqueado no limite de crédito: não aprova venda
                            nem gera cobrança (decisão de 24/10/2026) */}
                        {client?.blockClient && (
                          <Badge
                            status
                            variant="errorLight"
                            className="ml-1 text-nowrap"
                          >
                            Bloqueado
                          </Badge>
                        )}
                        {showResponsible && (
                          <p className="mt-1 text-sm text-gray italic">
                            {client?.responsible?.name || 'Sem responsável'}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <PermissionGate
                              permissions={['register:client:view']}
                            >
                              <ActionButton
                                link={`/cadastros/clientes/${client?.id}/dados`}
                                gesto="ver"
                                tooltip="Detalhes"
                              />
                            </PermissionGate>
                            <PermissionGate
                              permissions={['register:client:edit']}
                            >
                              <NewClientTriggerButton
                                editMode
                                onOpenChange={() => {
                                  setSelectedClientId(client?.id)
                                  setOpenDialog('edit-client')
                                }}
                              />
                            </PermissionGate>
                            {client.status === 'PROSPECT' && (
                              <PermissionGate
                                permissions={['register:client:delete']}
                              >
                                <ActionButton
                                  Icon={IconTrash}
                                  tooltip="Excluir"
                                  variant="errorGhost"
                                  onClick={() => handleDelete([client.id])}
                                />
                              </PermissionGate>
                            )}
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
        </FetchingRegion>
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
            isLoading={isLoading}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
