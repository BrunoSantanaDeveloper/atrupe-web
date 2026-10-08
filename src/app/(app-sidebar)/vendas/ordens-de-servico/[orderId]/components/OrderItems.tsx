// React
import { Fragment, useState } from 'react'

// UI
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardContent,
} from '@/components/ui/card'
import { toast } from 'sonner'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
// import { ItemImageDialog } from './ItemActions/Image'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { ItemNotesDialog } from '../../../orcamentos/[quotationId]/components/ItemActions/Notes'
import { ItemImageDialog } from '../../../orcamentos/[quotationId]/components/ItemActions/Image'

// Icons
import {
  IconCopy,
  IconCoin,
  IconPhoto,
  IconTrash,
  IconPencil,
  IconMessage,
  IconPlus,
  IconLayoutGrid,
  IconCornerDownRight,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Type
import { OrderType } from '@/types/sales/order'
import { QuotationItemType } from '@/types/sales/quotation'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import {
  calculateTotalQuantity,
  calculateDisplayUnitValue,
  calculateItemDisplayUnitValue,
  generateFormattedQuantityDetails,
} from '@/lib/quotation-display-utils'

// Actions
import { createItem } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'
import { Separator } from '@/components/ui/separator'

import { QUOTATION_DATA_QUERY_KEY } from '../../../orcamentos/[quotationId]/components/Quotation'

interface Props {
  data: OrderType
}

export function OrderItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<QuotationItemType>()
  const [accordionValue, setAccordionValue] = useState<string[]>()

  const status = data?.status

  const queryClient = useQueryClient()

  const mutationDuplicate = useMutation({
    mutationFn: (id: string) =>
      createItem({
        route: 'quotationRoute',
        customPath: `/duplicate-product/${id}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    },
  })

  const handleDuplicateItem = async (item: QuotationItemType) => {
    try {
      await mutationDuplicate.mutateAsync(item.id)
      toast.success('Item duplicado')
    } catch (error) {
      toast.error('Erro ao duplicar item')
    }
  }

  const items = data?.quotation?.quotationItems

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
            <CardTitle>Itens</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          {items?.length ? (
            <>
              <Accordion
                type="multiple"
                value={accordionValue}
                onValueChange={setAccordionValue}
              >
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="min-w-[300px]">
                        Referência
                      </TableHead>
                      <TableHead>Qtd. Item</TableHead>
                      <TableHead>Detalhamento</TableHead>
                      <TableHead>Qtd. Total</TableHead>
                      <PermissionGate permissions={['values:values:view']}>
                        <TableHead>Valor un.</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Valor final</TableHead>
                      </PermissionGate>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr:last-child]:border-b">
                    {items?.map((item, index) => {
                      const isComposite = item.product.compositions.length > 1

                      // Renderização para produtos simples (apenas 1 composição)
                      if (
                        !isComposite &&
                        item.product.compositions.length === 1
                      ) {
                        const composition = item.product.compositions[0]

                        return (
                          <Fragment key={item?.id + index}>
                            {/* Linha única para produtos simples - dados da composição diretamente */}
                            <TableRow className="border-b">
                              <TableCell className="font-medium pl-14 flex items-center gap-4 py-6 text-sm">
                                {item?.description || '-'}
                              </TableCell>
                              <TableCell className="py-4 text-sm text-gray">
                                {item.product.quantity}
                              </TableCell>
                              <TableCell className="py-4 text-sm text-gray">
                                {generateFormattedQuantityDetails(composition)}
                              </TableCell>
                              <TableCell className="py-4 text-sm text-gray">
                                {
                                  calculateTotalQuantity(
                                    item.product.quantity,
                                    composition,
                                  ).formatted
                                }
                              </TableCell>
                              <PermissionGate
                                permissions={['values:values:view']}
                              >
                                <TableCell className="py-4 text-sm text-gray">
                                  {formatCurrencyToBrl(
                                    calculateItemDisplayUnitValue(
                                      item,
                                      composition,
                                    ),
                                  )}
                                </TableCell>
                                <TableCell className="text-warning-600 text-nowrap py-4">
                                  -
                                  {formatCurrencyToBrl(
                                    Math.max(
                                      0,
                                      item?.totalValue - item?.finalValue,
                                    ),
                                  )}
                                </TableCell>
                                <TableCell className="py-4 text-sm text-gray">
                                  {formatCurrencyToBrl(item?.finalValue)}
                                </TableCell>
                              </PermissionGate>
                              <TableCell className="py-4">
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconMessage}
                                        tooltip="Observações"
                                        onClick={() => {
                                          setOpenDialog('notes')
                                          setRowData(item)
                                        }}
                                        badge={
                                          item?.notes
                                            ? 'warningLight'
                                            : undefined
                                        }
                                        disabled={actionDisabled(
                                          'notes',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconPhoto}
                                        tooltip="Imagem"
                                        onClick={() => {
                                          setOpenDialog('image')
                                          setRowData(item)
                                        }}
                                        disabled={actionDisabled(
                                          'image',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconCopy}
                                        tooltip="Duplicar item"
                                        onClick={() =>
                                          handleDuplicateItem(item)
                                        }
                                        disabled={actionDisabled(
                                          'duplicate',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconPencil}
                                        tooltip="Editar item"
                                        disabled={actionDisabled(
                                          'edit',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={[
                                        'sale:order:edit',
                                        'values:values:view',
                                      ]}
                                      requireAll
                                    >
                                      <ActionButton
                                        Icon={IconCoin}
                                        tooltip="Valores"
                                        onClick={() => {
                                          setOpenDialog('values')
                                          setRowData(item)
                                        }}
                                        disabled={actionDisabled(
                                          'values',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconTrash}
                                        tooltip="Excluir item"
                                        onClick={() => {
                                          setOpenDialog('delete')
                                          setRowData(item)
                                        }}
                                        disabled={actionDisabled(
                                          'delete',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          </Fragment>
                        )
                      }

                      // Renderização para produtos compostos (comportamento atual)
                      return (
                        <AccordionItem
                          asChild
                          key={item?.id + index}
                          value={item?.id + index}
                        >
                          <Fragment>
                            <TableRow
                              className={cn(
                                accordionValue?.includes(item?.id + index)
                                  ? 'bg-gray-100'
                                  : 'border-0',
                              )}
                            >
                              <TableCell>
                                <AccordionTrigger className="flex-row-reverse justify-end px-1 [&>svg]:text-gray [&>svg]:size-5 gap-3">
                                  {item?.description || '-'}
                                </AccordionTrigger>
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                {item?.product?.quantity || 1}
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                -
                              </TableCell>
                              <TableCell className="text-sm text-gray">
                                {`${item?.product?.quantity || 1} un`}
                              </TableCell>
                              <PermissionGate
                                permissions={['values:values:view']}
                              >
                                <TableCell className="text-sm text-gray">
                                  {formatCurrencyToBrl(
                                    item?.totalValue /
                                      (item?.product?.quantity || 1),
                                  )}
                                </TableCell>
                                <TableCell className="text-warning-600 text-nowrap">
                                  -
                                  {formatCurrencyToBrl(
                                    Math.max(
                                      0,
                                      item?.totalValue - item?.finalValue,
                                    ),
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray">
                                  {formatCurrencyToBrl(item?.finalValue)}
                                </TableCell>
                              </PermissionGate>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <TooltipProvider>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconMessage}
                                        tooltip="Observações"
                                        onClick={() => {
                                          setOpenDialog('notes')
                                          setRowData(item)
                                        }}
                                        badge={
                                          item?.notes
                                            ? 'warningLight'
                                            : undefined
                                        }
                                        disabled={actionDisabled(
                                          'notes',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:order:edit']}
                                    >
                                      <ActionButton
                                        Icon={IconPhoto}
                                        tooltip="Imagem"
                                        onClick={() => {
                                          setOpenDialog('image')
                                          setRowData(item)
                                        }}
                                        disabled={actionDisabled(
                                          'image',
                                          status,
                                        )}
                                      />
                                    </PermissionGate>
                                    <ActionButton
                                      Icon={IconCopy}
                                      tooltip="Duplicar item"
                                      disabled
                                    />
                                    <ActionButton
                                      Icon={IconPencil}
                                      tooltip="Editar item"
                                      disabled
                                    />
                                    <PermissionGate
                                      permissions={[
                                        'sale:order:edit',
                                        'values:values:view',
                                      ]}
                                      requireAll
                                    >
                                      <ActionButton
                                        Icon={IconCoin}
                                        tooltip="Valores"
                                        disabled
                                      />
                                    </PermissionGate>
                                    <ActionButton
                                      Icon={IconTrash}
                                      tooltip="Excluir item"
                                      disabled
                                    />
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>

                            {item?.product?.compositions?.length
                              ? item?.product?.compositions?.map(
                                  (composition, index) => (
                                    <Fragment key={composition?.id}>
                                      <TableRow
                                        className={cn(
                                          item?.product?.compositions
                                            ?.length ===
                                            index + 1
                                            ? 'border-b'
                                            : 'border-0',
                                          'bg-gray-50 ',
                                        )}
                                      >
                                        <TableCell className="pl-14 py-0">
                                          <AccordionContent className="flex items-center gap-4 py-6 text-sm text-gray-600">
                                            <IconCornerDownRight
                                              size={ICON_SIZE.sm}
                                              className="ml-3 text-gray-400"
                                            />
                                            {composition?.name}
                                          </AccordionContent>
                                        </TableCell>
                                        <TableCell className="py-0 text-sm text-gray">
                                          <AccordionContent className="py-4">
                                            {item.product.quantity}
                                          </AccordionContent>
                                        </TableCell>
                                        <TableCell className="py-0 text-sm text-gray">
                                          <AccordionContent className="py-4">
                                            {generateFormattedQuantityDetails(
                                              composition,
                                            )}
                                          </AccordionContent>
                                        </TableCell>
                                        <TableCell className="py-0 text-sm text-gray">
                                          <AccordionContent className="py-4">
                                            {
                                              calculateTotalQuantity(
                                                item.product.quantity,
                                                composition,
                                              ).formatted
                                            }
                                          </AccordionContent>
                                        </TableCell>
                                        <PermissionGate
                                          permissions={['values:values:view']}
                                        >
                                          <TableCell className="py-0 text-sm text-gray">
                                            <AccordionContent className="py-4">
                                              {formatCurrencyToBrl(
                                                calculateDisplayUnitValue(
                                                  item.product.quantity,
                                                  composition,
                                                ),
                                              )}
                                            </AccordionContent>
                                          </TableCell>
                                          <TableCell className="py-0 text-sm text-gray">
                                            <AccordionContent className="py-4">
                                              -
                                            </AccordionContent>
                                          </TableCell>
                                          <TableCell className="py-0 text-sm text-gray">
                                            <AccordionContent className="py-4">
                                              {formatCurrencyToBrl(
                                                composition?.totalValue,
                                              )}
                                            </AccordionContent>
                                          </TableCell>
                                        </PermissionGate>
                                        <TableCell className="py-0 text-sm text-gray">
                                          <AccordionContent className="py-4"></AccordionContent>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ),
                                )
                              : null}
                          </Fragment>
                        </AccordionItem>
                      )
                    })}
                  </TableBody>
                </Table>
              </Accordion>

              {/* Modal de ações do item */}
              <ItemNotesDialog
                open={openDialog === 'notes'}
                setOpen={setOpenDialog}
                quotationData={data.quotation}
                rowData={rowData}
              />
              <ItemImageDialog
                open={openDialog === 'image'}
                setOpen={setOpenDialog}
                quotationData={data.quotation}
                rowData={rowData}
              />
            </>
          ) : (
            <Separator />
          )}
        </CardContent>
        <CardFooter className="justify-center p-0">
          <Button
            type="button"
            variant="none"
            className="flex justify-center items-center h-full w-full gap-3 py-8 disabled:bg-transparent disabled:opacity-50"
            disabled
          >
            <FeaturedIcon variant="neutralLight" Icon={IconPlus} rounded />
            <p className="text-sm text-gray-600 font-medium">Adicionar item</p>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
