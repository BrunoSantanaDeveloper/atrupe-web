'use client'

// React
import { Fragment, useState, useEffect } from 'react'

// Components
import { Badge } from '@/components/ui/badge'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { CompleteRegistrationDialog } from '../CompleteRegistrationDialog'

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
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import { IconPencil, IconCopy } from '@tabler/icons-react'

import { toast } from 'sonner'

export interface IncompleteRegistrationItem {
  id: string
  companyName: string
  code: string
  userName: string
  phone: string
  email: string
  createdAt: string
  emailVerified: boolean
  token: string | null
  expiresAt: string | null
}

interface GroupedData {
  date: string
  data: IncompleteRegistrationItem[]
}

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

function TokenCell({ item }: { item: IncompleteRegistrationItem }) {
  const [isExpired, setIsExpired] = useState(
    item.expiresAt ? new Date() > new Date(item.expiresAt) : false,
  )
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!item.expiresAt) return

    const update = () => {
      const diff = new Date(item.expiresAt!).getTime() - new Date().getTime()
      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft('Expirado')
        return false
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      )
      return true
    }

    const active = update()
    if (!active) return

    const interval = setInterval(() => {
      if (!update()) clearInterval(interval)
    }, 1000)

    return () => clearInterval(interval)
  }, [item.expiresAt])

  if (!item.token) return <span className="text-gray-400">-</span>

  return (
    <div className="flex flex-col text-nowrap">
      <div className="flex items-center gap-2">
        <span
          className={`font-medium ${isExpired ? 'text-gray-400' : 'text-success-700'}`}
        >
          {item.token}
        </span>
        {!isExpired && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(item.token!)
              toast.success('Token copiado!')
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copiar token"
          >
            <IconCopy size={14} />
          </button>
        )}
      </div>
      <span
        className={`text-[10px] mt-0.5 ${isExpired ? 'text-error-500' : 'text-success-600'}`}
      >
        {timeLeft || '...'}
      </span>
    </div>
  )
}

export function Data({ searchParams, searchDescription }: Props) {
  const [rowData, setRowData] = useState<IncompleteRegistrationItem | null>(
    null,
  )
  const [openDialog, setOpenDialog] = useState(false)

  const filters = { ...searchParams }

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['incomplete-registration-list', searchParams],
    queryFn: () =>
      getData({ route: '/subscriptions/incomplete-registrations', filters }),
  })

  const dataArray: GroupedData[] = data?.data || []
  const hasData = dataArray.length

  return (
    <>
      <CardContent>
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Conta</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Validação e-mail</TableHead>
                    <TableHead>Criação</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeletonRows cols={7} />
                  ) : (
                    dataArray.map((group) => (
                      <Fragment key={group.date}>
                        <TableRow className="bg-gray-100">
                          <TableCell
                            colSpan={7}
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
                                    <div>
                                      <p className="font-medium text-sm">
                                        {item.companyName}
                                      </p>
                                      <p className="text-xs text-gray-600">
                                        {item.code}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <TokenCell item={item} />
                                  </TableCell>
                                  <TableCell>{item.userName}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="text-gray-900">
                                        {item.phone}
                                      </p>
                                      <p className="text-gray-600">
                                        {item.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {item.emailVerified ? (
                                      <Badge variant="successLight">
                                        Confirmado
                                      </Badge>
                                    ) : (
                                      <Badge variant="errorLight">
                                        Não confirmado
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-600">
                                    {formatToLocaleDate(item.createdAt)}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex justify-end gap-1">
                                      <TooltipProvider>
                                        <ActionButton
                                          Icon={IconPencil}
                                          tooltip="Cadastrar"
                                          onClick={() => {
                                            setRowData(item)
                                            setOpenDialog(true)
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
                    ))
                  )}
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
        </FetchingRegion>
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            // lastPage={data?.lastPage}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
            isLoading={isLoading}
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
