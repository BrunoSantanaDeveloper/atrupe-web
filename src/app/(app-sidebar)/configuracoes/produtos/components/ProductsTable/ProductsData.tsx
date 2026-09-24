'use client'

// React
import { useEffect, useMemo, useState } from 'react'

// Components
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { NewProduct, NewProductTriggerButton } from '../NewProduct'
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
import { getDataOld } from '@/actions/_cruds'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Third-party
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Icons
import { IconReceiptTax, IconStack2 } from '@tabler/icons-react'

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
  const [selectedProductName, setSelectedProductName] = useState<string>('')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // "Todos os N produtos da lista", além dos marcados nesta página. Padrão do
  // Gmail: só aparece depois que a página inteira está marcada.
  const [selecionouTodos, setSelecionouTodos] = useState(false)

  const { hasAllPermissions } = usePermissions()
  const { hasFiscalModule, hasFeature } = usePlanFeatures()

  // A composição é recurso do PRO e vive dentro do produto, sem cadastro
  // paralelo: o mesmo produto do START ganha custo e margem (CP-16, CP-17).
  const showComposition = hasFeature(FEATURES.COSTS.COST_BASE)

  // EC-26: a permissão "Valores" também vale aqui — quem não pode ver preço
  // não vê a tabela de preços da empresa
  const canSeeValues = hasAllPermissions(['values:values:view'])

  const showNcmColumn = hasFiscalModule()
  const canConfigureFiscalData =
    showNcmColumn && hasAllPermissions(['nota_fiscal:config:edit'])

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-list', searchParams],
    queryFn: () => getDataOld({ route: 'productRoute', filters }),
  })

  // useMemo para o array não trocar de identidade a cada render e invalidar
  // os memos de seleção abaixo.
  const products: ProductListType[] = useMemo(() => data?.data || [], [data])
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
                {canSeeValues && <TableHead>P.V.</TableHead>}
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
                    <p className="font-medium">{product?.name}</p>
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

      <NewProduct
        open={openDialog === 'new-product'}
        onOpenChange={() => setOpenDialog('')}
        onSuccess={(product) => {
          const canConfigureFiscalData =
            hasFiscalModule() && hasAllPermissions(['nota_fiscal:config:edit'])

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
        open={openDialog === 'edit-product'}
        editMode
        productId={selectedProductId}
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
