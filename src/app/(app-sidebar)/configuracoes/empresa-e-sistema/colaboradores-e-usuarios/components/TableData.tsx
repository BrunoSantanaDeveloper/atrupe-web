'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { NewEmployeeDialog } from './NewEmployee'
import { NewUserDialog } from './Actions/NewUser'
import { UserHistoryDialog } from './Actions/History'
import { UserInfo } from '@/components/common/UserInfo'
import { EditEmployeeDialog } from './Actions/EditEmployee'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type {
  EmployeeType,
  ListEmployeeDataType,
  UsersQuotaType,
} from '@/types/settings/employee'
import type { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPencil, IconHistory, IconUserPlus } from '@tabler/icons-react'

import { cn } from '@/lib/utils'
import { isUsersQuotaFull } from '@/lib/plans/planAccess'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  /** A cota de usuários do plano, contada pelo servidor na empresa inteira. */
  usersQuota?: UsersQuotaType
}

export function TableData({ tabs, searchParams, usersQuota }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<EmployeeType>()
  const [editUser, setEditUser] = useState(false)

  // Na cota, "Novo usuário" fica desabilitado com o motivo. Sem a cota (ou
  // com -1), não há limite na tela: o servidor confere ao criar.
  const usersQuotaFull = isUsersQuotaFull(usersQuota)
  const usersQuotaReason = usersQuotaFull
    ? `Limite do plano atingido: ${usersQuota?.used} de ${usersQuota?.limit} usuários com acesso.`
    : ''

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['employee-list', searchParams],
    queryFn: () => getDataOld({ route: 'employeeRoute', filters }),
  })

  const employeeArray: ListEmployeeDataType[] = data?.data || []
  const hasData = employeeArray.length

  const handleCreateUser = (item: EmployeeType) => {
    // Editar o usuário que já existe não conta na cota.
    if (item?.user) {
      setRowData(item)
      setEditUser(true)
      setOpenDialog('new-user')
      return
    }

    if (usersQuotaFull) return

    setRowData(item)
    setEditUser(false)
    setOpenDialog('new-user')
  }

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status colaborador</TableHead>
                  <TableHead>Status usuário</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeArray.map((group) => (
                  <Fragment key={group.sector.id}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs "
                      >
                        {group?.sector?.name}
                      </TableCell>
                    </TableRow>
                    {group?.employees?.length
                      ? group?.employees.map((item) => {
                          return (
                            <TableRow key={item?.id}>
                              <TableCell className="flex items-center gap-3">
                                <UserInfo
                                  name={item?.name || ''}
                                  description={item?.role?.name || ''}
                                  imageUrl={item?.avatarUrl || ''}
                                />
                                {/* O Administrador Principal da Conta (contrato 1.1, 4.1). */}
                                {item?.isOwner && (
                                  <Badge
                                    variant="light"
                                    title="Administrador principal da conta"
                                  >
                                    Usuário nº 1
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  item?.user?.name
                                    ? 'text-gray-600'
                                    : 'text-gray-300',
                                )}
                              >
                                <p>{item?.user?.name || 'Sem usuário'}</p>
                                <p className="text-xs">
                                  {item?.user?.email || ''}
                                </p>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  status
                                  variant={
                                    item?.isActive
                                      ? 'successLight'
                                      : 'neutralLight'
                                  }
                                >
                                  {item?.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {item?.user ? (
                                  <Badge
                                    status
                                    variant={
                                      item?.user?.isActive
                                        ? 'successLight'
                                        : 'neutralLight'
                                    }
                                  >
                                    {item?.user?.isActive ? 'Ativo' : 'Inativo'}
                                  </Badge>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={[
                                        'company_settings:users:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconPencil}
                                        tooltip="Editar colaborador"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('edit-employee')
                                        }}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={[
                                        !item?.user
                                          ? 'company_settings:users:create'
                                          : 'company_settings:users:edit',
                                      ]}
                                    >
                                      {!item?.user && usersQuotaFull ? (
                                        // Botão desabilitado não dispara o
                                        // tooltip: o motivo fica no span.
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span
                                              className="inline-flex"
                                              tabIndex={0}
                                            >
                                              <Button
                                                type="button"
                                                size="icon"
                                                variant="neutralGhost"
                                                aria-label="Novo usuário"
                                                RightIcon={IconUserPlus}
                                                disabled
                                              />
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{usersQuotaReason}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <ActionButton
                                          Icon={
                                            item?.user
                                              ? IconPencil
                                              : IconUserPlus
                                          }
                                          tooltip={
                                            item?.user
                                              ? 'Editar usuário'
                                              : 'Novo usuário'
                                          }
                                          onClick={() => handleCreateUser(item)}
                                        />
                                      )}
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={[
                                        'company_settings:users:view',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconHistory}
                                        tooltip="Histórico"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('history')
                                        }}
                                      />
                                    </PermissionGate>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
            <EditEmployeeDialog
              open={openDialog === 'edit-employee'}
              setOpen={setOpenDialog}
              rowData={rowData}
              searchParams={searchParams}
            />
            <NewUserDialog
              open={openDialog === 'new-user'}
              setOpen={setOpenDialog}
              rowData={rowData}
              editMode={editUser}
              searchParams={searchParams}
            />
            <UserHistoryDialog
              open={openDialog === 'history'}
              setOpen={setOpenDialog}
              rowData={rowData}
            />
          </>
        ) : (
          <FilteredDataEmpty
            title="Colaborador não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre um novo colaborador."
            cta={
              <PermissionGate permissions={['company_settings:users:create']}>
                <NewEmployeeDialog />
              </PermissionGate>
            }
          />
        )}
      </CardContent>
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
