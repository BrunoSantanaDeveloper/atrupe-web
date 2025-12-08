'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { CompleteRegistrationDialog } from '../CompleteRegistrationDialog'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { formatToLocaleDate, formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPencil } from '@tabler/icons-react'

export interface IncompleteRegistrationItem {
  id: string
  companyName: string
  code: string
  userName: string
  phone: string
  email: string
  createdAt: string
}

interface GroupedData {
  date: string
  data: IncompleteRegistrationItem[]
}

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export function Data({ searchParams, searchDescription }: Props) {
  const [rowData, setRowData] = useState<IncompleteRegistrationItem | null>(
    null,
  )
  const [openDialog, setOpenDialog] = useState(false)

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['incomplete-registration-list', searchParams],
    queryFn: () =>
      getData({ route: '/subscriptions/incomplete-registrations', filters }),
  })

  const dataArray: GroupedData[] = data?.data || []
  const hasData = dataArray.length

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
                  <TableHead>Conta</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Criação</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataArray.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {formatToWeekDate(group?.date)}
                      </TableCell>
                    </TableRow>
                    {group?.data?.length
                      ? group?.data.map((item) => {
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <p className="font-medium">
                                  {item.companyName}
                                </p>
                              </TableCell>
                              <TableCell className="text-success-700 text-nowrap">
                                {item.code}
                              </TableCell>
                              <TableCell>{item.userName}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p className="text-gray-900">{item.phone}</p>
                                  <p className="text-gray-600">{item.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {formatToLocaleDate(item.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={[
                                        'admin:incomplete_registrations:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconPencil}
                                        tooltip="Cadastrar"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog(true)
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
          </>
        ) : (
          <FilteredDataEmpty
            title="Resultado não encontrado"
            description={
              searchDescription ||
              'Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo item'
            }
            cta={undefined}
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            // lastPage={data?.lastPage}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
          />
        </CardFooter>
      ) : null}

      <CompleteRegistrationDialog
        open={openDialog}
        setOpen={setOpenDialog}
        rowData={rowData}
      />
    </>
  )
}
