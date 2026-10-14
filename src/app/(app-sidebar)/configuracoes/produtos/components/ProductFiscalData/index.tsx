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
import { ProductFiscalTab } from './ProductFiscalTab'
import { ProductStRules } from './ProductStRules'

// Icons
import { IconReceipt, IconCircleCheck } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  productFiscalDataSchema,
  type ProductFiscalDataFormType,
  defaultFiscalDataValues,
} from './schema'

// Actions
import { createItemNew, getData } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

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
  const { hasFiscalModule } = usePlanFeatures()
  const hasModule = hasFiscalModule()

  const { data: fiscalData, isLoading } = useQuery({
    queryKey: ['product-fiscal-data', productId],
    queryFn: () => fetchFiscalData(productId),
    enabled: open && !!productId && hasModule,
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
        // `??` e nao `||`: reducao 0 e' valor legitimo e nao pode virar vazio,
        // que no proximo save apagaria o que estava gravado.
        icmsReducao: fiscalData.icmsReducao ?? undefined,
        icmsBaseModality: fiscalData.icmsBaseModality || '3',
        icmsStMva: fiscalData.icmsStMva ?? undefined,
        icmsStReducao: fiscalData.icmsStReducao ?? undefined,
        icmsStRate: fiscalData.icmsStRate ?? undefined,
        fcpRate: fiscalData.fcpRate ?? undefined,
        fcpStRate: fiscalData.fcpStRate ?? undefined,
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

      toast.success('Dados fiscais salvos')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['product-fiscal-data', productId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['products-fiscal'],
        }),
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

  // Módulo de Nota Fiscal não contratado — nada de configuração fiscal de produto
  if (!hasModule) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconReceipt} />
              <span>Configuração Fiscal do Produto</span>
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
                {/* Nome do produto (readonly) */}
                {productName && (
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Input
                      value={productName}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                )}

                <ProductFiscalTab />
              </form>

              {/* Fora do <form>: e' outro recurso, com endpoints proprios, e
                  formulario aninhado em HTML nao e' valido. */}
              <ProductStRules productId={productId} />
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
