'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// UI
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Icons
import { IconPlus, IconLoader2, IconPackage } from '@tabler/icons-react'

// Actions
import { getData } from '@/actions/_cruds'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProductFiscalData {
  ncm?: string
  cest?: string
  cfopInState?: string
  cfopOutState?: string
  icmsCst?: string
  pisCst?: string
  cofinsCst?: string
}

interface ProductSearchResult {
  id: string
  name: string
  code?: string
  salePrice: number
  unitOfMeasureCode?: string
  fiscalData?: ProductFiscalData | null
}

interface ProductSelectorProps {
  onAddProduct: (item: NfePrepareItem) => void
  nextItemNumber: number
  defaultCfop?: string
  preferDefaultCfop?: boolean
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductSelector({
  onAddProduct,
  nextItemNumber,
  defaultCfop = '5101',
  preferDefaultCfop = false,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<ProductSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(async (term: string) => {
    setIsLoading(true)

    try {
      const result = await getData({
        route: '/product',
        filters: { search: term },
        perPage: '20',
      })

      if (result.success && result.data) {
        setProducts(result.data as ProductSearchResult[])
      } else {
        setProducts([])
      }
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!search.trim()) {
      setProducts([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    debounceRef.current = setTimeout(() => {
      fetchProducts(search.trim())
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, fetchProducts])

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch('')
      setProducts([])
      setHasSearched(false)
    }
  }, [open])

  const handleSelect = (product: ProductSearchResult) => {
    const fiscal = product.fiscalData

    const newItem: NfePrepareItem = {
      itemNumber: nextItemNumber,
      productId: product.id,
      productCode: product.code || '',
      description: product.name,
      ncm: fiscal?.ncm || '49119900',
      cfop: preferDefaultCfop
        ? defaultCfop
        : fiscal?.cfopInState || defaultCfop,
      cstIcms: fiscal?.icmsCst || '',
      cstIpi: '',
      cstPis: fiscal?.pisCst || '',
      cstCofins: fiscal?.cofinsCst || '',
      unit: product.unitOfMeasureCode || 'UN',
      uCom: product.unitOfMeasureCode || 'UN',
      ean: '',
      ceantrib: '',
      quantity: 1,
      unitValue: product.salePrice || 0,
      discount: 0,
      freight: 0,
      insurance: 0,
      totalValue: product.salePrice || 0,
      isService: false,
      needsConfiguration: !fiscal?.ncm,
    }

    onAddProduct(newItem)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="neutralOutline"
          LeftIcon={IconPlus}
          className="w-full md:w-auto"
        >
          Adicionar Produto
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[360px]"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar produto por nome ou código..."
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                <IconLoader2 size={16} className="animate-spin" />
                Buscando produtos...
              </div>
            )}

            {/* Empty prompt — before any search */}
            {!isLoading && !hasSearched && (
              <div className="py-6 text-center text-sm text-gray-400">
                Digite para buscar produtos
              </div>
            )}

            {/* Empty results */}
            {!isLoading && hasSearched && products.length === 0 && (
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            )}

            {/* Results */}
            {!isLoading && products.length > 0 && (
              <CommandGroup heading="Produtos">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => handleSelect(product)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                  >
                    <IconPackage size={16} className="shrink-0 text-gray-400" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-gray-800 truncate">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {product.code && <span>CÓD: {product.code}</span>}
                        {product.salePrice > 0 && (
                          <>
                            {product.code && (
                              <span className="text-gray-300">·</span>
                            )}
                            <span className="text-gray-600 font-medium">
                              {formatCurrency(product.salePrice)}
                            </span>
                          </>
                        )}
                        {product.fiscalData?.ncm && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>NCM: {product.fiscalData.ncm}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
