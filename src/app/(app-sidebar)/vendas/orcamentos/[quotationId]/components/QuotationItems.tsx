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
import { ValuesDialog } from './ItemActions/Values'
import { ItemNotesDialog } from './ItemActions/Notes'
import { ItemImageDialog } from './ItemActions/Image'
import { DeleteItemDialog } from './ItemActions/Delete'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import QuotationItemsModal from '../../components/QuotationItems/QuotationItemsModal'
import { QuotationProdDetailModal } from '../../components/QuotationItems/QuotationProdDetailModal'
import { QuotationCategorySelectorModal } from '../../components/QuotationItems/QuotationCategorySelectorModal'

// Icons
import {
  IconCopy,
  IconCoin,
  IconBulb,
  IconPhoto,
  IconTrashX,
  IconPencil,
  IconMessage,
  IconCirclePlus,
  IconLayoutGrid,
  IconCornerDownRight,
} from '@tabler/icons-react'

// Type
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { type ModalType, useQuotation } from '@/contexts/quotationContext'

// Actions
import { createItem } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  data: QuotationType
}

export function QuotationItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<QuotationItemType>()
  const [accordionValue, setAccordionValue] = useState<string[]>()

  const { isModalOpen, openModal, closeModal, modalType } = useQuotation()
  const isModalOfType = (type: ModalType) => isModalOpen && modalType === type

  const status = data?.status

  const queryClient = useQueryClient()

  const mutationDuplicate = useMutation({
    mutationFn: (id: string) =>
      createItem({
        route: 'quotationRoute',
        customPath: `/duplicate-product/${id}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries()
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

  return (
    <>
      <QuotationCategorySelectorModal
        open={isModalOfType('sectorSelector')}
        onClose={closeModal}
        onSelect={() => openModal('productsList')}
      />
      <QuotationItemsModal
        open={isModalOfType('productsList')}
        onClose={closeModal}
      />
      <QuotationProdDetailModal
        open={isModalOfType('productDetail')}
        onClose={closeModal}
      />
      <QuotationProdDetailModal
        open={isModalOfType('productDetailEdit')}
        editMode={true}
        data={rowData}
        onClose={closeModal}
      />
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
                {data?.quotationItems?.map((item, index) => (
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
                          <Badge variant="blueLight">UN</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          {item?.product?.quantity || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          {formatCurrencyToBrl(item?.unitValue)}
                        </TableCell>
                        <TableCell className="text-warning-600 text-nowrap">
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
                                permissions={['sale:quotation:edit']}
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
                                permissions={['sale:quotation:view']}
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

                              <PermissionGate
                                permissions={['sale:quotation:create']}
                              >
                                <ActionButton
                                  Icon={IconCopy}
                                  tooltip="Duplicar item"
                                  onClick={() => handleDuplicateItem(item)}
                                  disabled={actionDisabled('duplicate', status)}
                                />
                              </PermissionGate>

                              <PermissionGate
                                permissions={['sale:quotation:edit']}
                              >
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip="Editar item"
                                  onClick={() => {
                                    setRowData(item)
                                    openModal('productDetailEdit')
                                  }}
                                  disabled={actionDisabled('edit', status)}
                                />
                              </PermissionGate>

                              <PermissionGate
                                permissions={['sale:quotation:edit']}
                              >
                                <ActionButton
                                  Icon={IconCoin}
                                  tooltip="Valores"
                                  onClick={() => {
                                    setOpenDialog('values')
                                    setRowData(item)
                                  }}
                                  disabled={actionDisabled('values', status)}
                                />
                              </PermissionGate>

                              <PermissionGate
                                permissions={['sale:quotation:delete']}
                              >
                                <ActionButton
                                  Icon={IconTrashX}
                                  tooltip="Excluir item"
                                  onClick={() => {
                                    setOpenDialog('delete')
                                    setRowData(item)
                                  }}
                                  disabled={actionDisabled('delete', status)}
                                />
                              </PermissionGate>
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
                            <Badge variant="blueLight">UN</Badge>
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
                            (composition, index) => (
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
                                        {composition?.unitOfMeasure?.code ||
                                          '-'}
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
                ))}
              </TableBody>
            </Table>
          </Accordion>
        </CardContent>
        <CardFooter className="justify-center p-0">
          <PermissionGate permissions={['sale:quotation:edit']}>
            <Button
              type="button"
              variant="none"
              className="flex justify-center items-center h-full w-full gap-3 py-8 disabled:bg-transparent disabled:opacity-50"
              onClick={() => openModal('sectorSelector')}
              disabled={actionDisabled('addItem', status)}
            >
              <FeaturedIcon
                variant={
                  actionDisabled('addItem', status) ? 'neutralLight' : 'light'
                }
                Icon={IconCirclePlus}
                rounded
              />
              <p className="text-sm text-gray-600 font-medium">
                Adicionar item
              </p>
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
      <ItemNotesDialog
        open={openDialog === 'notes'}
        setOpen={setOpenDialog}
        quotationData={data}
        rowData={rowData}
      />
      <ItemImageDialog
        open={openDialog === 'image'}
        setOpen={setOpenDialog}
        quotationData={data}
        rowData={rowData}
      />
      <ValuesDialog
        open={openDialog === 'values'}
        setOpen={setOpenDialog}
        quotationData={data}
        rowData={rowData}
      />
      <DeleteItemDialog
        open={openDialog === 'delete'}
        setOpen={setOpenDialog}
        quotationData={data}
        rowData={rowData}
      />
    </>
  )
}
