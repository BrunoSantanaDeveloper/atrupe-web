'use client'

// React
import { useState } from 'react'

// Components
import { EditItemDialog } from './Actions/Edit'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
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
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Types
import type { ListSectorDataType } from '@/types/settings/sector'
import type { SearchParamsType } from '@/types/coreTypes'

// Icons
import {
  IconPencil,
  IconSettingsOff,
  IconQuestionMark,
} from '@tabler/icons-react'

// Actions
import { getDataOld, updateItem } from '@/actions/_cruds'

// Third-party
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { sectorIcons } from '@/consts/sectors'

interface Props extends SearchParamsType {}

export function Main({ searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<ListSectorDataType>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sector-list', searchParams],
    queryFn: () =>
      getDataOld({
        route: 'sectorRoute',
        filters: searchParams,
        perPage: '999',
      }),
  })

  const sectorsArray: ListSectorDataType[] = data?.data || []
  const hasData = sectorsArray.length

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (params: { id: string; value: boolean }) =>
      updateItem('sectorRoute', params.id, { isActive: params.value }),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleSwitchChange = async (
    id: string,
    value: boolean,
    kind?: string,
  ) => {
    if (mutation.isPending || kind === 'ADMINISTRATIVE') return

    toast.promise(mutation.mutateAsync({ id, value }), {
      loading: 'Aguarde...',
      success: 'Status atualizado!',
      error: 'Ocorreu um erro',
    })
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Configuração de setores"
        previousPage="/configuracoes/empresa-e-sistema"
      />
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <TableSkeleton cols={2} rows={16} />
          ) : !hasData ? (
            <ListDataTotalEmpty
              icon={IconSettingsOff}
              title="Nenhum setor encontrado"
              description=""
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Setor</TableHead>
                      <TableHead className="flex justify-end items-center gap-4 pr-20">
                        Ativo
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectorsArray?.length
                      ? sectorsArray.map((item) => {
                          return (
                            <TableRow key={item?.id}>
                              <TableCell className="flex items-center gap-3">
                                <FeaturedIcon
                                  rounded
                                  variant={
                                    item?.isActive ? 'light' : 'neutralLight'
                                  }
                                  Icon={
                                    sectorIcons[item?.icon] || IconQuestionMark
                                  }
                                  className="[&_path]:stroke-[3px]"
                                />
                                <p className="font-medium">
                                  {item?.name || '-'}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end items-center gap-4">
                                  <Switch
                                    id="isActive"
                                    checked={item?.isActive}
                                    onCheckedChange={(value) =>
                                      handleSwitchChange(
                                        item?.id,
                                        value,
                                        item?.kind,
                                      )
                                    }
                                    disabled={
                                      (mutation.isPending &&
                                        mutation.variables?.id === item.id) ||
                                      item?.kind === 'ADMINISTRATIVE'
                                    }
                                  />
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={[
                                        'company_settings:measurement_standards:edit',
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconPencil}
                                        tooltip="Editar"
                                        onClick={() => {
                                          setRowData(item)
                                          setOpenDialog('edit')
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
                  </TableBody>
                </Table>
              </CardContent>
              <EditItemDialog
                open={openDialog === 'edit'}
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
