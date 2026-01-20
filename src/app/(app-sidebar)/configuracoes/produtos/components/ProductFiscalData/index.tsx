'use client'

// React
import { useEffect } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconReceipt, IconCircleCheck } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  productFiscalDataSchema,
  type ProductFiscalDataFormType,
  defaultFiscalDataValues,
  icmsOriginOptions,
  icmsCstOptions,
  icmsBaseModalityOptions,
  pisCstOptions,
  ipiCstOptions,
  commercialUnitOptions,
} from './schema'

// Actions
import { createItemNew, getData } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName?: string
}

async function fetchFiscalData(productId: string) {
  try {
    const response = await getData({
      route: `/fiscal/product/${productId}`,
    })

    if (response.success && response.data) {
      return response.data
    }
    return null
  } catch (error) {
    return null
  }
}

export function ProductFiscalDataDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: Props) {
  const queryClient = useQueryClient()

  const { data: fiscalData, isLoading } = useQuery({
    queryKey: ['product-fiscal-data', productId],
    queryFn: () => fetchFiscalData(productId),
    enabled: open && !!productId,
  })

  const form = useForm<ProductFiscalDataFormType>({
    resolver: zodResolver(productFiscalDataSchema),
    defaultValues: defaultFiscalDataValues,
  })

  // Load existing data into form
  useEffect(() => {
    if (fiscalData) {
      form.reset({
        productCode: fiscalData.productCode || '',
        commercialUnit: fiscalData.commercialUnit || 'UN',
        ncm: fiscalData.ncm || '',
        cean: fiscalData.cean || '',
        icmsOrigin: fiscalData.icmsOrigin || '0',
        icmsCst: fiscalData.icmsCst || '102',
        icmsRate: fiscalData.icmsRate || undefined,
        icmsCreditRate: fiscalData.icmsCreditRate || undefined,
        icmsBaseModality: fiscalData.icmsBaseModality || '3',
        pisCst: fiscalData.pisCst || '07',
        pisRate: fiscalData.pisRate || undefined,
        cofinsCst: fiscalData.cofinsCst || '07',
        cofinsRate: fiscalData.cofinsRate || undefined,
        ipiFramework: fiscalData.ipiFramework || '0',
        ipiCst: fiscalData.ipiCst || '',
        ipiRate: fiscalData.ipiRate || undefined,
        cfopInState: fiscalData.cfopInState || '5102',
        cfopOutState: fiscalData.cfopOutState || '6102',
        cfopExport: fiscalData.cfopExport || '7102',
      })
    } else {
      form.reset(defaultFiscalDataValues)
    }
  }, [fiscalData, form])

  async function onSubmit(data: ProductFiscalDataFormType) {
    try {
      const result = await createItemNew({
        route: `/fiscal/product/upsert`,
        data: { ...data, productId },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao salvar dados fiscais')
        return
      }

      toast.success('Dados fiscais salvos com sucesso!')

      // Invalidate both the specific item and the list
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['product-fiscal-data', productId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['products-fiscal'],
        })
      ])

      onOpenChange(false)
    } catch (error) {
      toast.error('Erro ao salvar dados fiscais')
      console.error(error)
    }
  }

  function handleClose() {
    form.reset(defaultFiscalDataValues)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconReceipt} />
              <span>Configuração do Item</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <Form {...form}>
              <form
                id="product-fiscal-data"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
                noValidate
              >
                {/* Item */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">Item</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do produto</Label>
                      <Input
                        value={productName || ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <FormInput
                      name="productCode"
                      label="Código"
                      placeholder="Digite aqui"
                    />
                    <FormSelect
                      name="commercialUnit"
                      label="Unidade comercial"
                      options={commercialUnitOptions}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                      name="ncm"
                      label="NCM"
                      placeholder="00000000"
                      maxLength={8}
                    />
                    <FormInput
                      name="cean"
                      label="CEAN"
                      placeholder="Digite aqui"
                    />
                  </div>
                </div>

                {/* ICMS */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">ICMS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      name="icmsOrigin"
                      label="Origem da mercadoria"
                      options={icmsOriginOptions}
                    />
                    <FormSelect
                      name="icmsCst"
                      label="CST ICMS"
                      options={icmsCstOptions}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      name="icmsRate"
                      label="Alíquota ICMS"
                      type="number"
                      placeholder="00.00"
                    />
                    <FormInput
                      name="icmsCreditRate"
                      label="Alíquota Crédito ICMS"
                      type="number"
                      placeholder="00.00"
                    />
                    <FormSelect
                      name="icmsBaseModality"
                      label="Origem da mercadoria"
                      options={icmsBaseModalityOptions}
                    />
                  </div>
                </div>

                {/* PIS COFINS */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">PIS COFINS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      name="pisCst"
                      label="CST PIS"
                      options={pisCstOptions}
                    />
                    <FormInput
                      name="pisRate"
                      label="Alíquota PIS"
                      type="number"
                      placeholder="00.00"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSelect
                      name="cofinsCst"
                      label="CST COFINS"
                      options={pisCstOptions}
                    />
                    <FormInput
                      name="cofinsRate"
                      label="Alíquota COFINS"
                      type="number"
                      placeholder="00.00"
                    />
                  </div>
                </div>

                {/* IPI */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">IPI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      name="ipiFramework"
                      label="Enquadramento"
                      placeholder="0"
                    />
                    <FormSelect
                      name="ipiCst"
                      label="CST IPI"
                      options={ipiCstOptions}
                      placeholder="Selecione"
                    />
                    <FormInput
                      name="ipiRate"
                      label="Alíquota IPI"
                      type="number"
                      placeholder="00.00"
                    />
                  </div>
                </div>
              </form>
            </Form>
          )}
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="product-fiscal-data"
            RightIcon={IconCircleCheck}
            disabled={form.formState?.isSubmitting}
            isLoading={form.formState?.isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
