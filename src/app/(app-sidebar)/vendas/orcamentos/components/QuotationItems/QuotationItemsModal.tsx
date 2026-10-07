// React
import { useCallback, useMemo, useEffect } from 'react'

// UI
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

// Components
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/common/form/FormInput'
import { CategorySelectField } from '@/components/common/form/global-inputs/CategorySelectField'

// Icons
import { IconBoxOff, IconLayoutGridAdd, IconSearch } from '@tabler/icons-react'

// Third-party
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { parseCurrencyToBrl } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { IProduct, useProducts } from '@/hooks/queries/useProduct'

import { useQuotation } from '@/contexts/quotationContext'
import { SelectSectorWithProductsField } from '@/components/common/form/global-inputs/SectorWithProductsSelectField'
import { convertRawToUnitCost } from '@/components/common/form/global-inputs/products/UnitCostInput'

// Helper para converter unitKind para símbolo da unidade
function getUnitSymbol(unitKind: string | null | undefined): string {
  switch (unitKind?.toUpperCase()) {
    case 'AREA':
      return 'm²'
    case 'LENGTH':
      return 'm'
    case 'CAPACITY':
      return 'L'
    case 'WEIGHT':
      return 'kg'
    case 'DISTANCE':
      return 'km'
    case 'DURATION':
      return 'h'
    case 'UNITY':
    default:
      return 'un'
  }
}

const schema = z.object({
  search: z.string().optional(),
  sectorId: z.string(),
  categoryId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function QuotationItemsModal({ open }: { open: boolean }) {
  const { quotationData, updateQuotationData, openChangeModal } = useQuotation()

  const { data: productsList, refetch, isLoading } = useProducts()

  // Revalida a lista de produtos sempre que o modal abrir
  useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, refetch])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      sectorId: quotationData?.sectorId || '',
    },
  })
  const { handleSubmit, watch } = form

  const searchTerm = watch('search')

  const sectorId = watch('sectorId')
  const categoryId = watch('categoryId')
  const filteredProducts = useMemo(() => {
    if (!productsList) return []

    const sectorId = watch('sectorId') || quotationData?.sectorId

    let filtered = productsList.filter(
      (product) => product.sectorId === sectorId,
    )

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered.filter((product) => {
      if (categoryId) {
        return product.categoryId === categoryId
      }
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsList, searchTerm, quotationData?.sectorId, sectorId, categoryId])

  const onSubmit = (data: FormData) => {
    updateQuotationData({
      sectorId: data.sectorId,
      categoryId: data.categoryId,
    })
    openChangeModal(true, 'productDetail')
  }

  const handleSelectProduct = (productId: string) => {
    updateQuotationData({ productId })
    handleSubmit(onSubmit)()
  }

  /**
   * Preço exibido na listagem.
   *
   * Preferimos o total (`salePrice` somado dos itens). Produto vendido por unidade
   * dimensional (m², metro, kg, hora…) sem medida cadastrada não tem total — nesse
   * caso mostramos o preço por unidade de exibição, convertendo o `unitCost` bruto
   * (R$/mm², R$/segundo…) de volta, como já faz a tela de produtos.
   */
  const getDisplayPrice = useCallback(
    (product: IProduct): { value: number; unit: string } => {
      const total = (product.items ?? []).reduce(
        (sum, item) => sum + (item.salePrice ?? 0) * (item?.quantity ?? 1),
        0,
      )

      if (total > 0) return { value: total, unit: '' }

      const firstItem = product.items?.[0]
      if (!firstItem?.unitCost) {
        return { value: product?.salePrice ?? 0, unit: '' }
      }

      const unitSymbol = getUnitSymbol(firstItem.unitKind)
      return {
        value: convertRawToUnitCost(firstItem.unitKind, firstItem.unitCost),
        unit: unitSymbol === 'un' ? '' : `/${unitSymbol}`,
      }
    },
    [],
  )

  return (
    <Dialog open={open} onOpenChange={openChangeModal}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGridAdd} />
              <span>Qual item deseja adicionar?</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        {/* FORM */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              id="form-id"
              className="flex flex-wrap gap-5"
            >
              <FormInput<FormData>
                name="search"
                label="Buscar produto"
                placeholder="Buscar produto"
                width="flex-[1_0_190px]"
                startAdornment={<IconSearch />}
              />
              <SelectSectorWithProductsField<FormData>
                name="sectorId"
                label="Setor"
                width="flex-[1_0_190px]"
              />
              <CategorySelectField<FormData>
                name="categoryId"
                label="Grupo de produtos"
                width="flex-[1_0_190px]"
                sectorId={sectorId}
              />
            </form>
          </Form>
        </div>
        {/* Table */}
        <div className="pr-1 mt-0 m-6 bg-white rounded-xl h-[calc(50vh-100px)] overflow-y-auto">
          {/* Sem a lista ainda, "Nenhum produto" seria falso */}
          {isLoading ? (
            <Table className="table-fixed">
              <TableBody>
                <TableSkeletonRows cols={4} rows={6} />
              </TableBody>
            </Table>
          ) : filteredProducts.length > 0 ? (
            <Table className="table-fixed">
              <TableBody>
                {filteredProducts?.map((item) => {
                  const price = getDisplayPrice(item)

                  return (
                    <TableRow
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={() => handleSelectProduct(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          handleSelectProduct(item.id)
                        }
                      }}
                    >
                      <TableCell className="w-[15%] font-normal text-gray-600 truncate">
                        {item.code}
                      </TableCell>
                      <TableCell className="text-left text-gray-900 truncate">
                        {item.name}
                      </TableCell>
                      <TableCell className="w-[12%] text-right">
                        <Badge variant="blueLight" size={'lg'}>
                          {getUnitSymbol(item.items?.[0]?.unitKind)}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[20%] text-start whitespace-nowrap">
                        {parseCurrencyToBrl(price.value)}
                        {price.unit && (
                          <span className="text-gray-500">{price.unit}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <FeaturedIcon
                  Icon={IconBoxOff}
                  size="xl"
                  variant="borderedLight"
                  rounded
                />
                <p className="font-semibold text-lg mt-4 mb-1">
                  Nenhum produto encontrado
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
