'use client'

// React
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// UI
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TablePaginationControlled } from '@/components/common/TablePaginationControlled'

// Components
import { ProductFiscalDataDialog } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData'

// Icons
import {
  IconPackage,
  IconSettings,
  IconSearch,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

interface Product {
  id: string
  name: string
  sku?: string
  price?: number
  fiscalData?: {
    ncm?: string
    cest?: string
    cfopInState?: string
    cfopOutState?: string
    icmsCst?: string
    pisCst?: string
    cofinsCst?: string
  }
}

interface FetchResponse {
  data: Product[]
  page: number
  lastPage: number
  total: number
}

async function fetchProducts(
  page: number,
  search: string,
  status: string,
): Promise<FetchResponse> {
  try {
    const filters: any = {
      search,
      limit: 10,
      page,
    }

    // Apply status filter if not 'all'
    if (status === 'pending') {
      filters.fiscal_configured = false // Assuming backend supports this
    } else if (status === 'configured') {
      filters.fiscal_configured = true
    }

    const response = await getData({
      route: '/product',
      filters,
    })

    if (response.success && Array.isArray(response.data)) {
      return {
        data: response.data,
        page: response.page || 1,
        lastPage: response.lastPage || 1,
        total: response.total || 0,
      }
    }

    return { data: [], page: 1, lastPage: 1, total: 0 }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { data: [], page: 1, lastPage: 1, total: 0 }
  }
}

export function ProdutosFiscaisClient() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['products-fiscal', page, search, activeTab],
    queryFn: () => fetchProducts(page, search, activeTab),
  })

  // Reset page when search or tab changes
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  function handleConfigureFiscal(product: Product) {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setSelectedProduct(null)
    }
  }

  const products = data?.data || []
  const lastPage = data?.lastPage || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FeaturedIcon variant="outline" Icon={IconPackage} />
        <div>
          <h2 className="text-lg font-semibold">
            Lista de Produtos e Serviços
          </h2>
          <p className="text-sm text-gray-500">
            Configure os dados fiscais dos seus produtos para emissão de NF-e
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              Pendentes
              <Badge
                variant="warning"
                className="h-5 px-1.5 rounded-full text-[10px]"
              >
                !
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="configured" className="gap-2">
              Configurados
              <IconCheck size={14} className="text-emerald-500" />
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="mt-0 space-y-4">
          <ProductTable
            products={products}
            isLoading={isLoading}
            onConfigure={handleConfigureFiscal}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-0 space-y-4">
          <ProductTable
            products={products}
            isLoading={isLoading}
            onConfigure={handleConfigureFiscal}
          />
        </TabsContent>
        <TabsContent value="configured" className="mt-0 space-y-4">
          <ProductTable
            products={products}
            isLoading={isLoading}
            onConfigure={handleConfigureFiscal}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading && products.length > 0 && (
        <div className="border-t pt-4">
          <TablePaginationControlled
            page={page}
            lastPage={lastPage}
            setPage={setPage}
          />
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-8">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <IconAlertCircle className="w-4 h-4" />
          Informações Importantes
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-1">
          <li>
            <strong>NCM</strong> (Nomenclatura Comum do Mercosul) - Classifica o
            produto para fins tributários.
          </li>
          <li>
            <strong>CFOP</strong> - Define o tipo de operação fiscal (venda,
            devolução, etc.).
          </li>
          <li>
            Produtos marcados como{' '}
            <Badge
              variant="warning"
              className="inline text-[10px] h-4 px-1 mx-1"
            >
              Pendente
            </Badge>{' '}
            não poderão ser emitidos em notas fiscais.
          </li>
        </ul>
      </div>

      {/* Dialog */}
      {selectedProduct && (
        <ProductFiscalDataDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </div>
  )
}

function ProductTable({
  products,
  isLoading,
  onConfigure,
}: {
  products: Product[]
  isLoading: boolean
  onConfigure: (p: Product) => void
}) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-12 flex flex-col items-center justify-center text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary mb-4" />
        <p className="text-gray-500">Carregando produtos...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-slate-50 border-dashed p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <IconPackage className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Nenhum produto encontrado
        </h3>
        <p className="text-gray-500 max-w-sm">
          Não encontramos produtos correspondentes aos filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="w-[30%]">Produto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>NCM</TableHead>
            <TableHead>CFOP (UF)</TableHead>
            <TableHead>CST</TableHead>
            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const isConfigured = !!product.fiscalData?.ncm
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-900">{product.name}</span>
                    <span className="text-xs text-gray-500">
                      ID: {product.id.slice(0, 8)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  {product.sku || '-'}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {product.fiscalData?.ncm || '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {(product.fiscalData?.cfopInState && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-700">
                        Int: {product.fiscalData.cfopInState}
                      </span>
                      {product.fiscalData.cfopOutState && (
                        <span className="text-gray-500">
                          Ext: {product.fiscalData.cfopOutState}
                        </span>
                      )}
                    </div>
                  )) ||
                    '-'}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {product.fiscalData?.icmsCst || '-'}
                </TableCell>
                <TableCell className="text-center">
                  {isConfigured ? (
                    <Badge
                      variant="success"
                      className="font-normal justify-center w-full"
                    >
                      Configurado
                    </Badge>
                  ) : (
                    <Badge
                      variant="warning"
                      className="font-normal justify-center w-full"
                    >
                      Pendente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onConfigure(product)}
                    className="h-8 w-8 hover:bg-gray-100"
                    title="Configurar Fiscal"
                  >
                    <IconSettings className="h-4 w-4 text-gray-600" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
