'use client'

// Os pedidos de compra (ES-13, ES-15; 22/11/2026), como na primeira versão:
// entrega pendente → conferência → finalizado. O pedido nasce das cotações
// fechadas nas Solicitações ou direto aqui. Na conferência, o que chegou de
// cada item e a nota do fornecedor; ao lançar no estoque, os lotes (rolos,
// chapas); e as contas a pagar em parcelas.

// React
import { useState } from 'react'
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import {
  brDate,
  qty,
  toCents,
  toNumber,
  Timeline,
  MaterialPicker,
  SupplierField,
  measureOptions,
  orderStatusObj,
  type MaterialChoice,
  type SupplierChoice,
} from './shared'

// Actions
import {
  cancelPurchaseOrder,
  checkPurchaseOrder,
  createOrderPayables,
  createPurchaseOrder,
  deliverPurchaseOrder,
  getOrderInvoices,
  getPurchaseOrders,
  receivePurchaseOrder,
} from '@/actions/purchasing'

// Types
import type { LotMeasure, LotPlan, PurchaseOrder } from '../types'

// Hooks
import { useMoney } from '@/hooks/useMoney'
import { usePermissions } from '@/hooks/usePermissions'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

const tabs = [
  { value: 'PENDING_DELIVERY', label: 'Entrega pendente' },
  { value: 'CHECKING', label: 'Conferência' },
  { value: 'FINISHED', label: 'Finalizados' },
  { value: 'CANCELED', label: 'Cancelados' },
  { value: '', label: 'Todos' },
]

export function Purchases() {
  const money = useMoney()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('PENDING_DELIVERY')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', search],
    queryFn: () => getPurchaseOrders({ search }),
  })
  const all = data?.data || []
  const rows = tab ? all.filter((row) => row.status === tab) : all
  const open = all.find((row) => row.id === openId) || null
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
    queryClient.invalidateQueries({ queryKey: ['stock-lots'] })
    queryClient.invalidateQueries({ queryKey: ['stock-items'] })
  }
  const countOf = (status: string) =>
    status ? all.filter((row) => row.status === status).length : all.length

  return (
    <div className="space-y-5">
      <Topbar
        title="Compras"
        supportText="Os pedidos de compra: entrega, conferência com a nota, entrada no estoque com os lotes e as contas a pagar."
        primaryCta={
          <div className="flex gap-2">
            <Button variant="neutralOutline" asChild>
              <Link href="/estoque/solicitacoes">Solicitações</Link>
            </Button>
            <PermissionGate permissions={['stock:purchase:edit']}>
              <Button LeftIcon={IconPlus} onClick={() => setCreating(true)}>
                Novo pedido
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {tabs.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label} ({countOf(item.value)})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              aria-label="Buscar"
              placeholder="Fornecedor ou material"
              className="w-[240px]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Entrega prevista</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={6} />
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setOpenId(row.id)}
                  >
                    <TableCell>
                      {row.number}
                      <span className="block text-xs text-gray">
                        {brDate(row.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {row.supplierName}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      {row.items.map((item) => item.description).join(', ')}
                    </TableCell>
                    <TableCell>{brDate(row.expectedAt)}</TableCell>
                    <TableCell>{money(row.total)}</TableCell>
                    <TableCell>
                      <Badge variant={orderStatusObj[row.status].variant}>
                        {orderStatusObj[row.status].text}
                      </Badge>
                      {row.payableId && (
                        <span className="block text-xs text-gray">
                          contas a pagar geradas
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray">
                    Nenhum pedido aqui.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewOrderDialog
        open={creating}
        onOpenChange={setCreating}
        onDone={refresh}
      />
      <OrderDialog
        order={open}
        onOpenChange={() => setOpenId(null)}
        onDone={refresh}
      />
    </div>
  )
}

type DraftItem = {
  key: number
  material: MaterialChoice | null
  description: string
  unit: string
  quantity: string
  price: string
}

const emptyItem = (key: number): DraftItem => ({
  key,
  material: null,
  description: '',
  unit: '',
  quantity: '',
  price: '',
})

function NewOrderDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const money = useMoney()
  const [supplier, setSupplier] = useState<SupplierChoice>({
    supplierId: null,
    supplierName: '',
  })
  const [expectedAt, setExpectedAt] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<DraftItem[]>([emptyItem(1)])
  const [saving, setSaving] = useState(false)

  const update = (key: number, patch: Partial<DraftItem>) =>
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  const total = items.reduce(
    (sum, item) =>
      sum + Math.round(toCents(item.price) * toNumber(item.quantity)),
    0,
  )
  const valid =
    (supplier.supplierId || supplier.supplierName.trim()) &&
    items.every(
      (item) =>
        (item.material || item.description.trim()) &&
        toNumber(item.quantity) > 0 &&
        item.price,
    )

  const save = async () => {
    setSaving(true)
    const res = await createPurchaseOrder({
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      expectedAt: expectedAt || null,
      note: note || null,
      items: items.map((item) => ({
        materialId: item.material?.materialId ?? null,
        variationId: item.material?.variationId ?? null,
        description: item.material ? undefined : item.description,
        unit: item.material ? undefined : item.unit,
        quantity: toNumber(item.quantity),
        unitPrice: toCents(item.price),
      })),
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setSupplier({ supplierId: null, supplierName: '' })
    setExpectedAt('')
    setNote('')
    setItems([emptyItem(1)])
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Novo pedido de compra</DialogTitle>
          <DialogDescription>
            O pedido direto, sem passar pela solicitação e pela cotação.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <SupplierField value={supplier} onChange={setSupplier} />
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.key}
                className="grid grid-cols-1 items-end gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <div className="space-y-2">
                  <MaterialPicker
                    label={`Item ${index + 1}`}
                    value={item.material}
                    onChange={(material) => update(item.key, { material })}
                  />
                  {!item.material && (
                    <div className="grid grid-cols-[2fr_1fr] gap-2">
                      <Input
                        aria-label="Descrição"
                        placeholder="Ou descreva o item"
                        value={item.description}
                        onChange={(event) =>
                          update(item.key, { description: event.target.value })
                        }
                      />
                      <Input
                        aria-label="Unidade"
                        placeholder="un"
                        value={item.unit}
                        onChange={(event) =>
                          update(item.key, { unit: event.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`item-qty-${item.key}`}>Quantidade</Label>
                  <Input
                    id={`item-qty-${item.key}`}
                    inputMode="decimal"
                    value={item.quantity}
                    onChange={(event) =>
                      update(item.key, { quantity: event.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`item-price-${item.key}`}>
                    Preço unitário
                  </Label>
                  <Input
                    id={`item-price-${item.key}`}
                    inputMode="decimal"
                    placeholder="0,00"
                    value={item.price}
                    onChange={(event) =>
                      update(item.key, { price: event.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={items.length === 1}
                  onClick={() =>
                    setItems((current) =>
                      current.filter((row) => row.key !== item.key),
                    )
                  }
                >
                  <Icon icon={IconTrash} size="sm" label="Tirar o item" />
                </Button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="link"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    emptyItem(Math.max(...current.map((row) => row.key)) + 1),
                  ])
                }
              >
                Mais um item
              </Button>
              <span className="text-sm font-medium text-gray-900">
                Total {money(total)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="order-expected">Entrega prevista</Label>
              <Input
                id="order-expected"
                type="date"
                value={expectedAt}
                onChange={(event) => setExpectedAt(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="order-note">Observação</Label>
              <Input
                id="order-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button isLoading={saving} disabled={!valid} onClick={save}>
            Fazer pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LotDraft = {
  enabled: boolean
  measure: LotMeasure
  count: string
  width: string
  length: string
  brand: string
  color: string
}

function OrderDialog({
  order,
  onOpenChange,
  onDone,
}: {
  order: PurchaseOrder | null
  onOpenChange: () => void
  onDone: () => void
}) {
  const money = useMoney()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('stock:purchase:edit')
  const [received, setReceived] = useState<Record<string, string>>({})
  const [divergence, setDivergence] = useState<Record<string, string>>({})
  const [invoiceId, setInvoiceId] = useState<string>('')
  const [lots, setLots] = useState<Record<string, LotDraft>>({})
  const [installments, setInstallments] = useState('1')
  const [firstDue, setFirstDue] = useState('')
  const [everyDays, setEveryDays] = useState('30')
  const [cancelReason, setCancelReason] = useState('')
  const [canceling, setCanceling] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const { data: invoicesRes } = useQuery({
    queryKey: ['purchase-order-invoices', order?.id],
    queryFn: () => getOrderInvoices(order!.id),
    enabled: !!order && order.status === 'CHECKING' && canEdit,
  })
  const invoices = invoicesRes?.data || []

  if (!order) return null
  const linkedInvoice =
    invoices.find((invoice) => invoice.id === (invoiceId || order.invoiceId)) ??
    null

  const run = async (
    key: string,
    action: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(key)
    const res = await action()
    setBusy(null)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    onDone()
  }

  const lotOf = (itemId: string): LotDraft =>
    lots[itemId] ?? {
      enabled: false,
      measure: 'ROLL',
      count: '1',
      width: '',
      length: '',
      brand: '',
      color: '',
    }
  const setLot = (itemId: string, patch: Partial<LotDraft>) =>
    setLots((current) => ({
      ...current,
      [itemId]: { ...lotOf(itemId), ...patch },
    }))

  const lotPlans: LotPlan[] = order.items
    .filter((item) => item.materialId && lotOf(item.id).enabled)
    .map((item) => {
      const lot = lotOf(item.id)
      return {
        itemId: item.id,
        measure: lot.measure,
        count: Math.max(1, Number(lot.count) || 1),
        width: lot.measure === 'UNIT' ? null : toNumber(lot.width),
        length: lot.measure === 'UNIT' ? null : toNumber(lot.length),
        brand: lot.brand,
        color: lot.color,
      }
    })

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[880px]">
        <DialogHeader>
          <DialogTitle>
            Pedido de compra {order.number} · {order.supplierName}
          </DialogTitle>
          <DialogDescription>
            Feito por {order.createdByName} em {brDate(order.createdAt)}
            {order.expectedAt &&
              ` · entrega prevista ${brDate(order.expectedAt)}`}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={orderStatusObj[order.status].variant}>
              {orderStatusObj[order.status].text}
            </Badge>
            <span className="text-sm font-medium text-gray-900">
              Total {money(order.total)}
            </span>
            {order.note && (
              <span className="text-sm text-gray-700">{order.note}</span>
            )}
            {order.cancelReason && (
              <span className="text-sm text-gray-700">
                Motivo: {order.cancelReason}
              </span>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Chegou</TableHead>
                {order.status === 'CHECKING' && canEdit && (
                  <TableHead>Diferença</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-gray-900">
                    {item.description}
                    {!item.materialId && (
                      <span className="block text-xs text-warning-700">
                        sem material: não entra no estoque
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {qty(item.quantity)} {item.unit}
                  </TableCell>
                  <TableCell>
                    {money(item.unitPrice)}
                    <span className="block text-xs text-gray">
                      {money(item.total)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.status === 'CHECKING' && canEdit ? (
                      <Input
                        aria-label={`Chegou de ${item.description}`}
                        inputMode="decimal"
                        className="w-[110px]"
                        value={
                          received[item.id] ??
                          qty(item.receivedQuantity ?? item.quantity)
                        }
                        onChange={(event) =>
                          setReceived((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    ) : (
                      qty(item.receivedQuantity)
                    )}
                    {item.divergence && (
                      <span className="block text-xs text-warning-700">
                        {item.divergence}
                      </span>
                    )}
                  </TableCell>
                  {order.status === 'CHECKING' && canEdit && (
                    <TableCell>
                      <Input
                        aria-label={`Diferença de ${item.description}`}
                        placeholder="faltou, avariado…"
                        value={divergence[item.id] ?? item.divergence ?? ''}
                        onChange={(event) =>
                          setDivergence((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {canEdit && order.status === 'PENDING_DELIVERY' && (
            <Button
              isLoading={busy === 'deliver'}
              onClick={() =>
                run('deliver', () => deliverPurchaseOrder(order.id))
              }
            >
              Confirmar entrega
            </Button>
          )}

          {canEdit && order.status === 'CHECKING' && (
            <section className="space-y-4 rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                Conferência
                {order.checkedAt &&
                  ` · conferido por ${order.checkedByName} em ${brDate(order.checkedAt)}`}
              </p>
              <SelectBasic
                name="order-invoice"
                label="Nota do fornecedor (opcional)"
                placeholder="Sem nota"
                value={invoiceId || order.invoiceId || '__none'}
                options={[
                  { value: '__none', label: 'Sem nota' },
                  ...invoices.map((invoice) => ({
                    value: invoice.id,
                    label: `NF ${invoice.number} · ${brDate(invoice.issueDate)} · ${money(invoice.total)}`,
                  })),
                ]}
                onChange={(value) =>
                  setInvoiceId(String(value) === '__none' ? '' : String(value))
                }
              />
              {linkedInvoice && (
                <div className="rounded-lg bg-gray-25 p-3 text-sm">
                  <p className="mb-1 font-medium text-gray-900">
                    Itens da nota {linkedInvoice.number}
                  </p>
                  <ul className="space-y-0.5 text-gray-800">
                    {linkedInvoice.items.map((item, index) => (
                      <li key={index}>
                        {item.description}: {qty(item.quantity)} {item.unit} ×{' '}
                        {money(item.unitValue)}
                        {!item.materialId && (
                          <span className="text-warning-700">
                            {' '}
                            · sem vínculo com material (concilie na Entrada de
                            nota)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-gray">
                    Com a nota, a entrada no estoque é a dela (o custo real),
                    uma vez só.
                  </p>
                </div>
              )}
              <Button
                variant="neutralOutline"
                isLoading={busy === 'check'}
                onClick={() =>
                  run('check', () =>
                    checkPurchaseOrder(order.id, {
                      items: order.items.map((item) => ({
                        itemId: item.id,
                        receivedQuantity:
                          received[item.id] !== undefined
                            ? toNumber(received[item.id])
                            : (item.receivedQuantity ?? item.quantity),
                        divergence:
                          divergence[item.id] ?? item.divergence ?? null,
                      })),
                      invoiceId: invoiceId || order.invoiceId || null,
                    }),
                  )
                }
              >
                {order.checkedAt ? 'Conferir de novo' : 'Conferir'}
              </Button>

              {order.checkedAt && (
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-900">
                    Lançar no estoque
                  </p>
                  <p className="text-sm text-gray">
                    Marque os itens que chegam em rolos ou chapas para criar os
                    lotes, com as medidas de cada um.
                  </p>
                  {order.items
                    .filter((item) => item.materialId)
                    .map((item) => {
                      const lot = lotOf(item.id)
                      return (
                        <div
                          key={item.id}
                          className="space-y-2 rounded-lg border border-gray-100 p-3"
                        >
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={lot.enabled}
                              onChange={(event) =>
                                setLot(item.id, {
                                  enabled: event.target.checked,
                                })
                              }
                            />
                            Criar lotes de {item.description}
                          </label>
                          {lot.enabled && (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                              <SelectBasic
                                name={`lot-measure-${item.id}`}
                                label="Tipo"
                                className="col-span-2"
                                value={lot.measure}
                                options={measureOptions}
                                onChange={(value) =>
                                  setLot(item.id, {
                                    measure: String(value) as LotMeasure,
                                  })
                                }
                              />
                              <div className="flex flex-col gap-2">
                                <Label htmlFor={`lot-count-${item.id}`}>
                                  Quantos
                                </Label>
                                <Input
                                  id={`lot-count-${item.id}`}
                                  type="number"
                                  min={1}
                                  value={lot.count}
                                  onChange={(event) =>
                                    setLot(item.id, {
                                      count: event.target.value,
                                    })
                                  }
                                />
                              </div>
                              {lot.measure !== 'UNIT' && (
                                <>
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor={`lot-width-${item.id}`}>
                                      Largura (m)
                                    </Label>
                                    <Input
                                      id={`lot-width-${item.id}`}
                                      inputMode="decimal"
                                      value={lot.width}
                                      onChange={(event) =>
                                        setLot(item.id, {
                                          width: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Label htmlFor={`lot-length-${item.id}`}>
                                      {lot.measure === 'SHEET'
                                        ? 'Altura (m)'
                                        : 'Comprimento (m)'}
                                    </Label>
                                    <Input
                                      id={`lot-length-${item.id}`}
                                      inputMode="decimal"
                                      value={lot.length}
                                      onChange={(event) =>
                                        setLot(item.id, {
                                          length: event.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </>
                              )}
                              <div className="flex flex-col gap-2">
                                <Label htmlFor={`lot-color-${item.id}`}>
                                  Cor
                                </Label>
                                <Input
                                  id={`lot-color-${item.id}`}
                                  value={lot.color}
                                  onChange={(event) =>
                                    setLot(item.id, {
                                      color: event.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  <Button
                    isLoading={busy === 'receive'}
                    onClick={() =>
                      run('receive', () =>
                        receivePurchaseOrder(order.id, lotPlans),
                      )
                    }
                  >
                    Lançar no estoque
                  </Button>
                </div>
              )}
            </section>
          )}

          {canEdit && order.status !== 'CANCELED' && !order.payableId && (
            <section className="space-y-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                Contas a pagar
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payable-count">Parcelas</Label>
                  <Input
                    id="payable-count"
                    type="number"
                    min={1}
                    max={48}
                    value={installments}
                    onChange={(event) => setInstallments(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payable-first">Primeiro vencimento</Label>
                  <Input
                    id="payable-first"
                    type="date"
                    value={firstDue}
                    onChange={(event) => setFirstDue(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="payable-every">A cada (dias)</Label>
                  <Input
                    id="payable-every"
                    type="number"
                    min={1}
                    value={everyDays}
                    onChange={(event) => setEveryDays(event.target.value)}
                  />
                </div>
              </div>
              <Button
                variant="neutralOutline"
                isLoading={busy === 'payables'}
                disabled={!firstDue}
                onClick={() =>
                  run('payables', () =>
                    createOrderPayables(order.id, {
                      installments: Number(installments) || 1,
                      firstDue,
                      everyDays: Number(everyDays) || 30,
                    }),
                  )
                }
              >
                Gerar contas a pagar
              </Button>
            </section>
          )}

          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Linha do tempo</p>
            <Timeline events={order.events} />
          </section>

          {canEdit &&
            (order.status === 'PENDING_DELIVERY' ||
              order.status === 'CHECKING') &&
            (canceling ? (
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="order-cancel">Motivo do cancelamento</Label>
                  <Textarea
                    id="order-cancel"
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                  />
                </div>
                <Button
                  variant="errorOutline"
                  disabled={!cancelReason.trim()}
                  isLoading={busy === 'cancel'}
                  onClick={() =>
                    run('cancel', () =>
                      cancelPurchaseOrder(order.id, cancelReason),
                    )
                  }
                >
                  Cancelar pedido
                </Button>
              </div>
            ) : (
              <Button variant="link" onClick={() => setCanceling(true)}>
                Cancelar pedido
              </Button>
            ))}
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={onOpenChange}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
