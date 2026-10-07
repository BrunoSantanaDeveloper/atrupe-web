// React
import { useEffect, useState } from 'react'
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
import { MaterialItemDialog } from '../../components/QuotationItems/MaterialItemDialog'
import { QuotationComposeModal } from '../../components/QuotationItems/QuotationComposeModal'
import { QuotationProdDetailModal } from '../../components/QuotationItems/QuotationProdDetailModal'

// Icons
import {
  IconSearch,
  IconCopy,
  IconCurrencyReal,
  IconChevronRight,
  IconPhoto,
  IconTrash,
  IconPencil,
  IconMessage,
  IconPlus,
  IconLayoutGrid,
  IconAlertTriangle,
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
  calculateItemDisplayUnitValue,
  generateFormattedQuantityDetails,
} from '@/lib/quotation-display-utils'

// Actions
import { createItem } from '@/actions/_cruds'
import {
  getItemLines,
  removeItemLine,
  getComposedItems,
  getItemCompositions,
  removeComposedItem,
} from '@/actions/quotation-composition'
import { AddToItem } from './AddToItem'
import {
  CompositionReport,
  type ReportTarget,
} from '../composicao/components/CompositionReport'
import type { ComposedItemSummary } from '../composicao/types'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { useAlertDialog } from '@/store/useAlertDialog'
import { useInactiveQuotationItems } from '@/hooks/queries/useInactiveQuotationItems'

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

    openChangeModal(true, 'productsList')
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
  const [materialTarget, setMaterialTarget] =
    useState<ComposedItemSummary | null>(null)

  // Produto inativado depois de lançado (PAD-7): o item fica marcado, o bloco
  // avisa e a aprovação é travada até trocar ou retirar o item
  const { inactiveItems, isItemInactive } = useInactiveQuotationItems(data)
  const { data: composedRes } = useQuery({
    queryKey: ['composed-items', data?.id],
    queryFn: () => getComposedItems({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const composed = composedRes?.data || []

  // O que foi acrescentado dentro de cada item (ORC-5). Provisório, no mock,
  // até a API guardar as linhas no item (backend-pendente.md)
  const { data: linesRes } = useQuery({
    queryKey: ['quotation-item-lines', data?.id],
    queryFn: () => getItemLines({ quotationId: String(data?.id) }),
    enabled: !!data?.id,
  })
  const linesOf = (item: QuotationItemType) => linesRes?.data?.[item.id] || []
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const removeLine = (item: QuotationItemType, lineId: string, name: string) =>
    alertDialog.open({
      title: `Retirar ${name}?`,
      description: `Sai de ${item.description}.`,
      confirmLabel: 'Retirar',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeItemLine({
          quotationId: String(data?.id),
          itemId: item.id,
          lineId,
        })
        if (!res.success) throw new Error(res.message)
        queryClient.invalidateQueries({ queryKey: ['quotation-item-lines'] })
      },
      toastMsg: { success: 'Retirado do item', error: 'Erro ao retirar' },
    })

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
          {inactiveItems.length > 0 && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-lg border border-warning-300 bg-warning-50 px-4 py-3 text-sm text-warning-700"
            >
              <IconAlertTriangle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">
                  {inactiveItems.length === 1
                    ? 'Um item tem produto inativado'
                    : `${inactiveItems.length} itens têm produto inativado`}
                  . O orçamento não pode ser aprovado até o item ser trocado ou
                  retirado.
                </p>
                <p className="text-warning-600">
                  {inactiveItems.map((item) => item.description).join(' · ')}
                </p>
              </div>
            </div>
          )}
          {items?.length || composed.length ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="min-w-[300px]">Referência</TableHead>
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
                {/* Todo item abre (05/10/2026, levantamento do legado):
                      fechado, a linha tem só editar, valores e excluir;
                      aberto, mostra as partes com o valor de cada uma, as
                      escolhas da venda e as ações de apoio (observações,
                      imagem, duplicar) */}
                {items?.map((item, index) => {
                  const key = item?.id + index
                  const open = !!accordionValue?.includes(key)
                  const parts = item.product?.compositions || []
                  const single = parts.length === 1 ? parts[0] : null
                  const chosen = compositionOf(item)
                  const added = linesOf(item)
                  const addedTotal = added.reduce(
                    (sum, line) => sum + line.price,
                    0,
                  )
                  const discount = Math.max(
                    0,
                    item?.totalValue - item?.finalValue,
                  )
                  // A diferença para mais é valor agregado (ALT-25): fica
                  // embutida no valor do item e só aparece na tela interna
                  const surcharge = Math.max(
                    0,
                    item?.finalValue - item?.totalValue,
                  )
                  const toggle = () =>
                    setAccordionValue((current = []) =>
                      current.includes(key)
                        ? current.filter((value) => value !== key)
                        : [...current, key],
                    )

                  return (
                    <TableBody key={key} className="[&_tr:last-child]:border-b">
                      <TableRow
                        className={cn(open ? 'bg-gray-50' : 'border-b')}
                      >
                        <TableCell className="py-4 text-sm font-medium">
                          <button
                            type="button"
                            onClick={toggle}
                            aria-expanded={open}
                            className="flex items-center gap-3 text-left"
                          >
                            <IconChevronRight
                              className={cn(
                                'size-5 shrink-0 text-gray transition-transform',
                                open && 'rotate-90',
                              )}
                              aria-hidden="true"
                            />
                            <span>{item?.description || '-'}</span>
                            {isItemInactive(item) && (
                              <Badge status variant="warningLight">
                                Produto inativo
                              </Badge>
                            )}
                            {item?.notes ? (
                              <IconMessage
                                className="size-4 shrink-0 text-warning-600"
                                aria-label="Tem observações"
                              />
                            ) : null}
                          </button>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray">
                          {item.product?.quantity || 1}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray">
                          {single
                            ? generateFormattedQuantityDetails(single)
                            : `${parts.length} partes`}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray text-nowrap">
                          {single
                            ? calculateTotalQuantity(
                                item.product.quantity,
                                single,
                              ).formatted
                            : `${item?.product?.quantity || 1} un`}
                        </TableCell>
                        <PermissionGate permissions={['values:values:view']}>
                          <TableCell className="py-4 text-sm text-gray">
                            {formatCurrencyToBrl(
                              single
                                ? calculateItemDisplayUnitValue(item, single)
                                : item?.totalValue /
                                    (item?.product?.quantity || 1),
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-warning-600 text-nowrap">
                            {discount > 0 ? (
                              `-${formatCurrencyToBrl(discount)}`
                            ) : surcharge > 0 ? (
                              <span
                                className="text-success-700"
                                title="Valor agregado: diferença para mais sobre o preço base"
                              >
                                +{formatCurrencyToBrl(surcharge)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-sm text-gray">
                            {formatCurrencyToBrl(item?.finalValue)}
                            {addedTotal > 0 && (
                              <span className="block text-xs text-brand-700">
                                + {formatCurrencyToBrl(addedTotal)} acrescentado
                              </span>
                            )}
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
                                    setRowData(item)
                                    openChangeModal(true, 'productDetailEdit')
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
                                  Icon={IconCurrencyReal}
                                  tooltip="Valores, desconto e acréscimo"
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
                                  Icon={IconTrash}
                                  variant="errorGhost"
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

                      {open && (
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={8} className="px-6 pb-5 pt-0">
                            <div className="ml-2 space-y-3 border-l-2 border-gray-200 pl-5">
                              {/* As partes do item, no formato do legado:
                                    nome · dados informados · valor */}
                              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
                                {parts.map((part) => (
                                  <li
                                    key={part.id}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
                                  >
                                    <span className="font-medium text-gray-800">
                                      {part.name}
                                    </span>
                                    <span className="text-gray">
                                      {generateFormattedQuantityDetails(part)}
                                    </span>
                                    <span className="text-gray">
                                      {
                                        calculateTotalQuantity(
                                          item.product.quantity,
                                          part,
                                        ).formatted
                                      }
                                    </span>
                                    <PermissionGate
                                      permissions={['values:values:view']}
                                    >
                                      <span className="ml-auto font-medium text-gray-800">
                                        {formatCurrencyToBrl(part.totalValue)}
                                      </span>
                                    </PermissionGate>
                                  </li>
                                ))}
                                {added.map((line) => (
                                  <li
                                    key={line.id}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
                                  >
                                    <Badge
                                      variant={
                                        line.kind === 'LOOSE'
                                          ? 'warningLight'
                                          : line.kind === 'PART'
                                            ? 'successLight'
                                            : 'blueLight'
                                      }
                                    >
                                      {line.kind === 'LOOSE'
                                        ? 'Terceirizado'
                                        : line.kind === 'PART'
                                          ? 'Item pronto'
                                          : line.sector || 'Processo'}
                                    </Badge>
                                    <span className="font-medium text-gray-800">
                                      {line.name}
                                    </span>
                                    {line.tags.map((tag) => (
                                      <span key={tag} className="text-gray">
                                        {tag}
                                      </span>
                                    ))}
                                    {/* Se a linha acompanha a medida do item
                                        ou tem medida própria (05/10/2026):
                                        decide o que é recalculado ao mudar
                                        o item */}
                                    {line.followsBase !== undefined && (
                                      <span
                                        className="text-xs text-gray"
                                        title={
                                          line.followsBase
                                            ? 'Recalculada quando a medida do item muda'
                                            : 'Fica como está quando a medida do item muda'
                                        }
                                      >
                                        {line.followsBase
                                          ? 'acompanha a base'
                                          : 'medida própria'}
                                      </span>
                                    )}
                                    <PermissionGate
                                      permissions={['values:values:view']}
                                    >
                                      <span className="ml-auto font-medium text-gray-800">
                                        {formatCurrencyToBrl(line.price)}
                                      </span>
                                    </PermissionGate>
                                    <PermissionGate
                                      permissions={['sale:quotation:edit']}
                                    >
                                      <TooltipProvider>
                                        <ActionButton
                                          Icon={IconTrash}
                                          variant="errorGhost"
                                          size="iconSm"
                                          tooltip={`Retirar ${line.name}`}
                                          onClick={() =>
                                            removeLine(item, line.id, line.name)
                                          }
                                          disabled={actionDisabled(
                                            'edit',
                                            status,
                                          )}
                                        />
                                      </TooltipProvider>
                                    </PermissionGate>
                                  </li>
                                ))}
                              </ul>

                              {addedTotal > 0 && (
                                <p className="text-xs text-gray">
                                  O que foi acrescentado ainda não soma no total
                                  do orçamento nem nas condições de pagamento.
                                </p>
                              )}

                              {addingTo === item.id && (
                                <AddToItem
                                  quotationId={String(data?.id)}
                                  itemId={item.id}
                                  itemName={item.description}
                                  measure={{
                                    quantity: item.product?.quantity || 1,
                                    width: single?.width
                                      ? single.width / 1000
                                      : 1,
                                    height: single?.height
                                      ? single.height / 1000
                                      : 1,
                                  }}
                                  onClose={() => setAddingTo(null)}
                                />
                              )}

                              {chosen?.summary?.length ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  {chosen.summary.map((entry) => (
                                    <Badge key={entry} variant="neutralLight">
                                      {entry}
                                    </Badge>
                                  ))}
                                  <FeatureGate
                                    features={[
                                      FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
                                    ]}
                                  >
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="link"
                                      LeftIcon={IconSearch}
                                      onClick={() =>
                                        setReport(reportTarget(item))
                                      }
                                    >
                                      Ver a composição completa
                                    </Button>
                                  </FeatureGate>
                                </div>
                              ) : null}

                              {item?.notes ? (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">
                                    Observações:
                                  </span>{' '}
                                  {item.notes}
                                </p>
                              ) : null}

                              <div className="flex flex-wrap gap-2">
                                {addingTo !== item.id && (
                                  <FeatureGate
                                    features={[
                                      FEATURES.PRODUCTS.PRODUCT_COMPOSITION,
                                    ]}
                                  >
                                    <PermissionGate
                                      permissions={['sale:quotation:edit']}
                                    >
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="light"
                                        LeftIcon={IconPlus}
                                        onClick={() => setAddingTo(item.id)}
                                        disabled={actionDisabled(
                                          'edit',
                                          status,
                                        )}
                                      >
                                        Acrescentar a este item
                                      </Button>
                                    </PermissionGate>
                                  </FeatureGate>
                                )}
                                <PermissionGate
                                  permissions={['sale:quotation:edit']}
                                >
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="neutralOutline"
                                    LeftIcon={IconMessage}
                                    onClick={() => {
                                      setOpenDialog('notes')
                                      setRowData(item)
                                    }}
                                    disabled={actionDisabled('notes', status)}
                                  >
                                    Observações
                                  </Button>
                                </PermissionGate>
                                <PermissionGate
                                  permissions={['sale:quotation:view']}
                                >
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="neutralOutline"
                                    LeftIcon={IconPhoto}
                                    onClick={() => {
                                      setOpenDialog('image')
                                      setRowData(item)
                                    }}
                                    disabled={actionDisabled('image', status)}
                                  >
                                    Imagem
                                  </Button>
                                </PermissionGate>
                                <PermissionGate
                                  permissions={['sale:quotation:create']}
                                >
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="neutralOutline"
                                    LeftIcon={IconCopy}
                                    onClick={() => handleDuplicateItem(item)}
                                    disabled={actionDisabled(
                                      'duplicate',
                                      status,
                                    )}
                                  >
                                    Duplicar
                                  </Button>
                                </PermissionGate>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
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
                          {item.origin === 'MATERIAL' ? (
                            <Badge variant="warningLight">Material</Badge>
                          ) : (
                            <Badge variant="blueLight">Composição</Badge>
                          )}
                          {item.attention && (
                            <Badge status variant="warningLight">
                              Exige atenção
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-normal text-gray">
                          {item.attention
                            ? 'Sem nenhuma etapa. O orçamento segue, mas monte as etapas depois para ter custo e produção.'
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
                        {item.quantity} {item.unit || 'un'}
                      </TableCell>
                      <PermissionGate permissions={['values:values:view']}>
                        <TableCell className="py-4 text-sm text-gray">
                          {formatCurrencyToBrl(
                            item.unitPrice ??
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
                                  if (item.origin === 'MATERIAL') {
                                    setMaterialTarget(item)
                                    openChangeModal(true, 'materialItem')
                                    return
                                  }
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
              onClick={() => openChangeModal(true, 'productsList')}
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
      {/* Modal de adicionar item: busca primeiro, setores como filtro (ORC-1) */}
      <QuotationItemsModal open={modalType === 'productsList'} />
      {/* O material de venda direta (ORG-1): criar e editar a quantidade */}
      <MaterialItemDialog
        open={modalType === 'materialItem'}
        quotationId={String(data?.id)}
        editing={materialTarget}
        onClose={() => {
          openChangeModal(false)
          setMaterialTarget(null)
        }}
      />
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
