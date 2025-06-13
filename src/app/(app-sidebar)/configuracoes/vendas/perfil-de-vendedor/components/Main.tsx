'use client'

// React
import { Fragment, useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardFooter, CardContent } from '@/components/ui/card'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { AddSellerDialog } from './Actions/AddSeller'
import { DeleteSellerDialog } from './Actions/DeleteSeller'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ConfigureProfileDialog } from './Actions/ConfigureProfile'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type {
  SellerProfileType,
  ListSellerProfileDataType,
  SellerProfileEmployeesType,
} from '@/types/settings/sellerProfile'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconTrash,
  IconUserPlus,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { UserInfo } from '@/components/common/UserInfo'
import { DeleteProfileDialog } from './Actions/DeleteProfile'

export function Main({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<SellerProfileType>()
  const [employeeData, setEmployeeData] = useState<SellerProfileEmployeesType>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['seller-profile-list', searchParams],
    queryFn: () => getDataOld({ route: 'sellerProfileRoute' }),
  })

  const profiles: ListSellerProfileDataType[] = data?.profiles || []
  const hasData = profiles.length

  return (
    <div className="space-y-5">
      <Topbar
        title="Perfil de vendedor"
        previousPage="/configuracoes/vendas"
        primaryCta={<NewItemDialog />}
      />
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <TableSkeleton cols={5} />
          ) : !hasData ? (
            <ListDataTotalEmpty
              icon={IconUserCircle}
              title="Nenhum perfil cadastrado"
              description="Crie o primeiro perfil"
              cta={<NewItemDialog />}
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Perfil</TableHead>
                      <TableHead>Desconto máximo</TableHead>
                      <TableHead>Valor mínimo venda</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((group) => (
                      <Fragment key={group.profile?.id}>
                        <TableRow className="bg-gray-100">
                          <TableCell className="text-gray font-medium text-xs py-0">
                            {group?.profile?.name}
                          </TableCell>
                          <TableCell className="py-0">
                            {group?.profile?.maxDiscount} %
                          </TableCell>
                          <TableCell className="py-0">
                            {formatCurrencyToBrl(group?.profile?.minValue)}
                          </TableCell>
                          <TableCell className="py-0">
                            {group?.profile?.commission} %
                          </TableCell>
                          <TableCell className="py-0">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <ActionButton
                                  Icon={IconUserPlus}
                                  tooltip="Adicionar vendedor"
                                  onClick={() => {
                                    setOpenDialog('addSeller')
                                    setRowData(group?.profile)
                                  }}
                                />
                                <ActionButton
                                  Icon={IconSettings}
                                  tooltip="Configurar perfil do vendedor"
                                  onClick={() => {
                                    setOpenDialog('configure')
                                    setRowData(group?.profile)
                                  }}
                                />
                                <ActionButton
                                  Icon={IconTrash}
                                  tooltip="Remover perfil"
                                  onClick={() => {
                                    setOpenDialog('removeProfile')
                                    setRowData(group?.profile)
                                  }}
                                />
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                        {group?.employees?.length ? (
                          group?.employees.map((item) => {
                            return (
                              <TableRow key={item?.id}>
                                <TableCell className="flex items-center gap-3">
                                  <UserInfo
                                    name={item?.name}
                                    description={item?.role}
                                    imageUrl={item?.avatar}
                                  />
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <TooltipProvider>
                                      <ActionButton
                                        Icon={IconTrash}
                                        tooltip="Remover vendedor"
                                        onClick={() => {
                                          setOpenDialog('removeSeller')
                                          setEmployeeData(item)
                                        }}
                                      />
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-gray-600">
                              Sem vendedor
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              {isLoading || hasData ? (
                <CardFooter>
                  <TablePagination
                    searchParams={searchParams}
                    lastPage={data?.lastPage}
                  />
                </CardFooter>
              ) : null}
              <DeleteSellerDialog
                open={openDialog === 'removeSeller'}
                setOpen={setOpenDialog}
                rowData={employeeData}
                searchParams={searchParams}
              />
              <AddSellerDialog
                open={openDialog === 'addSeller'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <ConfigureProfileDialog
                open={openDialog === 'configure'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <DeleteProfileDialog
                open={openDialog === 'removeProfile'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
