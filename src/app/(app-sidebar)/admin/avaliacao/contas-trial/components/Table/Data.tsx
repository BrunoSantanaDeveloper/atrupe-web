'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { EditTrialAccountDialog } from '../EditTrialAccountDialog'
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
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Libs
import { formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPencil, IconHistory } from '@tabler/icons-react'
import Image from 'next/image'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export interface TrialAccountItem {
  id: string
  avatar?: string
  companyName?: string
  displayName?: string
  code?: string
  document?: string
  userName?: string
  phone?: string
  email?: string
  trialPeriod?: string
  createdAt?: string
  stateId?: string
  cityId?: string
}

interface GroupedData {
  date: string
  data: TrialAccountItem[]
}

export function Data({ searchParams, searchDescription }: Props) {
  const [rowData, setRowData] = useState<TrialAccountItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filters = { ...searchParams }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['', searchParams],
    queryFn: () => getDataOld({ route: '', filters }),
  })

  const dataArray = data?.data || []
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Período de teste</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataArray.map((group: GroupedData) => (
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
                            <TableRow key={item?.id}>
                              {/* Conta */}
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    {item?.avatar ? (
                                      <Image
                                        src={item.avatar}
                                        alt={item?.companyName || 'Avatar'}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-300" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {item?.companyName ||
                                        'Nome do Empresa Ltda'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {`${item?.code} - ${item?.document}`}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              {/* Usuário */}
                              <TableCell>
                                <p className="text-sm text-gray-700">
                                  {item?.userName || '-'}
                                </p>
                              </TableCell>
                              {/* Contato */}
                              <TableCell>
                                <div className="text-sm">
                                  <p className="text-gray-700">
                                    {item?.phone || '00 00000-0000'}
                                  </p>
                                  <p className="text-gray-600">
                                    {item?.email || 'contato@email.com.br'}
                                  </p>
                                </div>
                              </TableCell>
                              {/* Período de teste */}
                              <TableCell>
                                <p className="text-sm text-gray-700 text-nowrap">
                                  {item?.trialPeriod || '-'}
                                </p>
                              </TableCell>
                              {/* Ações */}
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <ActionButton
                                      Icon={IconPencil}
                                      tooltip="Editar"
                                      onClick={() => {
                                        setRowData(item)
                                        setIsDialogOpen(true)
                                      }}
                                    />
                                    <ActionButton
                                      Icon={IconHistory}
                                      tooltip="Histórico"
                                      onClick={() => {
                                        setRowData(item)
                                      }}
                                    />
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
      <EditTrialAccountDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        rowData={rowData}
      />
    </>
  )
}
