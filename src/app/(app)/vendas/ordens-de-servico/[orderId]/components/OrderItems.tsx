/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { ItemNotesDialog } from '../../../orcamentos/[quotationId]/components/ItemActions/Notes'
import { ItemImageDialog } from '../../../orcamentos/[quotationId]/components/ItemActions/Image'

// Icons
import {
  IconCoin,
  IconBulb,
  IconPhoto,
  IconPencil,
  IconMessage,
  IconCirclePlus,
  IconLayoutGrid,
  IconCornerDownRight,
} from '@tabler/icons-react'

// Types
import { OrderType } from '@/types/sales/order'
import type { QuotationItemType } from '@/types/sales/quotation'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  data: OrderType
}

export function OrderItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<QuotationItemType>()
  const [accordionValue, setAccordionValue] = useState<string[]>()

  const status = data?.status

  const handleUnavailable = () => {
    console.info(openDialog)
    toast.error('Recurso indisponível')
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
            <CardTitle className="text-gray-700 font-semibold text-base">
              Itens
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          <Accordion
            type="multiple"
            value={accordionValue}
            onValueChange={setAccordionValue}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="min-w-[390px]">Referência</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Qtd.</TableHead>
                  <TableHead>Valor unitário</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Valor final</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-b">
                {data?.quotation?.quotationItems?.map(
                  (item: any, index: any) => (
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
                          <TableCell>
                            <Badge variant="blueLight">
                              {/* {item?.product?.unitOfMeasure?.code || '-'} */}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {item?.product?.quantity || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {formatCurrencyToBrl(item?.unitValue)}
                          </TableCell>
                          <TableCell className="text-warning-600">
                            -
                            {formatCurrencyToBrl(
                              Math.max(0, item?.totalValue - item?.finalValue),
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {formatCurrencyToBrl(item?.finalValue)}
                          </TableCell>
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
                                      item?.notes ? 'warningLight' : undefined
                                    }
                                    disabled={actionDisabled('notes', status)}
                                  />
                                </PermissionGate>

                                <PermissionGate
                                  permissions={['sale:order:view']}
                                >
                                  <ActionButton
                                    Icon={IconPhoto}
                                    tooltip="Imagem"
                                    onClick={() => {
                                      setOpenDialog('image')
                                      setRowData(item)
                                    }}
                                    disabled={actionDisabled('image', status)}
                                  />
                                </PermissionGate>
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip="Editar item"
                                  onClick={handleUnavailable}
                                  disabled={actionDisabled('edit', status)}
                                />
                                <ActionButton
                                  Icon={IconCoin}
                                  tooltip="Valores"
                                  disabled={actionDisabled('values', status)}
                                />
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-gray-50 border-0">
                          <TableCell className="pl-14 py-0">
                            <AccordionContent className="flex items-center gap-3 py-5 font-medium text-gray-600">
                              <FeaturedIcon
                                Icon={IconBulb}
                                size="sm"
                                variant="neutralLight"
                              />
                              {item?.product?.name}
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0">
                            <AccordionContent className="py-4">
                              <Badge variant="blueLight">
                                {/* {item?.product?.unitOfMeasure || '-'} */}
                              </Badge>
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0 text-sm text-gray">
                            <AccordionContent className="py-4">
                              {item?.product?.quantity || '-'}
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0 text-sm text-gray">
                            <AccordionContent className="py-4">
                              {formatCurrencyToBrl(item?.product?.unitValue)}
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0 text-sm text-gray">
                            <AccordionContent className="py-4">
                              -
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0 text-sm text-gray">
                            <AccordionContent className="py-4">
                              {formatCurrencyToBrl(item?.product?.finalValue)}
                            </AccordionContent>
                          </TableCell>
                          <TableCell className="py-0 text-sm text-gray">
                            <AccordionContent className="py-4"></AccordionContent>
                          </TableCell>
                        </TableRow>
                        {item?.product?.compositions?.length
                          ? item?.product?.compositions?.map(
                              (composition: any, index: any) => (
                                <Fragment key={composition?.id}>
                                  <TableRow
                                    className={cn(
                                      item?.product?.compositions?.length ===
                                        index + 1
                                        ? 'border-b'
                                        : 'border-0',
                                      'bg-gray-50 ',
                                    )}
                                  >
                                    <TableCell className="pl-14 py-0">
                                      <AccordionContent className="flex items-center gap-4 py-6 text-sm text-gray-600">
                                        <IconCornerDownRight className="size-4 ml-3 text-gray-400" />
                                        {composition?.name}
                                      </AccordionContent>
                                    </TableCell>
                                    <TableCell className="py-0 text-sm text-gray">
                                      <AccordionContent className="py-4">
                                        <Badge variant="blueLight">
                                          {/* {composition?.unitOfMeasure || '-'} */}
                                        </Badge>
                                      </AccordionContent>
                                    </TableCell>
                                    <TableCell className="py-0 text-sm text-gray">
                                      <AccordionContent className="py-4">
                                        {composition?.quantity}
                                      </AccordionContent>
                                    </TableCell>
                                    <TableCell className="py-0 text-sm text-gray">
                                      <AccordionContent className="py-4">
                                        {formatCurrencyToBrl(
                                          composition?.unitValue,
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
                  ),
                )}
              </TableBody>
            </Table>
          </Accordion>
        </CardContent>
        <CardFooter className="justify-center p-0">
          <Button
            type="button"
            variant="none"
            className="flex justify-center items-center h-full w-full gap-3 py-8"
            disabled={true}
          >
            <FeaturedIcon
              variant="neutralLight"
              Icon={IconCirclePlus}
              rounded
            />
            <p className="text-sm text-gray-600 font-medium">Adicionar item</p>
          </Button>
        </CardFooter>
      </Card>
      <ItemNotesDialog
        open={openDialog === 'notes'}
        setOpen={setOpenDialog}
        quotationData={data.quotation}
        rowData={rowData}
        orderId={data.id}
      />
      <ItemImageDialog
        open={openDialog === 'image'}
        setOpen={setOpenDialog}
        quotationData={data.quotation}
        rowData={rowData}
      />
    </>
  )
}
