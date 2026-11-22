'use client'

// As solicitações de material (ES-14, ES-17; 22/11/2026), como na primeira
// versão: quem produz pede, quem compra cota e fecha o pedido. A
// solicitação guarda quem pediu, o quê e quando, e a linha do tempo até a
// entrega, visível para quem pediu: tira a discussão do "eu pedi" do campo
// da memória.

// React
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
  requestStatusObj,
  type MaterialChoice,
  type SupplierChoice,
} from '../../compras/components/shared'

// Actions
import {
  addPurchaseQuote,
  cancelPurchaseRequest,
  closePurchaseOrder,
  createPurchaseRequest,
  getPurchaseRequests,
  removePurchaseQuote,
} from '@/actions/purchasing'

// Types
import type { PurchaseRequest } from '../../compras/types'

// Hooks
import { useMoney } from '@/hooks/useMoney'
import { usePermissions } from '@/hooks/usePermissions'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconShoppingCart } from '@tabler/icons-react'

const tabs = [
  { value: 'abertas', label: 'Abertas', status: ['REQUESTED', 'QUOTING'] },
  { value: 'pedido', label: 'Em pedido', status: ['ORDERED'] },
  { value: 'recebidas', label: 'Recebidas', status: ['RECEIVED'] },
  { value: 'canceladas', label: 'Canceladas', status: ['CANCELED'] },
  { value: 'todas', label: 'Todas', status: [] as string[] },
]

export function Requests() {
  const money = useMoney()
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canBuy = hasPermission('stock:purchase:edit')
  const [tab, setTab] = useState('abertas')
  const [mine, setMine] = useState(false)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  // A cotação escolhida de cada solicitação, para fechar o pedido
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [closing, setClosing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-requests', mine, search],
    queryFn: () => getPurchaseRequests({ mine, search }),
  })
  const all = data?.data || []
  const statuses = tabs.find((item) => item.value === tab)?.status ?? []
  const rows = statuses.length
    ? all.filter((row) => statuses.includes(row.status))
    : all
  const open = all.find((row) => row.id === openId) || null
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['purchase-requests'] })
  const chosenCount = Object.keys(chosen).length

  return (
    <div className="space-y-5">
      <Topbar
        title="Solicitações de material"
        supportText="Quem produz pede; quem compra cota e fecha o pedido. A linha do tempo fica à vista de quem pediu."
        primaryCta={
          <PermissionGate permissions={['stock:purchase_request:create']}>
            <Button LeftIcon={IconPlus} onClick={() => setCreating(true)}>
              Nova solicitação
            </Button>
          </PermissionGate>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {tabs.map((item) => (
                  <TabsTrigger key={item.value} value={item.value}>
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Input
              aria-label="Buscar"
              placeholder="Material ou quem pediu"
              className="w-[240px]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Switch checked={mine} onCheckedChange={setMine} />
              Só as minhas
            </label>
            {canBuy && chosenCount > 0 && (
              <Button
                className="ml-auto"
                LeftIcon={IconShoppingCart}
                onClick={() => setClosing(true)}
              >
                Fechar pedido ({chosenCount})
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Para quando</TableHead>
                <TableHead>Quem pediu</TableHead>
                <TableHead>Cotações</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={7} />
              ) : rows.length ? (
                rows.map((row) => {
                  const pick = row.quotes.find(
                    (quote) => quote.id === chosen[row.id],
                  )
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setOpenId(row.id)}
                    >
                      <TableCell>{row.number}</TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {row.description}
                      </TableCell>
                      <TableCell>
                        {qty(row.quantity)} {row.unit}
                      </TableCell>
                      <TableCell>{brDate(row.neededBy)}</TableCell>
                      <TableCell>
                        {row.requestedByName}
                        <span className="block text-xs text-gray">
                          {brDate(row.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.quotes.length}
                        {pick && (
                          <span className="block text-xs text-brand-700">
                            {pick.supplierName} · {money(pick.total)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={requestStatusObj[row.status].variant}>
                          {requestStatusObj[row.status].text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray">
                    Nenhuma solicitação aqui.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewRequestDialog
        open={creating}
        onOpenChange={setCreating}
        onDone={refresh}
      />
      <RequestDialog
        request={open}
        canBuy={canBuy}
        chosenQuoteId={open ? chosen[open.id] : undefined}
        onChoose={(quoteId) =>
          open &&
          setChosen((current) => {
            const next = { ...current }
            if (!quoteId || next[open.id] === quoteId) delete next[open.id]
            else next[open.id] = quoteId
            return next
          })
        }
        onOpenChange={() => setOpenId(null)}
        onDone={refresh}
      />
      <CloseOrderDialog
        open={closing}
        quoteIds={Object.values(chosen)}
        onOpenChange={setClosing}
        onDone={() => {
          setChosen({})
          refresh()
          queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
        }}
      />
    </div>
  )
}

function NewRequestDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const [material, setMaterial] = useState<MaterialChoice | null>(null)
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [neededBy, setNeededBy] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await createPurchaseRequest({
      materialId: material?.materialId ?? null,
      variationId: material?.variationId ?? null,
      description: material ? undefined : description,
      quantity: toNumber(quantity),
      unit: material ? undefined : unit,
      neededBy: neededBy || null,
      note: note || null,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setMaterial(null)
    setDescription('')
    setQuantity('')
    setUnit('')
    setNeededBy('')
    setNote('')
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Nova solicitação de material</DialogTitle>
          <DialogDescription>
            Fica registrado quem pediu, o quê e quando.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <MaterialPicker value={material} onChange={setMaterial} />
          {!material && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="request-description">
                Ou descreva o que precisa
              </Label>
              <Input
                id="request-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="request-quantity">
                Quantidade{material ? ` (${material.unit})` : ''}
              </Label>
              <Input
                id="request-quantity"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            {material ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="request-needed">Para quando</Label>
                <Input
                  id="request-needed"
                  type="date"
                  value={neededBy}
                  onChange={(event) => setNeededBy(event.target.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="request-unit">Unidade</Label>
                <Input
                  id="request-unit"
                  placeholder="un, m², caixa"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                />
              </div>
            )}
          </div>
          {!material && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="request-needed-free">Para quando</Label>
              <Input
                id="request-needed-free"
                type="date"
                value={neededBy}
                onChange={(event) => setNeededBy(event.target.value)}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="request-note">Observação</Label>
            <Textarea
              id="request-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            isLoading={saving}
            disabled={
              !(toNumber(quantity) > 0) || (!material && !description.trim())
            }
            onClick={save}
          >
            Solicitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RequestDialog({
  request,
  canBuy,
  chosenQuoteId,
  onChoose,
  onOpenChange,
  onDone,
}: {
  request: PurchaseRequest | null
  canBuy: boolean
  chosenQuoteId?: string
  onChoose: (quoteId: string | null) => void
  onOpenChange: () => void
  onDone: () => void
}) {
  const money = useMoney()
  const [supplier, setSupplier] = useState<SupplierChoice>({
    supplierId: null,
    supplierName: '',
  })
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [days, setDays] = useState('')
  const [terms, setTerms] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [canceling, setCanceling] = useState(false)

  if (!request) return null
  const openForQuotes =
    request.status === 'REQUESTED' || request.status === 'QUOTING'

  const addQuote = async () => {
    setSaving(true)
    const res = await addPurchaseQuote(request.id, {
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      unitPrice: toCents(price),
      quantity: quantity ? toNumber(quantity) : undefined,
      deliveryDays: days ? Number(days) : null,
      paymentTerms: terms || null,
      validUntil: validUntil || null,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setSupplier({ supplierId: null, supplierName: '' })
    setPrice('')
    setQuantity('')
    setDays('')
    setTerms('')
    setValidUntil('')
    onDone()
  }

  const cancel = async () => {
    const res = await cancelPurchaseRequest(request.id, cancelReason)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setCanceling(false)
    setCancelReason('')
    onDone()
  }

  return (
    <Dialog open={!!request} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle>
            Solicitação {request.number} · {request.description}
          </DialogTitle>
          <DialogDescription>
            {qty(request.quantity)} {request.unit} · pedida por{' '}
            {request.requestedByName} em {brDate(request.createdAt)}
            {request.neededBy && ` · para ${brDate(request.neededBy)}`}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={requestStatusObj[request.status].variant}>
              {requestStatusObj[request.status].text}
            </Badge>
            {request.note && (
              <span className="text-sm text-gray-700">{request.note}</span>
            )}
            {request.cancelReason && (
              <span className="text-sm text-gray-700">
                Motivo: {request.cancelReason}
              </span>
            )}
          </div>

          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Cotações</p>
            {request.quotes.length ? (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                {request.quotes.map((quote) => (
                  <li
                    key={quote.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm"
                  >
                    {canBuy && openForQuotes && (
                      <input
                        type="radio"
                        aria-label={`Escolher ${quote.supplierName}`}
                        name={`quote-${request.id}`}
                        checked={chosenQuoteId === quote.id}
                        onChange={() => onChoose(quote.id)}
                      />
                    )}
                    <span className="font-medium text-gray-900">
                      {quote.supplierName}
                    </span>
                    <span>
                      {qty(quote.quantity)} × {money(quote.unitPrice)} ={' '}
                      <strong>{money(quote.total)}</strong>
                    </span>
                    {quote.deliveryDays !== null && (
                      <span className="text-gray">
                        entrega em {quote.deliveryDays} dia(s)
                      </span>
                    )}
                    {quote.paymentTerms && (
                      <span className="text-gray">{quote.paymentTerms}</span>
                    )}
                    {quote.validUntil && (
                      <span className="text-gray">
                        vale até {brDate(quote.validUntil)}
                      </span>
                    )}
                    {quote.chosen && (
                      <Badge variant="successLight">Virou pedido</Badge>
                    )}
                    {canBuy && openForQuotes && !quote.chosen && (
                      <Button
                        size="sm"
                        variant="link"
                        className="ml-auto"
                        onClick={async () => {
                          const res = await removePurchaseQuote(
                            request.id,
                            quote.id,
                          )
                          if (!res.success) return toast.error(res.message)
                          if (chosenQuoteId === quote.id) onChoose(null)
                          onDone()
                        }}
                      >
                        Tirar
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray">Ainda sem cotação.</p>
            )}
            {canBuy && openForQuotes && request.quotes.length > 0 && (
              <p className="text-xs text-gray">
                Escolha uma cotação e use &quot;Fechar pedido&quot; na lista: as
                escolhidas viram um pedido por fornecedor.
              </p>
            )}
          </section>

          {canBuy && openForQuotes && (
            <section className="space-y-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                Lançar cotação
              </p>
              <SupplierField value={supplier} onChange={setSupplier} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quote-price">
                    Preço por {request.unit || 'unidade'}
                  </Label>
                  <Input
                    id="quote-price"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quote-quantity">Quantidade</Label>
                  <Input
                    id="quote-quantity"
                    inputMode="decimal"
                    placeholder={qty(request.quantity)}
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quote-days">Entrega (dias)</Label>
                  <Input
                    id="quote-days"
                    type="number"
                    min={0}
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="quote-valid">Vale até</Label>
                  <Input
                    id="quote-valid"
                    type="date"
                    value={validUntil}
                    onChange={(event) => setValidUntil(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="quote-terms">Condição de pagamento</Label>
                <Input
                  id="quote-terms"
                  placeholder="Ex.: 30/60 dias"
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                />
              </div>
              <Button
                variant="neutralOutline"
                isLoading={saving}
                disabled={
                  !price ||
                  (!supplier.supplierId && !supplier.supplierName.trim())
                }
                onClick={addQuote}
              >
                Lançar cotação
              </Button>
            </section>
          )}

          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Linha do tempo</p>
            <Timeline events={request.events} />
          </section>

          {openForQuotes && (
            <PermissionGate permissions={['stock:purchase_request:edit']}>
              {canceling ? (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-1 flex-col gap-2">
                    <Label htmlFor="request-cancel">
                      Motivo do cancelamento
                    </Label>
                    <Input
                      id="request-cancel"
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                    />
                  </div>
                  <Button
                    variant="errorOutline"
                    disabled={!cancelReason.trim()}
                    onClick={cancel}
                  >
                    Cancelar solicitação
                  </Button>
                </div>
              ) : (
                <Button variant="link" onClick={() => setCanceling(true)}>
                  Cancelar solicitação
                </Button>
              )}
            </PermissionGate>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

function CloseOrderDialog({
  open,
  quoteIds,
  onOpenChange,
  onDone,
}: {
  open: boolean
  quoteIds: string[]
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const [expectedAt, setExpectedAt] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const close = async () => {
    setSaving(true)
    const res = await closePurchaseOrder({
      quoteIds,
      expectedAt: expectedAt || null,
      note: note || null,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    const count = res.data?.length ?? 0
    toast.success(
      count > 1 ? `${count} pedidos de compra fechados` : res.message,
    )
    setExpectedAt('')
    setNote('')
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Fechar pedido</DialogTitle>
          <DialogDescription>
            {quoteIds.length} cotação(ões) escolhida(s). Sai um pedido por
            fornecedor, e as solicitações passam para &quot;Em pedido&quot;.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="close-expected">Entrega prevista</Label>
            <Input
              id="close-expected"
              type="date"
              value={expectedAt}
              onChange={(event) => setExpectedAt(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="close-note">Observação</Label>
            <Textarea
              id="close-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button isLoading={saving} onClick={close}>
            Fechar pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
