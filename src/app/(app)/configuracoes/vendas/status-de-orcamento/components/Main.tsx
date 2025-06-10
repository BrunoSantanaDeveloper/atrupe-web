'use client'
// React
import { Fragment, useState } from 'react'

// Component Imports
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { DeleteAlertDialog } from './Actions/Delete'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

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
import { Card, CardContent } from '@/components/ui/card'

// Types
import type { QuotationStatusType } from '@/types/settings/quotationStatus'

// Icons
import {
  IconTrash,
  IconPencil,
  IconAlertSquareRoundedOff,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

export function Main() {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<QuotationStatusType>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-status-list'],
    queryFn: () => getDataOld({ route: 'quotationStatusRoute' }),
  })

  const statuses: QuotationStatusType[] = data?.statusQuotations || []
  const hasData = statuses.length

  return (
    <div className="space-y-5">
      <Topbar
        title="Status de orçamento"
        previousPage="/configuracoes/vendas"
        primaryCta={<NewItemDialog />}
      />
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <TableSkeleton cols={6} />
          ) : !hasData ? (
            <ListDataTotalEmpty
              icon={IconAlertSquareRoundedOff}
              title="Nenhum status cadastrado"
              description="Crie o primeiro status"
              cta={<NewItemDialog />}
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Referência</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statuses.map((item) => (
                      <Fragment key={item.id}>
                        <TableRow key={item?.id}>
                          <TableCell className="font-medium">
                            {item?.title}
                          </TableCell>
                          <TableCell className="font-medium">
                            <Badge
                              className="text-white"
                              variant="neutralLight"
                              style={{
                                backgroundColor: item?.color,
                              }}
                            >
                              {item?.title}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip="Editar motivo"
                                  onClick={() => {
                                    setOpenDialog('edit')
                                    setRowData(item)
                                  }}
                                />
                                <ActionButton
                                  Icon={IconTrash}
                                  tooltip="Excluir"
                                  onClick={() => {
                                    setOpenDialog('delete')
                                    setRowData(item)
                                  }}
                                />
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <NewItemDialog
                editMode
                open={openDialog === 'edit'}
                setOpen={setOpenDialog}
                rowData={rowData}
              />
              <DeleteAlertDialog
                open={openDialog === 'delete'}
                setOpen={setOpenDialog}
                rowData={rowData}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
