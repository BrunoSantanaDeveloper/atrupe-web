'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

// UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'

// Icons
import {
  IconReceipt,
  IconDeviceFloppy,
  IconCloudUpload,
} from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  productFiscalDataSchema,
  type ProductFiscalDataFormType,
  defaultFiscalDataValues,
} from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData/schema'
import { ProductFiscalTab } from '@/app/(app-sidebar)/configuracoes/produtos/components/ProductFiscalData/ProductFiscalTab'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NfePrepareItem
  onSave: (updatedItem: NfePrepareItem) => void
  /** Se fornecido, habilita o botão "Salvar no produto" */
  productId?: string
}

export function InvoiceItemConfigDialog({
  open,
  onOpenChange,
  item,
  onSave,
  productId,
}: Props) {
  const [isSavingToProduct, setIsSavingToProduct] = useState(false)

  const form = useForm<ProductFiscalDataFormType>({
    resolver: zodResolver(productFiscalDataSchema),
    defaultValues: defaultFiscalDataValues,
  })

  // Sync form when item changes / dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        ...defaultFiscalDataValues,
        productCode: item.productCode || '',
        ncm: item.ncm || '',
        cean: item.ean || '',
        icmsCst: item.cstIcms || '102',
        pisCst: item.cstPis || '07',
        cofinsCst: item.cstCofins || '07',
        ipiCst: item.cstIpi || '',
        cfopInState: item.cfop || '5102',
      })
    }
  }, [item, open, form])

  /** Aplica dados fiscais do form no item da NF */
  const buildUpdatedItem = (
    data: ProductFiscalDataFormType,
  ): NfePrepareItem => ({
    ...item,
    productCode: data.productCode || item.productCode,
    ncm: data.ncm || item.ncm,
    ean: data.cean || item.ean,
    cfop: data.cfopInState || item.cfop,
    cstIcms: data.icmsCst || item.cstIcms,
    cstPis: data.pisCst || item.cstPis,
    cstCofins: data.cofinsCst || item.cstCofins,
    cstIpi: data.ipiCst || item.cstIpi,
    uCom: data.commercialUnit || item.uCom,
    needsConfiguration: false,
  })

  /** "Alterar somente para NF" — salva apenas no estado local */
  const handleSaveForNfOnly = form.handleSubmit((data) => {
    if (data.ncm && data.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }
    onSave(buildUpdatedItem(data))
    onOpenChange(false)
    toast.success('Item atualizado para esta NF')
  })

  /** "Salvar no produto" — persiste via API e também atualiza a NF */
  const handleSaveToProduct = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    if (data.ncm && data.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }

    setIsSavingToProduct(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/product/upsert',
        data: {
          ...data,
          productId: productId!,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar dados fiscais')
      }

      onSave(buildUpdatedItem(data))
      onOpenChange(false)
      toast.success('Dados fiscais salvos no produto e na NF')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao salvar dados fiscais',
      )
    } finally {
      setIsSavingToProduct(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconReceipt} />
              <div>
                <span>Configuração Fiscal do Item</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  {item.itemNumber} — {item.description}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <DialogBody>
            <Form {...form}>
              <form
                id="invoice-item-config"
                onSubmit={handleSaveForNfOnly}
                noValidate
              >
                <ProductFiscalTab />
              </form>
            </Form>
          </DialogBody>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Cancelar
          </Button>

          {/* Alterar somente para NF */}
          <Button
            type="submit"
            form="invoice-item-config"
            variant="neutralLight"
            LeftIcon={IconDeviceFloppy}
          >
            Alterar somente para NF
          </Button>

          {/* Salvar no produto — somente se tiver productId */}
          {productId && (
            <Button
              type="button"
              variant="default"
              LeftIcon={IconCloudUpload}
              onClick={handleSaveToProduct}
              disabled={isSavingToProduct}
              isLoading={isSavingToProduct}
            >
              Salvar no produto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
