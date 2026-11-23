'use client'

// O estoque por lote (ES-8 a ES-12; 22/11/2026), como na primeira versão:
// cada rolo ou chapa com o fornecedor, o custo, a marca, a cor e as medidas;
// o saldo atual guarda a sobra (o rolo de 1,22 × 50 m que está com
// 0,50 × 47 m). Abrir, dar baixa, dividir, finalizar e cancelar.
//
// A baixa do trabalho é do impressor, na tarefa do setor: ela vale para o
// estoque e a baixa da venda não tira de novo aquele material (ES-16). Aqui,
// a baixa à mão corrige o saldo (a sobra medida, a perda).

// React
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
  brDateTime,
  qty,
  toCents,
  toNumber,
  toOptionalNumber,
  MaterialPicker,
  measureOptions,
  lotStatusObj,
  type MaterialChoice,
} from '../../compras/components/shared'

// Actions
import {
  cancelStockLot,
  consumeStockLot,
  createStockLot,
  getStockLots,
  finishStockLot,
  moveStockLot,
  openStockLot,
  splitStockLot,
} from '@/actions/purchasing'

// Types
import type { LotMeasure, StockLot } from '../../compras/types'

// Hooks
import { useMoney } from '@/hooks/useMoney'
import { useSector } from '@/hooks/queries/useSector'
import { usePermissions } from '@/hooks/usePermissions'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

// Como na primeira versão: o rolo fica fechado no estoque; aberto, vai
// para um setor (a impressão) e fica disponível nas tarefas dele (ES-16)
const tabs = [
  { value: 'CLOSED', label: 'Fechados no estoque' },
  { value: 'OPEN', label: 'Abertos nos setores' },
  { value: 'closed', label: 'Finalizados e cancelados' },
  { value: 'all', label: 'Todos' },
]

const size = (width: number | null, length: number | null) =>
  width !== null && length !== null ? `${qty(width)} × ${qty(length)} m` : ''

export function Lots() {
  const money = useMoney()
  const queryClient = useQueryClient()
  const [view, setView] = useState('CLOSED')
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['stock-lots', view, search],
    queryFn: () =>
      getStockLots(
        view === 'CLOSED' || view === 'OPEN'
          ? { status: view, search }
          : { view, search },
      ),
  })
  const rows = data?.data || []
  const open = rows.find((row) => row.id === openId) || null
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-lots'] })
    queryClient.invalidateQueries({ queryKey: ['stock-items'] })
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Lotes"
        supportText="Cada rolo e cada chapa que entrou, com a sobra em largura e comprimento."
        primaryCta={
          <PermissionGate permissions={['stock:lot:edit']}>
            <Button LeftIcon={IconPlus} onClick={() => setCreating(true)}>
              Lançar lote
            </Button>
          </PermissionGate>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Tabs value={view} onValueChange={setView}>
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
              placeholder="Material, fornecedor, cor"
              className="w-[240px]"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saldo atual</TableHead>
                <TableHead>Valor do saldo</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={8} />
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => setOpenId(row.id)}
                  >
                    <TableCell>{row.code}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {row.material}
                      {(row.brand || row.color) && (
                        <span className="block text-xs text-gray">
                          {[row.brand, row.color].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{row.supplierName || '-'}</TableCell>
                    <TableCell>
                      {row.status === 'OPEN'
                        ? row.sectorName || 'Sem setor'
                        : row.status === 'CLOSED'
                          ? 'No estoque'
                          : '-'}
                    </TableCell>
                    <TableCell>
                      {size(row.width, row.length) ||
                        `${qty(row.quantity)} ${row.unit}`}
                      <span className="block text-xs text-gray">
                        {brDate(row.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {size(row.currentWidth, row.currentLength) && (
                        <span className="block">
                          {size(row.currentWidth, row.currentLength)}
                        </span>
                      )}
                      <span className="text-xs text-gray">
                        {qty(row.currentQuantity)} {row.unit}
                      </span>
                    </TableCell>
                    <TableCell>{money(row.currentValue)}</TableCell>
                    <TableCell>
                      <Badge variant={lotStatusObj[row.status].variant}>
                        {lotStatusObj[row.status].text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray">
                    Nenhum lote aqui.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewLotDialog
        open={creating}
        onOpenChange={setCreating}
        onDone={refresh}
      />
      <LotDialog
        lot={open}
        onOpenChange={() => setOpenId(null)}
        onDone={refresh}
      />
    </div>
  )
}

function NewLotDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const [material, setMaterial] = useState<MaterialChoice | null>(null)
  const [measure, setMeasure] = useState<LotMeasure>('ROLL')
  const [width, setWidth] = useState('')
  const [length, setLength] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')
  const [enter, setEnter] = useState(false)
  const [saving, setSaving] = useState(false)

  // No rolo e na chapa medidos em m², a quantidade sai da área
  const area =
    measure !== 'UNIT' && toNumber(width) > 0 && toNumber(length) > 0
      ? toNumber(width) * toNumber(length)
      : 0
  const suggested = material?.unit === 'm²' && area ? area : 0

  const save = async () => {
    setSaving(true)
    const res = await createStockLot({
      materialId: material!.materialId,
      variationId: material!.variationId,
      measure,
      quantity: toNumber(quantity) || suggested,
      width: measure === 'UNIT' ? null : (toOptionalNumber(width) ?? null),
      length: measure === 'UNIT' ? null : (toOptionalNumber(length) ?? null),
      cost: toCents(cost),
      supplierName,
      brand,
      color,
      enterStock: enter,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setMaterial(null)
    setWidth('')
    setLength('')
    setQuantity('')
    setCost('')
    setSupplierName('')
    setBrand('')
    setColor('')
    setEnter(false)
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Lançar lote</DialogTitle>
          <DialogDescription>
            O rolo ou a chapa que já está no estoque. O que chega pelo pedido de
            compra já entra com os lotes.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <MaterialPicker value={material} onChange={setMaterial} />
          <SelectBasic
            name="lot-measure"
            label="Tipo"
            value={measure}
            options={measureOptions}
            onChange={(value) => setMeasure(String(value) as LotMeasure)}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {measure !== 'UNIT' && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lot-width">Largura (m)</Label>
                  <Input
                    id="lot-width"
                    inputMode="decimal"
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lot-length">
                    {measure === 'SHEET' ? 'Altura (m)' : 'Comprimento (m)'}
                  </Label>
                  <Input
                    id="lot-length"
                    inputMode="decimal"
                    value={length}
                    onChange={(event) => setLength(event.target.value)}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot-quantity">
                Quantidade{material ? ` (${material.unit})` : ''}
              </Label>
              <Input
                id="lot-quantity"
                inputMode="decimal"
                placeholder={suggested ? qty(suggested) : ''}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot-cost">Custo do lote</Label>
              <Input
                id="lot-cost"
                inputMode="decimal"
                placeholder="0,00"
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot-supplier">Fornecedor</Label>
              <Input
                id="lot-supplier"
                value={supplierName}
                onChange={(event) => setSupplierName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot-brand">Marca</Label>
              <Input
                id="lot-brand"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot-color">Cor</Label>
              <Input
                id="lot-color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Switch checked={enter} onCheckedChange={setEnter} />É uma compra
            nova: somar ao saldo do estoque
          </label>
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            isLoading={saving}
            disabled={
              !material ||
              !(toNumber(quantity) > 0 || suggested > 0) ||
              (measure !== 'UNIT' && !area)
            }
            onClick={save}
          >
            Lançar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type UseMode = 'length' | 'remaining' | 'quantity'

function LotDialog({
  lot,
  onOpenChange,
  onDone,
}: {
  lot: StockLot | null
  onOpenChange: () => void
  onDone: () => void
}) {
  const money = useMoney()
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission('stock:lot:edit')
  const [mode, setMode] = useState<UseMode>('length')
  const [useLength, setUseLength] = useState('')
  const [remainWidth, setRemainWidth] = useState('')
  const [remainLength, setRemainLength] = useState('')
  const [useQuantity, setUseQuantity] = useState('')
  const [note, setNote] = useState('')
  const [splitBy, setSplitBy] = useState<'length' | 'width' | 'quantity'>(
    'length',
  )
  const [splitValue, setSplitValue] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  // O setor para onde o lote vai ao abrir (sem escolher, o do material)
  const [sectorId, setSectorId] = useState('')
  const { data: sectors = [] } = useSector({ status: 'ACTIVE' })
  const [busy, setBusy] = useState<string | null>(null)

  if (!lot) return null
  const active = lot.status === 'CLOSED' || lot.status === 'OPEN'
  const hasArea = lot.measure !== 'UNIT' && lot.width !== null

  const run = async (
    key: string,
    action: () => Promise<{ success: boolean; message: string }>,
    after?: () => void,
  ) => {
    setBusy(key)
    const res = await action()
    setBusy(null)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    after?.()
    onDone()
  }

  return (
    <Dialog open={!!lot} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            Lote {lot.code} · {lot.material}
          </DialogTitle>
          <DialogDescription>
            {[lot.supplierName, lot.brand, lot.color]
              .filter(Boolean)
              .join(' · ') || 'Sem fornecedor'}{' '}
            · entrou em {brDate(lot.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-gray">Situação</p>
              <Badge variant={lotStatusObj[lot.status].variant}>
                {lotStatusObj[lot.status].text}
              </Badge>
            </div>
            <div>
              <p className="text-gray">Entrada</p>
              <p className="text-gray-900">
                {size(lot.width, lot.length) ||
                  `${qty(lot.quantity)} ${lot.unit}`}
              </p>
            </div>
            <div>
              <p className="text-gray">Saldo atual</p>
              <p className="font-medium text-gray-900">
                {size(lot.currentWidth, lot.currentLength)}{' '}
                <span className="block text-xs font-normal text-gray">
                  {qty(lot.currentQuantity)} {lot.unit}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray">Custo</p>
              <p className="text-gray-900">
                {money(lot.cost)}
                <span className="block text-xs text-gray">
                  {money(lot.unitCost)} por {lot.unit} · saldo{' '}
                  {money(lot.currentValue)}
                </span>
              </p>
            </div>
          </div>
          {lot.cancelReason && (
            <p className="text-sm text-gray-700">Motivo: {lot.cancelReason}</p>
          )}

          {canEdit && active && (
            <section className="space-y-3 rounded-lg border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-900">
                {lot.status === 'CLOSED'
                  ? 'Abrir: levar o rolo para o setor'
                  : 'Mudar de setor'}
              </p>
              <div className="flex flex-wrap items-end gap-3">
                <SelectBasic
                  name="lot-sector"
                  label="Setor"
                  className="w-[260px]"
                  placeholder={
                    lot.status === 'CLOSED'
                      ? 'O setor do material'
                      : lot.sectorName || 'Escolher'
                  }
                  value={sectorId || undefined}
                  options={(sectors || []).map((sector) => ({
                    value: sector.id,
                    label: sector.name,
                  }))}
                  onChange={(value) => setSectorId(String(value))}
                />
                <Button
                  variant="neutralOutline"
                  isLoading={busy === 'open'}
                  disabled={lot.status === 'OPEN' && !sectorId}
                  onClick={() =>
                    run(
                      'open',
                      () =>
                        lot.status === 'CLOSED'
                          ? openStockLot(lot.id, sectorId || null)
                          : moveStockLot(lot.id, sectorId),
                      () => setSectorId(''),
                    )
                  }
                >
                  {lot.status === 'CLOSED'
                    ? 'Abrir lote'
                    : 'Levar para o setor'}
                </Button>
              </div>
              <p className="text-xs text-gray">
                Aberto, o rolo fica disponível nas tarefas do setor, onde o
                impressor informa o comprimento para dar a baixa.
              </p>
            </section>
          )}

          {canEdit && active && (
            <>
              <section className="space-y-3 rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    Corrigir o saldo (baixa à mão)
                  </p>
                  <span className="text-xs text-gray">
                    A baixa do trabalho é feita pelo impressor, na tarefa.
                  </span>
                  {lot.status === 'OPEN' && (
                    <span className="text-sm text-gray">
                      Aberto no setor {lot.sectorName || '—'}
                    </span>
                  )}
                </div>
                <Tabs
                  value={mode}
                  onValueChange={(value) => setMode(value as UseMode)}
                >
                  <TabsList>
                    {hasArea && (
                      <TabsTrigger value="length">Metros usados</TabsTrigger>
                    )}
                    {hasArea && (
                      <TabsTrigger value="remaining">Medir a sobra</TabsTrigger>
                    )}
                    <TabsTrigger value="quantity">Quantidade</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {mode === 'length' && hasArea && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="use-length">Metros que saíram</Label>
                      <Input
                        id="use-length"
                        inputMode="decimal"
                        value={useLength}
                        onChange={(event) => setUseLength(event.target.value)}
                      />
                    </div>
                  )}
                  {mode === 'remaining' && hasArea && (
                    <>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="remain-width">
                          Largura que sobrou (m)
                        </Label>
                        <Input
                          id="remain-width"
                          inputMode="decimal"
                          value={remainWidth}
                          onChange={(event) =>
                            setRemainWidth(event.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="remain-length">
                          Comprimento que sobrou (m)
                        </Label>
                        <Input
                          id="remain-length"
                          inputMode="decimal"
                          value={remainLength}
                          onChange={(event) =>
                            setRemainLength(event.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                  {(mode === 'quantity' || !hasArea) && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="use-quantity">
                        Quanto saiu ({lot.unit})
                      </Label>
                      <Input
                        id="use-quantity"
                        inputMode="decimal"
                        value={useQuantity}
                        onChange={(event) => setUseQuantity(event.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="use-note">Observação</Label>
                    <Input
                      id="use-note"
                      placeholder="O.S., trabalho"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="neutralOutline"
                  isLoading={busy === 'use'}
                  // A sobra pede as duas medidas maiores que zero (a sobra
                  // 0 × 0 zeraria o lote: para encerrar, Finalizar lote); os
                  // metros e a quantidade, o valor maior que zero
                  disabled={
                    mode === 'remaining' && hasArea
                      ? !(
                          (toOptionalNumber(remainWidth) ?? 0) > 0 &&
                          (toOptionalNumber(remainLength) ?? 0) > 0
                        )
                      : mode === 'length' && hasArea
                        ? !((toOptionalNumber(useLength) ?? 0) > 0)
                        : !((toOptionalNumber(useQuantity) ?? 0) > 0)
                  }
                  onClick={() =>
                    run(
                      'use',
                      () =>
                        consumeStockLot(
                          lot.id,
                          mode === 'remaining' && hasArea
                            ? {
                                remainingWidth: toOptionalNumber(remainWidth),
                                remainingLength: toOptionalNumber(remainLength),
                                note,
                              }
                            : mode === 'length' && hasArea
                              ? { length: toOptionalNumber(useLength), note }
                              : {
                                  quantity: toOptionalNumber(useQuantity),
                                  note,
                                },
                        ),
                      () => {
                        setUseLength('')
                        setRemainWidth('')
                        setRemainLength('')
                        setUseQuantity('')
                        setNote('')
                      },
                    )
                  }
                >
                  Registrar baixa
                </Button>
              </section>

              <section className="space-y-3 rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Dividir o lote
                </p>
                <div className="flex flex-wrap items-end gap-3">
                  <SelectBasic
                    name="split-by"
                    label="Cortar"
                    className="w-[220px]"
                    value={splitBy}
                    options={[
                      ...(hasArea
                        ? [
                            {
                              value: 'length',
                              label: 'Um pedaço do comprimento',
                            },
                            { value: 'width', label: 'Uma faixa da largura' },
                          ]
                        : []),
                      { value: 'quantity', label: 'Uma quantidade' },
                    ]}
                    onChange={(value) =>
                      setSplitBy(
                        String(value) as 'length' | 'width' | 'quantity',
                      )
                    }
                  />
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="split-value">
                      {splitBy === 'quantity'
                        ? `Quantidade (${lot.unit})`
                        : 'Metros'}
                    </Label>
                    <Input
                      id="split-value"
                      inputMode="decimal"
                      className="w-[140px]"
                      value={splitValue}
                      onChange={(event) => setSplitValue(event.target.value)}
                    />
                  </div>
                  <Button
                    variant="neutralOutline"
                    isLoading={busy === 'split'}
                    disabled={!(toNumber(splitValue) > 0)}
                    onClick={() =>
                      run(
                        'split',
                        () =>
                          splitStockLot(lot.id, {
                            [splitBy === 'quantity' || !hasArea
                              ? 'quantity'
                              : splitBy]: toNumber(splitValue),
                          }),
                        () => setSplitValue(''),
                      )
                    }
                  >
                    Dividir
                  </Button>
                </div>
              </section>

              <div className="flex flex-wrap items-end gap-3">
                <Button
                  variant="neutralOutline"
                  isLoading={busy === 'finish'}
                  onClick={() => run('finish', () => finishStockLot(lot.id))}
                >
                  Finalizar lote
                </Button>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lot-cancel">Motivo para cancelar</Label>
                  <Input
                    id="lot-cancel"
                    className="w-[260px]"
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                  />
                </div>
                <Button
                  variant="errorOutline"
                  disabled={!cancelReason.trim()}
                  isLoading={busy === 'cancel'}
                  onClick={() =>
                    run(
                      'cancel',
                      () => cancelStockLot(lot.id, cancelReason),
                      () => setCancelReason(''),
                    )
                  }
                >
                  Cancelar lote
                </Button>
              </div>
            </>
          )}

          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-900">Histórico</p>
            <ol className="space-y-1 text-sm">
              {lot.events.map((event, index) => (
                <li key={index}>
                  <span className="text-gray-900">{event.text}</span>
                  <span className="text-gray">
                    {' '}
                    · {event.byName} · {brDateTime(event.at)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
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
