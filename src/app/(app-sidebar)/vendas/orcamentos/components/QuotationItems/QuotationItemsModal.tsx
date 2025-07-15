// React
import { useCallback, useMemo } from 'react'

// UI
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

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

const schema = z.object({
  search: z.string().optional(),
  sectorId: z.string(),
  categoryId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const QuotationItemsModal: React.FC<{
  open: boolean
}> = ({ open }) => {
  const { quotationData, updateQuotationData, openChangeModal } = useQuotation()

  const { data: productsList } = useProducts()

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

  const calculateTotalItemsPrice = useCallback((product: IProduct): number => {
    return product.items.reduce((total, item) => {
      return total + item.salePrice * (item?.quantity ?? 1)
    }, 0)
  }, [])

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
                autoComplete="off"
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
          {filteredProducts.length > 0 ? (
            <Table>
              <TableBody>
                {filteredProducts?.map((item) => (
                  <TableRow key={item.id}>
                    <Button
                      variant="raw"
                      className="w-full h-full px-0"
                      form="form-id"
                      onClick={() => {
                        updateQuotationData({
                          productId: item.id,
                        })
                        // createQueryString('productId', item.id)
                        // form.handleSubmit(onSubmit)()
                      }}
                    >
                      <TableCell className="w-[10%] font-normal text-gray-600">
                        {item.code}
                      </TableCell>
                      <TableCell className="w-full text-left text-gray-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="w-[10%] text-right">
                        <Badge variant="blueLight" size={'lg'}>
                          Un
                        </Badge>
                      </TableCell>
                      <TableCell className="w-full max-w-[15%] text-start">
                        {parseCurrencyToBrl(
                          item?.items?.length > 0
                            ? calculateTotalItemsPrice(item)
                            : (item?.salePrice ?? 0),
                        )}
                      </TableCell>
                    </Button>
                  </TableRow>
                ))}
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

export default QuotationItemsModal
