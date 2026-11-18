'use client'
// React
import { InfoHint } from '@/components/common/InfoHint'
import { Fragment, useState } from 'react'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { DeleteAlertDialog } from './Actions/Delete'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
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

  const statuses: QuotationStatusType[] = data?.quotationTags || []
  const hasData = statuses.length

  return (
    <div className="space-y-5">
      <Topbar
        title="Status de orçamento"
        previousPage="/configuracoes/vendas"
        primaryCta={<NewItemDialog />}
      />
      {/* O andamento (digitação, aguardando, vencido, rejeitado, aprovado) o
          sistema controla sozinho; estes são marcadores de acompanhamento da
          negociação (CRM fase 1, 24/10/2026) */}
      <div className="flex items-center gap-1.5 text-xs text-gray">
        Para que serve
        <InfoHint title="Status de orçamento">
          <p>
            Marcadores para acompanhar a negociação: em que pé está cada
            orçamento enquanto o cliente não decide (proposta enviada, em
            negociação).
          </p>
          <p>
            A lista de orçamentos filtra por eles. O andamento do orçamento
            (digitação, aguardando, aprovado) é outra coisa e é do sistema.
          </p>
        </InfoHint>
      </div>
      <div className="space-y-2">
        <Card>
          {!isLoading && !hasData ? (
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
                      <TableHead>Como aparece</TableHead>
                      <TableHead>Orçamentos</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableSkeletonRows cols={4} />
                    ) : (
                      statuses.map((item) => (
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
                            <TableCell className="text-gray-600">
                              {item?.quotations ?? '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <TooltipProvider>
                                  <PermissionGate
                                    permissions={[
                                      'sales_settings:quotation_status:edit',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconPencil}
                                      tooltip="Editar status"
                                      onClick={() => {
                                        setOpenDialog('edit')
                                        setRowData(item)
                                      }}
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={[
                                      'sales_settings:quotation_status:delete',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={IconTrash}
                                      tooltip="Excluir"
                                      onClick={() => {
                                        setOpenDialog('delete')
                                        setRowData(item)
                                      }}
                                    />
                                  </PermissionGate>
                                </TooltipProvider>
                              </div>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      ))
                    )}
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
