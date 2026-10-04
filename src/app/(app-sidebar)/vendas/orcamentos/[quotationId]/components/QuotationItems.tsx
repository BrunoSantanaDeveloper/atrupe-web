// React
import { Fragment, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

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
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { ValuesDialog } from './ItemActions/Values'
import { ItemNotesDialog } from './ItemActions/Notes'
import { ItemImageDialog } from './ItemActions/Image'
import { DeleteItemDialog } from './ItemActions/Delete'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { QuotationItemsModal } from '../../components/QuotationItems/QuotationItemsModal'
import { QuotationComposeModal } from '../../components/QuotationItems/QuotationComposeModal'
import { QuotationProdDetailModal } from '../../components/QuotationItems/QuotationProdDetailModal'
import { QuotationCategorySelectorModal } from '../../components/QuotationItems/QuotationCategorySelectorModal'

// Icons
import {
  IconSearch,
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

// Type
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Third-party
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Libs
import { actionDisabled } from '@/lib/quotation'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { useQuotation } from '@/contexts/quotationContext'
import { QUOTATION_DATA_QUERY_KEY } from './Quotation'
import {
  calculateTotalQuantity,
  calculateDisplayUnitValue,
  calculateItemDisplayUnitValue,
  generateFormattedQuantityDetails,
} from '@/lib/quotation-display-utils'

// Actions
import { createItem } from '@/actions/_cruds'
import {
  getComposedItems,
  getItemCompositions,
  removeComposedItem,
} from '@/actions/quotation-composition'
import {
  CompositionReport,
  type ReportTarget,
} from '../composicao/components/CompositionReport'
import type { ComposedItemSummary } from '../composicao/types'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { useAlertDialog } from '@/store/useAlertDialog'

interface Props {
  data: QuotationType
}

export function QuotationItems({ data }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<QuotationItemType>()
  const [accordionValue, setAccordionValue] = useState<string[]>()

  const { openChangeModal, modalType } = useQuotation()

  const status = data?.status

  // VR-4: a venda rápida chega aqui com ?adicionar=1 e o primeiro gesto da
  // venda é escolher o que está sendo vendido — o modal já vem aberto. O
  // parâmetro sai da URL para o modal não reabrir ao recarregar a página
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const shouldOpenAdd = searchParams?.get('adicionar') === '1'

  useEffect(() => {
    if (!shouldOpenAdd || actionDisabled('addItem', status)) return

    openChangeModal(true, 'sectorSelector')
    router.replace(pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldOpenAdd, status])

  const queryClient = useQueryClient()

  // A composição que o vendedor escolheu em cada item (IP-36). Fica no mock
  // até a API guardar o campo no item (backend-pendente.md)
  const { data: compositionsRes } = useQuery({
    queryKey: ['quotation-item-compositions', data?.id],
    queryFn: () => getItemCompositions({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const [report, setReport] = useState<ReportTarget | null>(null)

  const compositionOf = (item: QuotationItemType) =>
    compositionsRes?.data?.[item.id] ||
    compositionsRes?.data?.[item.product?.originalProductId]

  // Os itens montados na hora (ORC-11) ficam no mock até a API guardar o
  // item sem produto. Chegam sem custo (ORC-7)
  const alertDialog = useAlertDialog()
  const [composeTarget, setComposeTarget] =
    useState<ComposedItemSummary | null>(null)
  const { data: composedRes } = useQuery({
    queryKey: ['composed-items', data?.id],
    queryFn: () => getComposedItems({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const composed = composedRes?.data || []

  const removeComposed = (item: ComposedItemSummary) =>
    alertDialog.open({
      title: `Excluir ${item.name}?`,
      description:
        'O item sai do orçamento. Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeComposedItem({
          quotationId: String(data?.id),
          itemId: item.id,
        })
        if (!res.success) throw new Error(res.message)
        queryClient.invalidateQueries({ queryKey: ['composed-items'] })
      },
      toastMsg: { success: 'Item excluído', error: 'Erro ao excluir o item' },
    })

  // A API guarda as medidas em milímetros; o relatório calcula em metros
  const reportTarget = (item: QuotationItemType): ReportTarget => {
    const first = item.product?.compositions?.[0]
    return {
      id: item.id,
      name: item.description,
      productId: item.product?.originalProductId,
      quantity: item.product?.quantity || 1,
      width: first?.width ? first.width / 1000 : 1,
      height: first?.height ? first.height / 1000 : 1,
      variation: null,
      composition: compositionOf(item),
    }
  }

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

  const items = data?.quotationItems

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
            <CardTitle className="text-gray-700 font-semibold text-base">
              Itens
            </CardTitle>
            <Badge variant="neutralLight" className="mt-1">
              {(items?.length || 0) + composed.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          {items?.length || composed.length ? (
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
                        <TableHead>Valor Final</TableHead>
                      </PermissionGate>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  {items?.map((item, index) => {
                    const isComposite = item.product.compositions.length > 1

                    // Renderização para produtos simples (apenas 1 composição)
                    if (
                      !isComposite &&
                      item.product.compositions.length === 1
                    ) {
                      const composition = item.product.compositions[0]

                      return (
                        <TableBody
                          key={item?.id + index}
                          className="[&_tr:last-child]:border-b"
                        >
                          {/* Linha única para produtos simples - dados da composição diretamente */}
                          <TableRow className="border-b">
                            <TableCell className="font-medium pl-14 flex items-center gap-4 py-6 text-sm">
                              {item?.description}
                            </TableCell>
                            <TableCell className="py-4 text-sm text-gray">
                              {item.product.quantity}
                            </TableCell>
                            <TableCell className="py-4 text-sm text-gray">
                              {generateFormattedQuantityDetails(composition)}
                            </TableCell>
                            <TableCell className="py-4 text-sm text-gray text-nowrap">
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
                                  {compositionOf(item) && (
                                    <FeatureGate
                                      features={[
                                        FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
                                      ]}
                                    >
                                      <ActionButton
                                        Icon={IconSearch}
                                        tooltip="Ver a composição completa"
                                        onClick={() =>
                                          setReport(reportTarget(item))
                                        }
                                      />
                                    </FeatureGate>
                                  )}
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
                                      disabled={actionDisabled(
                                        'duplicate',
                                        status,
                                      )}
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
                                        openChangeModal(
                                          true,
                                          'productDetailEdit',
                                        )
                                      }}
                                      disabled={actionDisabled('edit', status)}
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={[
                                      'sale:quotation:edit',
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
                                    permissions={['sale:quotation:delete']}
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
                        </TableBody>
                      )
                    }

                    // Renderização para produtos compostos
                    return (
                      <AccordionItem
                        asChild
                        key={item?.id + index}
                        value={item?.id + index}
                      >
                        <TableBody className="[&_tr:last-child]:border-b">
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
                                      disabled={actionDisabled(
                                        'duplicate',
                                        status,
                                      )}
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
                                        openChangeModal(
                                          true,
                                          'productDetailEdit',
                                        )
                                      }}
                                      disabled={actionDisabled('edit', status)}
                                    />
                                  </PermissionGate>
                                  <PermissionGate
                                    permissions={[
                                      'sale:quotation:edit',
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
                                    permissions={['sale:quotation:delete']}
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
                        </TableBody>
                      </AccordionItem>
                    )
                  })}

                  {/* Os itens montados na hora (ORC-11). O tipo fica
                      discreto, como marcação (ORC-3); sem etapa, "Exige
                      atenção" (MS-12) */}
                  {composed.map((item) => (
                    <TableBody
                      key={item.id}
                      className="[&_tr:last-child]:border-b"
                    >
                      <TableRow className="border-b">
                        <TableCell className="pl-14 py-6 text-sm font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{item.name}</span>
                            <Badge variant="blueLight">Composição</Badge>
                            {item.attention && (
                              <Badge status variant="warningLight">
                                Exige atenção
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs font-normal text-gray">
                            {item.attention
                              ? 'Sem nenhuma etapa. Monte as etapas ou exclua o item para concluir o orçamento.'
                              : item.description ||
                                `${item.stages} ${item.stages === 1 ? 'etapa' : 'etapas'} · ${item.sectors.join(', ')}`}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray">
                          {item.width && item.height
                            ? `${item.width} x ${item.height} m`.replace(
                                /\./g,
                                ',',
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray text-nowrap">
                          {item.quantity} un
                        </TableCell>
                        <PermissionGate permissions={['values:values:view']}>
                          <TableCell className="py-4 text-sm text-gray">
                            {formatCurrencyToBrl(
                              Math.round(item.price / (item.quantity || 1)),
                            )}
                          </TableCell>
                          <TableCell className="text-warning-600 text-nowrap py-4">
                            -
                          </TableCell>
                          <TableCell className="py-4 text-sm text-gray">
                            {formatCurrencyToBrl(item.price)}
                          </TableCell>
                        </PermissionGate>
                        <TableCell className="py-4">
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              <PermissionGate
                                permissions={['sale:quotation:edit']}
                              >
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip="Editar item"
                                  onClick={() => {
                                    setComposeTarget(item)
                                    openChangeModal(true, 'composeItem')
                                  }}
                                  disabled={actionDisabled('edit', status)}
                                />
                              </PermissionGate>
                              <PermissionGate
                                permissions={['sale:quotation:delete']}
                              >
                                <ActionButton
                                  Icon={IconTrash}
                                  tooltip="Excluir item"
                                  onClick={() => removeComposed(item)}
                                  disabled={actionDisabled('delete', status)}
                                />
                              </PermissionGate>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ))}
                </Table>
              </Accordion>

              {/* Modal de ações do item */}
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
          ) : (
            <Separator />
          )}
        </CardContent>
        <CardFooter className="justify-center p-0">
          <PermissionGate permissions={['sale:quotation:edit']}>
            <Button
              type="button"
              variant="none"
              className="flex justify-center items-center h-full w-full gap-3 py-8 disabled:bg-transparent disabled:opacity-50"
              onClick={() => openChangeModal(true, 'sectorSelector')}
              disabled={actionDisabled('addItem', status)}
            >
              <FeaturedIcon
                variant={
                  actionDisabled('addItem', status) ? 'neutralLight' : 'light'
                }
                Icon={IconPlus}
                rounded
              />
              <p className="text-sm text-gray-600 font-medium">
                Adicionar item
              </p>
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
      {/* Modal de adicionar item */}
      <QuotationCategorySelectorModal
        open={modalType === 'sectorSelector'}
        onSelect={() => openChangeModal(true, 'productsList')}
      />
      <QuotationItemsModal open={modalType === 'productsList'} />
      <QuotationProdDetailModal open={modalType === 'productDetail'} />
      <QuotationProdDetailModal
        open={modalType === 'productDetailEdit'}
        editMode={true}
        data={rowData}
        composition={rowData ? compositionOf(rowData) : undefined}
      />
      {/* O item montado na hora (ORC-11): criar e editar com o mesmo modal */}
      <QuotationComposeModal
        open={modalType === 'composeItem'}
        quotationId={String(data?.id)}
        editing={composeTarget}
        onClose={() => {
          openChangeModal(false)
          setComposeTarget(null)
        }}
      />
      <CompositionReport item={report} onOpenChange={() => setReport(null)} />
    </>
  )
}
