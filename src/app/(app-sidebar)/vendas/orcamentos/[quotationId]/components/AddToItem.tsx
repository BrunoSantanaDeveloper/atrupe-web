'use client'

// Acrescentar DENTRO de um item já lançado (ORC-5, 05/10/2026). No legado o
// item é um recipiente aberto: depois de lançado, recebe processos,
// acabamentos, terceirizados e itens prontos. Aqui o contexto fica escrito
// no topo ("Acrescentando a: …"), para não confundir com o "Adicionar item"
// do orçamento. Três caminhos:
//
// - processo: nasce com a medida do item (acompanha a base) e o preço sai
//   do cálculo do processo; com medida própria, fica como está quando o
//   item muda (decisão de 05/10/2026);
// - produto do catálogo (item pronto dentro do item, decisão de
//   05/10/2026): a mesma busca do modal principal; entra como parte, com a
//   medida e o preço do produto;
// - terceirizado avulso (T-4, MS-16): o vendedor informa o custo e vê o
//   preço de venda pelo markup padrão configurado em Configurações › Vendas,
//   podendo alterar. O custo nunca aparece na tela depois (ORC-7).

import { useEffect, useMemo, useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Actions
import {
  getSaleForm,
  getProcessList,
  getProcessDetail,
} from '@/actions/product-assembly'
import {
  addItemLine,
  getQuotationProducts,
} from '@/actions/quotation-composition'
import { getSalesSettings } from '@/actions/sales-settings'

// Hooks
import { useCanSeeValues } from '@/hooks/useMoney'
import { useProducts } from '@/hooks/queries/useProduct'
import { useSectorWithProducts } from '@/hooks/queries/useSectorWithProducts'

// Libs
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { outsourcedPriceFromCost } from '@/lib/quotation'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconX, IconSearch, IconArrowLeft } from '@tabler/icons-react'

interface Props {
  quotationId: string
  itemId: string
  itemName: string
  // A medida do item, em metros, para o processo nascer acompanhando a base
  measure: { quantity: number; width: number; height: number }
  onClose: () => void
}

type Mode = 'process' | 'catalog' | 'loose'

// O produto do catálogo como o painel o vê: preço por unidade de venda, em
// centavos, e se é vendido por medida
type CatalogProduct = {
  id: string
  name: string
  sector: string
  unitKind: 'AREA' | 'LENGTH' | 'UNITY'
  unitPrice: number
}

const num = (value: number) => String(value).replace('.', ',')
const toNumber = (value: string) => Number(value.replace(',', '.')) || 0
const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const unitLabel = (kind: CatalogProduct['unitKind']) =>
  kind === 'AREA' ? 'm²' : kind === 'LENGTH' ? 'm' : 'un'

// Quanto da medida entra no preço: área, comprimento ou só a quantidade
const measureFactor = (
  kind: CatalogProduct['unitKind'],
  measure: { width: number; height: number },
) =>
  kind === 'AREA'
    ? measure.width * measure.height
    : kind === 'LENGTH'
      ? measure.width
      : 1

export function AddToItem({
  quotationId,
  itemId,
  itemName,
  measure,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const canSeeValues = useCanSeeValues()

  const [mode, setMode] = useState<Mode>('process')
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('todos')
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  )
  const [pickedProduct, setPickedProduct] = useState<CatalogProduct | null>(
    null,
  )
  // Acompanha a base: a medida é a do item e a linha é recalculada quando o
  // item muda. Desligado, a medida é própria e fica como está
  const [followsBase, setFollowsBase] = useState(true)
  const [width, setWidth] = useState(num(measure.width))
  const [height, setHeight] = useState(num(measure.height))
  const [quantity, setQuantity] = useState(num(measure.quantity))
  const [supplier, setSupplier] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [price, setPrice] = useState('')
  const [priceEdited, setPriceEdited] = useState(false)
  const [saving, setSaving] = useState(false)

  /* ----------------------------- processos ----------------------------- */

  const { data: listRes } = useQuery({
    queryKey: ['process-list'],
    queryFn: () => getProcessList(),
  })
  const processes = useMemo(
    () =>
      (listRes?.data || []).filter(
        (process) => process.active && !process.incomplete,
      ),
    [listRes],
  )

  /* ------------------------- produtos do catálogo ---------------------- */

  const { data: apiProducts } = useProducts()
  const { data: apiSectors } = useSectorWithProducts()
  // Sem API (dev), valem os produtos de exemplo do mock, para o painel não
  // ficar sem opção
  const { data: mockProductsRes } = useQuery({
    queryKey: ['quotation-products'],
    queryFn: () => getQuotationProducts(),
    enabled: mode === 'catalog' && !apiProducts?.length,
  })
  const catalog = useMemo<CatalogProduct[]>(() => {
    if (apiProducts?.length) {
      const sectorName = (id: string) =>
        apiSectors?.find((item) => item.id === id)?.name || 'Sem setor'
      return apiProducts
        .filter((product) => product.isActive !== false)
        .map((product) => {
          const first = product.items?.[0]
          const kind = (first?.unitKind || 'UNITY').toUpperCase()
          const unitKind: CatalogProduct['unitKind'] =
            kind === 'AREA' ? 'AREA' : kind === 'LENGTH' ? 'LENGTH' : 'UNITY'
          const unitPrice = first?.unitCost
            ? convertRawToUnitCost(unitKind, first.unitCost)
            : (product.items ?? []).reduce(
                (sum, item) =>
                  sum + (item.salePrice ?? 0) * (item.quantity ?? 1),
                0,
              ) ||
              product.salePrice ||
              0
          return {
            id: product.id,
            name: product.name,
            sector: sectorName(product.sectorId),
            unitKind,
            unitPrice: Math.round(unitPrice),
          }
        })
    }
    return (mockProductsRes?.data || [])
      .filter((option) => option.releasedForSale !== false)
      .map((option) => ({
        id: option.id,
        name: option.name,
        sector: option.sector,
        unitKind: option.unit === 'm²' ? 'AREA' : 'UNITY',
        unitPrice: option.price,
      }))
  }, [apiProducts, apiSectors, mockProductsRes])

  const options =
    mode === 'catalog'
      ? catalog.map((item) => ({ ...item, kind: 'product' as const }))
      : processes.map((item) => ({
          id: item.id,
          name: item.name,
          sector: item.sector,
          kind: 'process' as const,
        }))
  const sectors = Array.from(new Set(options.map((item) => item.sector)))
  const term = normalize(search.trim())
  const visible = options.filter(
    (option) =>
      (sector === 'todos' || option.sector === sector) &&
      (!term || normalize(option.name).includes(term)),
  )

  // As instruções ao vendedor do produto escolhido (CP-13): as mesmas do
  // modal principal, pelo formulário de venda da composição
  const { data: saleFormRes } = useQuery({
    queryKey: ['sale-form', pickedProduct?.id],
    queryFn: () => getSaleForm({ productId: pickedProduct?.id as string }),
    enabled: !!pickedProduct,
  })
  const productInstructions = saleFormRes?.data?.instructions || []

  /* ------------------------------ medida ------------------------------- */

  const chosenMeasure = followsBase
    ? measure
    : {
        quantity: toNumber(quantity) || 1,
        width: toNumber(width) || 1,
        height: toNumber(height) || 1,
      }

  // O preço do processo com a medida informada, recalculado a cada mudança
  const { data: detailRes, isFetching } = useQuery({
    queryKey: ['add-to-item-price', picked?.id, chosenMeasure],
    queryFn: () =>
      getProcessDetail({
        processId: picked?.id as string,
        measure: chosenMeasure,
      }),
    enabled: !!picked,
  })
  const detail = detailRes?.success ? detailRes.data : null

  // A preferência do processo decide como ele nasce: herda a medida da base
  // ou pede medida própria (decisão de 03/10/2026)
  useEffect(() => {
    if (detail?.meta.afterBase)
      setFollowsBase(detail.meta.afterBase === 'INHERIT')
  }, [detail?.meta.afterBase])

  const partPrice = pickedProduct
    ? Math.round(
        pickedProduct.unitPrice *
          measureFactor(pickedProduct.unitKind, chosenMeasure) *
          chosenMeasure.quantity,
      )
    : 0

  /* --------------------------- terceirizado ---------------------------- */

  const { data: settingsRes } = useQuery({
    queryKey: ['sales-settings'],
    queryFn: () => getSalesSettings(),
    enabled: mode === 'loose',
  })
  const markup = settingsRes?.data?.outsourcedMarkup ?? 45
  const costCents = Math.round(toNumber(cost) * 100)
  const suggestedPrice = outsourcedPriceFromCost(costCents, markup)

  // O preço acompanha o custo até o vendedor mexer nele
  useEffect(() => {
    if (priceEdited) return
    setPrice(
      costCents > 0 ? (suggestedPrice / 100).toFixed(2).replace('.', ',') : '',
    )
  }, [costCents, suggestedPrice, priceEdited])

  const priceCents = canSeeValues
    ? Math.round(toNumber(price) * 100)
    : suggestedPrice

  /* ------------------------------ gravar ------------------------------- */

  const done = (message: string) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['quotation-item-lines'] })
    onClose()
  }

  const measureTags = () => [
    `${num(chosenMeasure.quantity)} un`,
    `${num(chosenMeasure.width)} × ${num(chosenMeasure.height)} m`,
  ]

  const addProcess = async () => {
    if (!picked || !detail) return
    setSaving(true)
    const res = await addItemLine({
      quotationId,
      itemId,
      line: {
        kind: 'PROCESS',
        name: picked.name,
        sector: detail.block?.sector || '',
        tags: measureTags(),
        cost: detail.cost ?? 0,
        price: detail.sale ?? 0,
        resolvedAt: new Date().toISOString(),
        resolved: [],
        processId: picked.id,
        measure: chosenMeasure,
        followsBase,
      },
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    done(`${picked.name} acrescentado a ${itemName}`)
  }

  const addPart = async () => {
    if (!pickedProduct) return
    setSaving(true)
    const measured = pickedProduct.unitKind !== 'UNITY'
    const res = await addItemLine({
      quotationId,
      itemId,
      line: {
        kind: 'PART',
        name: pickedProduct.name,
        sector: pickedProduct.sector,
        tags: measured
          ? measureTags()
          : [`${num(chosenMeasure.quantity)} ${unitLabel('UNITY')}`],
        // O custo da parte vem da composição do produto, que a API ainda não
        // devolve ao orçamento (backend-pendente.md)
        cost: 0,
        price: partPrice,
        resolvedAt: new Date().toISOString(),
        resolved: [],
        productId: pickedProduct.id,
        measure: chosenMeasure,
        followsBase: measured ? followsBase : undefined,
      },
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    done(`${pickedProduct.name} acrescentado a ${itemName}`)
  }

  const addLoose = async () => {
    setSaving(true)
    const res = await addItemLine({
      quotationId,
      itemId,
      line: {
        kind: 'LOOSE',
        name: description,
        sector: supplier ? `Terceirizado · ${supplier}` : 'Terceirizado',
        tags: ['terceirizado'],
        cost: costCents,
        price: priceCents,
        resolvedAt: new Date().toISOString(),
        resolved: [],
      },
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    // O custo digitado some em seguida (ORC-7)
    setCost('')
    setPrice('')
    setPriceEdited(false)
    done(`Terceirizado acrescentado a ${itemName}`)
  }

  const resetPick = () => {
    setPicked(null)
    setPickedProduct(null)
    setFollowsBase(true)
    setWidth(num(measure.width))
    setHeight(num(measure.height))
    setQuantity(num(measure.quantity))
  }

  const changeMode = (next: Mode) => {
    setMode(next)
    setSearch('')
    setSector('todos')
    resetPick()
  }

  /* ---------------------------- a medida ------------------------------- */

  const measureFields = (
    <>
      <label className="flex items-center gap-3 text-sm text-gray-700">
        <Switch checked={followsBase} onCheckedChange={setFollowsBase} />
        <span>
          <span className="font-medium">Acompanha a medida do item</span>
          <span className="block text-xs text-gray">
            {followsBase
              ? `Usa ${num(measure.quantity)} un · ${num(measure.width)} × ${num(measure.height)} m e é recalculado se o item mudar.`
              : 'Medida própria: fica como está se o item mudar. Use para uma parte só, como a instalação.'}
          </span>
        </span>
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="add-qty" className="text-sm font-medium">
            Quantidade
          </label>
          <Input
            id="add-qty"
            inputMode="decimal"
            disabled={followsBase}
            value={followsBase ? num(measure.quantity) : quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="add-width" className="text-sm font-medium">
            Largura (m)
          </label>
          <Input
            id="add-width"
            inputMode="decimal"
            disabled={followsBase}
            value={followsBase ? num(measure.width) : width}
            onChange={(event) => setWidth(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="add-height" className="text-sm font-medium">
            Altura (m)
          </label>
          <Input
            id="add-height"
            inputMode="decimal"
            disabled={followsBase}
            value={followsBase ? num(measure.height) : height}
            onChange={(event) => setHeight(event.target.value)}
          />
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-4 rounded-lg border border-brand-200 bg-brand-25 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray">Acrescentando a</p>
          <p className="font-medium text-gray-900">{itemName}</p>
        </div>
        <Button
          size="sm"
          type="button"
          variant="neutralOutline"
          LeftIcon={IconX}
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>

      {/* O que acrescentar: processo, produto do catálogo ou terceirizado */}
      {!picked && !pickedProduct && (
        <Tabs
          value={mode}
          variant="pill"
          onValueChange={(value) => changeMode(value as Mode)}
        >
          <TabsList>
            <TabsTrigger value="process">Processo</TabsTrigger>
            <TabsTrigger value="catalog">Produto do catálogo</TabsTrigger>
            <TabsTrigger value="loose">Terceirizado avulso</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {picked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="neutralGhost"
              LeftIcon={IconArrowLeft}
              onClick={resetPick}
            >
              Voltar
            </Button>
            <p className="font-medium text-gray-900">{picked.name}</p>
            {detail?.block?.sector && (
              <Badge variant="blueLight">{detail.block.sector}</Badge>
            )}
          </div>
          {/* Instruções ao vendedor do processo escolhido (CP-13): texto de
              apoio, só leitura */}
          {detail?.meta.sellerInstructions?.trim() && (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray">
                Instruções para o vendedor
              </p>
              <p className="text-sm text-gray-700">
                {detail.meta.sellerInstructions}
              </p>
            </div>
          )}
          {measureFields}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PermissionGate permissions={['values:values:view']}>
              <p className="text-sm text-gray-700">
                Preço de venda:{' '}
                <span className="font-semibold text-gray-900">
                  {isFetching || !detail
                    ? 'calculando…'
                    : formatCurrencyToBrl(detail.sale ?? 0)}
                </span>
              </p>
            </PermissionGate>
            <Button
              size="sm"
              type="button"
              isLoading={saving}
              disabled={!detail || isFetching}
              onClick={addProcess}
            >
              Acrescentar ao item
            </Button>
          </div>
        </div>
      ) : pickedProduct ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="neutralGhost"
              LeftIcon={IconArrowLeft}
              onClick={resetPick}
            >
              Voltar
            </Button>
            <p className="font-medium text-gray-900">{pickedProduct.name}</p>
            <Badge variant="successLight">Item pronto</Badge>
            <span className="text-sm text-gray">
              {pickedProduct.sector} · por {unitLabel(pickedProduct.unitKind)}
            </span>
          </div>
          {/* Instruções ao vendedor dos processos deste produto (CP-13) */}
          {productInstructions.length > 0 && (
            <div className="space-y-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray">
                Instruções para o vendedor
              </p>
              {productInstructions.map((instruction) => (
                <p key={instruction.blockId} className="text-sm text-gray-700">
                  <span className="font-medium">{instruction.stage}:</span>{' '}
                  {instruction.text}
                </p>
              ))}
            </div>
          )}
          {pickedProduct.unitKind === 'UNITY' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label htmlFor="part-qty" className="text-sm font-medium">
                  Quantidade
                </label>
                <Input
                  id="part-qty"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(event) => {
                    setFollowsBase(false)
                    setQuantity(event.target.value)
                  }}
                />
              </div>
            </div>
          ) : (
            measureFields
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PermissionGate permissions={['values:values:view']}>
              <p className="text-sm text-gray-700">
                Preço de venda:{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrencyToBrl(partPrice)}
                </span>
                <span className="text-gray">
                  {' '}
                  · {formatCurrencyToBrl(pickedProduct.unitPrice)} por{' '}
                  {unitLabel(pickedProduct.unitKind)}
                </span>
              </p>
            </PermissionGate>
            <Button
              size="sm"
              type="button"
              isLoading={saving}
              onClick={addPart}
            >
              Acrescentar ao item
            </Button>
          </div>
        </div>
      ) : mode === 'loose' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="loose-supplier" className="text-sm font-medium">
                Fornecedor
              </label>
              <Input
                id="loose-supplier"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="loose-what" className="text-sm font-medium">
                O que está sendo terceirizado
              </label>
              <Input
                id="loose-what"
                value={description}
                placeholder="Ex.: letra caixa, pintura eletrostática"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="loose-cost" className="text-sm font-medium">
                Custo do fornecedor
              </label>
              <Input
                id="loose-cost"
                inputMode="decimal"
                value={cost}
                startAdornment={<span className="text-sm">R$</span>}
                onChange={(event) => setCost(event.target.value)}
              />
              <p className="text-xs text-gray">
                O custo não fica na tela do orçamento: só o preço de venda.
              </p>
            </div>
            {/* O preço de venda pelo markup padrão, com o percentual escrito
                ao lado; o vendedor pode alterar (MS-16, T-4). Só para quem
                vê valores */}
            <PermissionGate permissions={['values:values:view']}>
              <div className="space-y-1.5">
                <label htmlFor="loose-price" className="text-sm font-medium">
                  Preço de venda
                </label>
                <Input
                  id="loose-price"
                  inputMode="decimal"
                  value={price}
                  startAdornment={<span className="text-sm">R$</span>}
                  onChange={(event) => {
                    setPriceEdited(true)
                    setPrice(event.target.value)
                  }}
                />
                <p className="text-xs text-gray">
                  Markup padrão de {num(markup)} %: custo ÷ (1 − {num(markup)}{' '}
                  %)
                  {costCents > 0 && ` = ${formatCurrencyToBrl(suggestedPrice)}`}
                  {priceEdited && costCents > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="ml-1 h-auto p-0 text-xs"
                      onClick={() => setPriceEdited(false)}
                    >
                      usar o sugerido
                    </Button>
                  )}
                </p>
              </div>
            </PermissionGate>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              type="button"
              isLoading={saving}
              disabled={!description.trim() || !priceCents}
              onClick={addLoose}
            >
              Acrescentar ao item
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              className="w-full sm:w-[280px]"
              placeholder={
                mode === 'catalog'
                  ? 'Buscar produto pelo nome'
                  : 'Buscar processo pelo nome'
              }
              startAdornment={<IconSearch size={16} />}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Tabs value={sector} variant="pill" className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="todos" onClick={() => setSector('todos')}>
                  Todos
                </TabsTrigger>
                {sectors.map((item) => (
                  <TabsTrigger
                    key={item}
                    value={item}
                    onClick={() => setSector(item)}
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  option.kind === 'product'
                    ? setPickedProduct(option)
                    : setPicked({ id: option.id, name: option.name })
                }
                className={cn(
                  'rounded-lg border border-gray-200 bg-white p-3 text-left',
                  'hover:border-brand-300 hover:shadow-sm',
                )}
              >
                <p className="font-medium text-gray-900">{option.name}</p>
                <p className="text-sm text-gray">
                  {option.sector}
                  {option.kind === 'product' && (
                    <PermissionGate permissions={['values:values:view']}>
                      <span>
                        {' '}
                        · {formatCurrencyToBrl(option.unitPrice)}
                        {option.unitKind !== 'UNITY' &&
                          `/${unitLabel(option.unitKind)}`}
                      </span>
                    </PermissionGate>
                  )}
                </p>
              </button>
            ))}
            {!visible.length && (
              <p className="text-sm text-gray">
                {mode === 'catalog'
                  ? 'Nenhum produto com esse nome.'
                  : 'Nenhum processo com esse nome.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
