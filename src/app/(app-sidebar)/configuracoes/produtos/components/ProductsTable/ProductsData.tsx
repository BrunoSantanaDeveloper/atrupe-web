'use client'

// React
import { useEffect, useMemo, useState } from 'react'

// Components
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { NewProduct, NewProductTriggerButton } from '../NewProduct'
import { DuplicateProductButton } from '../DuplicateProductButton'
import { ProductFiscalDataDialog } from '../ProductFiscalData'
import { BulkNcmDialog } from '../ProductFiscalData/BulkNcmDialog'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { CardFooter, CardContent } from '@/components/ui/card'

// Types
import type { ProductListType } from '@/types/settings/products'
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'

// Actions
import { getDataOld, getItemOld, updateItemNew } from '@/actions/_cruds'
import { productBodyFrom, rawMeasureOf } from '../productBody'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo'
import {
  convertRawToUnitCost,
  convertUnitCostToRaw,
} from '@/components/common/form/global-inputs/products/UnitCostInput'
import { EditPriceModal } from '@/app/(app-sidebar)/precificacao/components/EditPriceModal'
import type { PricingItem } from '@/app/(app-sidebar)/precificacao/types'
import {
  unitSymbol,
  type UnitKind,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAssembly } from '@/actions/product-assembly'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Icons
import {
  IconReceiptTax,
  IconStack2,
  IconCurrencyReal,
} from '@tabler/icons-react'

// Components
import { ActionButton } from '@/components/common/ActionButton'

// Consts
import { FEATURES } from '@/consts/features'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function ProductsData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const queryClient = useQueryClient()
  // Precificar o produto pela lista (03/10/2026): o mesmo modal dos
  // materiais. O custo vem da composição, quando existir; o preço gravado é
  // o valor de venda do cadastro
  const [pricing, setPricing] = useState<PricingItem | undefined>()
  const [pricingUnitKind, setPricingUnitKind] = useState('UNITY')
  const openPricing = async (product: ProductListType) => {
    const unitKind = product?.items?.[0]?.unitKind || 'UNITY'
    setPricingUnitKind(unitKind)
    const price = Math.round(
      convertRawToUnitCost(unitKind, Number(product?.unitCost || 0)),
    )
    const assembly = await getAssembly({ productId: product.id })
    const computed = assembly?.data
    const cost =
      computed && computed.blocks.length && computed.cost > 0
        ? Math.round(computed.cost / Math.max(computed.saleAmount || 1, 0.0001))
        : null
    setPricing({
      id: product.id,
      name: product.name,
      code: product.code,
      sector: product.sectorName || '',
      unit: unitSymbol[unitKind as UnitKind] || unitKind,
      cost,
      costUpdatedAt: null,
      rule: 'FIXED',
      price: price || null,
      margin:
        cost !== null && price
          ? Math.round(((price - cost) / price) * 1000) / 10
          : null,
      status:
        cost === null
          ? 'NO_COST'
          : !price
            ? 'PENDING'
            : price < cost
              ? 'BELOW_COST'
              : 'PRICED',
    })
  }
  // Grava o valor de venda no cadastro do produto (API) e espelha no mock da
  // composição, para o comparativo preço × custo continuar certo
  const saveProductPrice = async ({ price }: { price: number }) => {
    if (!pricing) return { success: false, message: 'Produto não encontrado' }
    const source = await getItemOld({ route: 'productRoute', id: pricing.id })
    if (!source?.id)
      return { success: false, message: 'Produto não encontrado' }
    const body = productBodyFrom(source)
    if (!body.items.length) {
      return { success: false, message: 'O produto não tem unidade de venda' }
    }
    const first = body.items[0]
    const rawUnitCost = convertUnitCostToRaw(first.unitKind, price)
    body.items[0] = {
      ...first,
      unitCost: rawUnitCost,
      salePrice: Math.round(rawUnitCost * rawMeasureOf(source.items?.[0])),
    }
    const result = await updateItemNew({
      route: `/product/${pricing.id}`,
      data: body,
    })
    if (!result.success)
      return {
        success: false,
        message: result.message || 'Erro ao gravar o preço',
      }
    queryClient.invalidateQueries({ queryKey: ['product-list'] })
    queryClient.invalidateQueries({ queryKey: ['product', pricing.id] })
    queryClient.invalidateQueries({ queryKey: ['assembly', pricing.id] })
    return { success: true, message: '' }
  }
  const [selectedProductName, setSelectedProductName] = useState<string>('')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // "Todos os N produtos da lista", além dos marcados nesta página. Padrão do
  // Gmail: só aparece depois que a página inteira está marcada.
  const [selecionouTodos, setSelecionouTodos] = useState(false)

  const { hasAllPermissions } = usePermissions()
  const { hasFiscalModule, hasFeature } = usePlanFeatures()

  // A composição é recurso do PRO e vive dentro do produto, sem cadastro
  // paralelo: o mesmo produto do START ganha custo e margem (CP-16, CP-17).
  // A composição lê a API: aparece para quem tem a base de custos
  const showComposition = hasFeature(FEATURES.COSTS.COST_BASE)

  // EC-26: a permissão "Valores" também vale aqui — quem não pode ver preço
  // não vê a tabela de preços da empresa
  const canSeeValues = hasAllPermissions(['values:values:view'])

  const showNcmColumn = hasFiscalModule()
  const canConfigureFiscalData =
    showNcmColumn && hasAllPermissions(['nota_fiscal:config:edit'])

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  // O filtro de composição vai à API (CP-17), valendo para todas as páginas
  const { composicao, ...rest } = searchParams
  const apiParams = {
    ...rest,
    ...(showComposition && composicao === 'com'
      ? { hasComposition: 'true' }
      : {}),
    ...(showComposition && composicao === 'sem'
      ? { hasComposition: 'false' }
      : {}),
  }
  const filters = { ...apiParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-list', apiParams],
    queryFn: () => getDataOld({ route: 'productRoute', filters }),
  })

  // useMemo para o array não trocar de identidade a cada render e invalidar
  // os memos de seleção abaixo.
  const products: ProductListType[] = useMemo(() => {
    const list: ProductListType[] = data?.data || []
    return list
  }, [data])
  const hasData = products.length

  // A seleção vale para a página visível: trocar de página, aba ou filtro
  // zera para ninguém aplicar NCM em produto que não está mais à vista.
  // A chave é o CONTEÚDO do searchParams — depender da identidade do objeto
  // limparia a seleção em qualquer re-render que o recriasse.
  const selectionScopeKey = JSON.stringify(searchParams)
  useEffect(() => {
    setSelectedIds([])
    setSelecionouTodos(false)
  }, [selectionScopeKey])

  const pageIds = useMemo(() => products.map((p) => p.id), [products])
  const selectedOnPage = useMemo(
    () => selectedIds.filter((id) => pageIds.includes(id)),
    [selectedIds, pageIds],
  )
  const allOnPageSelected =
    pageIds.length > 0 && selectedOnPage.length === pageIds.length

  function toggleProduct(productId: string, checked: boolean) {
    // Desmarcar uma linha desfaz o "todos": o usuário quis um subconjunto.
    if (!checked) setSelecionouTodos(false)
    setSelectedIds((current) =>
      checked
        ? [...current, productId]
        : current.filter((id) => id !== productId),
    )
  }

  function toggleAllOnPage(checked: boolean) {
    setSelectedIds(checked ? pageIds : [])
    if (!checked) setSelecionouTodos(false)
  }

  function limparSelecao() {
    setSelectedIds([])
    setSelecionouTodos(false)
  }

  const totalDaLista = data?.total ?? 0
  const podeSelecionarTodos = allOnPageSelected && totalDaLista > pageIds.length
  const temBusca = Boolean(searchParams?.search)

  // Os mesmos filtros que a listagem usou, para o backend atingir exatamente
  // o conjunto que o usuário está vendo.
  const filtrosDaLista = {
    search: searchParams?.search,
    categoryId: searchParams?.categoryId,
    sectorId: searchParams?.sectorId,
    unitKind: searchParams?.unitKind,
    categoryKind: searchParams?.categoryKind,
    status: status || undefined,
  }

  return (
    <>
      {canConfigureFiscalData && selectedIds.length > 0 && (
        <div className="space-y-2 border-b border-gray-100 bg-brand-50 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-700">
              {selecionouTodos ? (
                <>
                  Todos os {totalDaLista} produtos{' '}
                  {temBusca ? 'da busca' : 'da lista'} selecionados
                </>
              ) : (
                <>
                  {selectedIds.length} produto
                  {selectedIds.length === 1 ? '' : 's'} selecionado
                  {selectedIds.length === 1 ? '' : 's'}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="neutralOutline"
                onClick={limparSelecao}
              >
                Limpar seleção
              </Button>
              <Button
                type="button"
                size="sm"
                RightIcon={IconReceiptTax}
                onClick={() => setOpenDialog('bulk-ncm')}
              >
                Alterar NCM
              </Button>
            </div>
          </div>

          {podeSelecionarTodos && (
            <p className="text-xs text-gray-600">
              {selecionouTodos ? (
                <>
                  <button
                    type="button"
                    className="text-brand-700 underline"
                    onClick={() => setSelecionouTodos(false)}
                  >
                    Selecionar apenas os {pageIds.length} desta página
                  </button>
                </>
              ) : (
                <>
                  Os {pageIds.length} produtos desta página estão selecionados.{' '}
                  <button
                    type="button"
                    className="text-brand-700 underline"
                    onClick={() => setSelecionouTodos(true)}
                  >
                    Selecionar todos os {totalDaLista} produtos{' '}
                    {temBusca ? 'da busca' : 'da lista'}
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}

      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {canConfigureFiscalData && (
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Selecionar todos os produtos desta página"
                      checked={
                        allOnPageSelected
                          ? true
                          : selectedOnPage.length > 0
                            ? 'indeterminate'
                            : false
                      }
                      onCheckedChange={(checked) =>
                        toggleAllOnPage(checked === true)
                      }
                    />
                  </TableHead>
                )}
                <TableHead>Produto</TableHead>
                <TableHead>Setor</TableHead>
                {showNcmColumn && <TableHead>NCM</TableHead>}
                {canSeeValues && <TableHead>Preço de venda</TableHead>}
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product?.id}>
                  {canConfigureFiscalData && (
                    <TableCell className="w-10">
                      <Checkbox
                        aria-label={`Selecionar ${product?.name}`}
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={(checked) =>
                          toggleProduct(product.id, checked === true)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <p className="font-medium">
                      {product?.name}
                      {showComposition && product?.hasComposition && (
                        <Badge
                          variant="blueLight"
                          className="ml-2 align-middle"
                        >
                          Com composição
                        </Badge>
                      )}
                    </p>
                    <p className="text-gray">{product?.code}</p>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    <Badge variant="neutralLight">{product?.sectorName}</Badge>
                  </TableCell>
                  {showNcmColumn && (
                    <TableCell className="text-gray-600">
                      {product?.fiscalData?.ncm || (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  )}
                  {canSeeValues && (
                    <TableCell className="text-success-700">
                      {(() => {
                        const unitKind =
                          product?.items?.[0]?.unitKind || 'UNITY'
                        const visualUnitCost = convertRawToUnitCost(
                          unitKind,
                          product?.unitCost || 0,
                        )
                        return formatCurrencyToBrl(visualUnitCost)
                      })()}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        {showComposition && (
                          <ActionButton
                            Icon={IconStack2}
                            tooltip={`Composição de ${product?.name}`}
                            link={`/configuracoes/produtos/${product?.id}/composicao`}
                          />
                        )}
                        <PermissionGate
                          permissions={['product_settings:products:edit']}
                        >
                          {/* Precificar é o modal da Precificação, que ainda
                              roda sobre dados de exemplo: só com a flag */}
                          {DEMO_DATA && (
                            <ActionButton
                              Icon={IconCurrencyReal}
                              tooltip={`Precificar ${product?.name}`}
                              onClick={() => {
                                openPricing(product).catch(() =>
                                  toast.error('Erro ao abrir a precificação'),
                                )
                              }}
                            />
                          )}
                          {/* Duplicar: outro produto com os mesmos dados e a
                              mesma composição, aberto para edição. Cria um
                              produto, então pede também "Cria" (CC-9). O
                              servidor copia fiscal, ST, variações e, com o
                              plano, composição e faixas; o código ganha "-C"
                              (liberado pelo PO em 14/10/2026) */}
                          <PermissionGate
                            permissions={['product_settings:products:create']}
                          >
                            <DuplicateProductButton
                              productId={product?.id}
                              name={product?.name}
                              onDone={(newId) => {
                                setSelectedProductId(newId)
                                setOpenDialog('edit-product')
                              }}
                            />
                          </PermissionGate>
                          <NewProductTriggerButton
                            editMode
                            onOpenChange={() => {
                              setOpenDialog('edit-product')
                              setSelectedProductId(product?.id)
                            }}
                          />
                        </PermissionGate>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <FilteredDataEmpty
            title="Produto não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre um novo produto"
            cta={
              <NewProductTriggerButton
                onOpenChange={() => setOpenDialog('new-product')}
              />
            }
          />
        )}
      </CardContent>

      {/* O modal da Precificação roda sobre dados de exemplo: montado só com
          a flag, para a consulta dele não sair em produção (CC-11) */}
      {DEMO_DATA && (
        <EditPriceModal
          group="products"
          item={pricing}
          open={!!pricing}
          onOpenChange={() => setPricing(undefined)}
          onSave={saveProductPrice}
          priceTiers={
            pricing
              ? { productId: pricing.id, unitKind: pricingUnitKind }
              : undefined
          }
        />
      )}
      <NewProduct
        open={openDialog === 'new-product'}
        onOpenChange={() => setOpenDialog('')}
        onSuccess={(product) => {
          const canConfigureFiscalData =
            hasFiscalModule() && hasAllPermissions(['nota_fiscal:config:edit'])

          // No PRO o produto nasce e então ganha composição (CP-16): reabre
          // direto na aba do fluxo de etapas
          if (showComposition) {
            setTimeout(() => {
              setSelectedProductId(product.id)
              setOpenDialog('compose-product')
            }, 500)
            return
          }

          if (canConfigureFiscalData) {
            // Increased timeout to ensure NewProduct modal is fully closed and state is settled
            setTimeout(() => {
              setSelectedProductId(product.id)
              setSelectedProductName(product.name)
              setOpenDialog('fiscal-data')
            }, 500)
          }
        }}
      />
      <NewProduct
        open={openDialog === 'edit-product' || openDialog === 'compose-product'}
        editMode
        productId={selectedProductId}
        initialTab={
          openDialog === 'compose-product' ? 'composition' : 'general'
        }
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog('')
            setSelectedProductId('')
          }
        }}
      />
      <ProductFiscalDataDialog
        open={openDialog === 'fiscal-data'}
        productId={selectedProductId}
        productName={selectedProductName}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog('')
            setSelectedProductId('')
            setSelectedProductName('')
          }
        }}
      />
      <BulkNcmDialog
        open={openDialog === 'bulk-ncm'}
        scope={
          selecionouTodos
            ? { kind: 'all', filters: filtrosDaLista, total: totalDaLista }
            : { kind: 'selected', productIds: selectedIds }
        }
        onOpenChange={(open) => {
          if (!open) setOpenDialog('')
        }}
        onApplied={limparSelecao}
      />
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
    </>
  )
}
