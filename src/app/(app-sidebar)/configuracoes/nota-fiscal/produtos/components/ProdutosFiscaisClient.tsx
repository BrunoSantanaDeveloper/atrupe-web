'use client'

// React
import { useState } from 'react'

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

// Components
import { ProductFiscalDataDialog } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData'

// Icons
import { IconPackage, IconSettings, IconSearch } from '@tabler/icons-react'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Hooks
import { useQuery } from '@tanstack/react-query'

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

async function fetchProducts(search: string) {
  try {
    const response = await getDataOld({
      route: `/product?search=${search}&limit=50`,
    })
    return response?.data || response || []
  } catch (error) {
    return []
  }
}

export function ProdutosFiscaisClient() {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-fiscal', search],
    queryFn: () => fetchProducts(search),
  })

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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>NCM</TableHead>
                <TableHead>CFOP (UF)</TableHead>
                <TableHead>CST ICMS</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || '-'}</TableCell>
                  <TableCell>{product.fiscalData?.ncm || '-'}</TableCell>
                  <TableCell>
                    {product.fiscalData?.cfopInState || '-'}
                  </TableCell>
                  <TableCell>{product.fiscalData?.icmsCst || '-'}</TableCell>
                  <TableCell className="text-center">
                    {product.fiscalData?.ncm ? (
                      <Badge variant="success">Configurado</Badge>
                    ) : (
                      <Badge variant="warning">Pendente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="neutralOutline"
                      size="sm"
                      onClick={() => handleConfigureFiscal(product)}
                    >
                      <IconSettings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h4 className="font-medium text-blue-900 mb-2">Dados Fiscais</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            <strong>NCM</strong> (Nomenclatura Comum do Mercosul) - Classifica o
            produto para fins tributários.
          </li>
          <li>
            <strong>CFOP</strong> - Define o tipo de operação fiscal (venda,
            devolução, etc.).
          </li>
          <li>
            <strong>CST ICMS</strong> - Código de Situação Tributária do ICMS.
          </li>
          <li>
            Produtos sem NCM configurado aparecerão como{' '}
            <Badge variant="warning" className="inline">
              Pendente
            </Badge>
            .
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
