'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'

// Icons
import {
  IconPencil,
  IconDeviceFloppy,
  IconCloudUpload,
  IconCurrencyReal,
  IconReceipt,
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
import { createItemNew, getItem, updateItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

// ─── Currency helpers (same pattern as InvoicePayment) ────────────────────────

/** Formata número para string BRL sem o símbolo R$ (ex: "4.000,00") */
function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Converte string digitada (ex: "4.000,00" ou "4000.00") para number */
function parseBRL(raw: string): number {
  // Remove pontos de milhar, troca vírgula decimal por ponto
  const normalized = raw.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? 0 : Number(num.toFixed(2))
}

// ─── Currency Input ────────────────────────────────────────────────────────────

interface CurrencyInputProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

function CurrencyInput({
  id,
  label,
  value,
  onChange,
  disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatBRL(value))

  // Sync display when value changes externally (e.g. total recalculation)
  useEffect(() => {
    setDisplay(formatBRL(value))
  }, [value])

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none select-none">
          R$
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={display}
          disabled={disabled}
          className={
            disabled ? 'pl-9 bg-gray-50 font-semibold text-gray-700' : 'pl-9'
          }
          placeholder="0,00"
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9,.]/g, '')
            setDisplay(raw)
          }}
          onBlur={() => {
            const parsed = parseBRL(display)
            onChange(parsed)
            setDisplay(formatBRL(parsed))
          }}
          onFocus={(e) => e.target.select()}
        />
      </div>
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NfePrepareItem
  onSave: (updatedItem: NfePrepareItem) => void
  /** Se fornecido, habilita o botão "Salvar no produto" */
  productId?: string
  /** Aba inicial ao abrir o dialog (default: 'valores') */
  initialTab?: 'valores' | 'fiscal'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoiceItemEditDialog({
  open,
  onOpenChange,
  item,
  onSave,
  productId,
  initialTab = 'valores',
}: Props) {
  const [formData, setFormData] = useState<NfePrepareItem>(item)
  const [isSavingToProduct, setIsSavingToProduct] = useState(false)
  const [activeTab, setActiveTab] = useState<'valores' | 'fiscal'>(initialTab)

  // Form fiscal — instância separada para os dados fiscais
  const fiscalForm = useForm<ProductFiscalDataFormType>({
    resolver: zodResolver(productFiscalDataSchema),
    defaultValues: defaultFiscalDataValues,
  })

  // Sincronizar quando o item mudar ou o dialog abrir
  useEffect(() => {
    if (open) {
      setFormData(item)
      setActiveTab(initialTab)
      fiscalForm.reset({
        ...defaultFiscalDataValues,
        productCode: item.productCode || '',
        ncm: item.ncm || '',
        cean: item.ean || '',
        icmsCst: item.cstIcms || '102',
        pisCst: item.cstPis || '07',
        cofinsCst: item.cstCofins || '07',
        ipiCst: item.cstIpi || '',
        cfopInState: item.cfop || '5102',
        commercialUnit: item.uCom || 'UN',
      })
    }
  }, [item, open, initialTab, fiscalForm])

  /** Atualiza um campo numérico e recalcula o total */
  const updateField = useCallback(
    (field: keyof NfePrepareItem, value: number) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value }
        const qty = field === 'quantity' ? value : prev.quantity
        const unit = field === 'unitValue' ? value : prev.unitValue
        const disc = field === 'discount' ? value : prev.discount
        const frt = field === 'freight' ? value : prev.freight
        const ins = field === 'insurance' ? value : prev.insurance
        next.totalValue = Number((qty * unit - disc + frt + ins).toFixed(2))
        return next
      })
    },
    [],
  )

  /** Constrói o item final mesclando valores e dados fiscais */
  const buildUpdatedItem = (
    fiscal: ProductFiscalDataFormType,
  ): NfePrepareItem => ({
    ...formData,
    productCode: fiscal.productCode || formData.productCode,
    ncm: fiscal.ncm || formData.ncm,
    ean: fiscal.cean || formData.ean,
    cfop: fiscal.cfopInState || formData.cfop,
    cstIcms: fiscal.icmsCst || formData.cstIcms,
    cstPis: fiscal.pisCst || formData.cstPis,
    cstCofins: fiscal.cofinsCst || formData.cstCofins,
    cstIpi: fiscal.ipiCst || formData.cstIpi,
    uCom: fiscal.commercialUnit || formData.uCom,
    needsConfiguration: false,
  })

  /** "Alterar somente para NF" */
  const handleSaveForNfOnly = async () => {
    const isValid = await fiscalForm.trigger()
    if (!isValid) return

    const fiscal = fiscalForm.getValues()
    if (fiscal.ncm && fiscal.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }

    onSave(buildUpdatedItem(fiscal))
    onOpenChange(false)
    toast.success('Item atualizado para esta NF')
  }

  /** "Salvar no produto" */
  const handleSaveToProduct = async () => {
    if (!productId) return

    const isValid = await fiscalForm.trigger()
    if (!isValid) return

    const fiscal = fiscalForm.getValues()
    if (fiscal.ncm && fiscal.ncm.replace(/\D/g, '').length !== 8) {
      toast.error('O NCM deve conter 8 dígitos')
      return
    }

    setIsSavingToProduct(true)
    try {
      // Busca o produto para obter id, name e unitKind dos itens existentes
      // (necessário pois o DTO exige esses campos ao atualizar itens)
      const productResult = await getItem({ route: `/product/${productId}` })
      if (!productResult.success) {
        throw new Error('Não foi possível carregar o produto para atualizar')
      }

      const existingItems: Array<{
        id: string
        name: string
        unitKind: string
      }> = productResult.data?.items ?? []

      // Monta payload preservando id/name/unitKind dos itens existentes
      const itemsPayload = existingItems.map((existingItem) => ({
        id: existingItem.id,
        name: existingItem.name,
        unitKind: existingItem.unitKind,
        unitCost: formData.unitValue,
        salePrice: formData.unitValue,
      }))

      // Se o produto não tem itens ainda, cria um novo com os dados disponíveis
      if (itemsPayload.length === 0) {
        itemsPayload.push({
          id: undefined as unknown as string,
          name: formData.description,
          unitKind: 'UNITY',
          unitCost: formData.unitValue,
          salePrice: formData.unitValue,
        })
      }

      const valueResult = await updateItemNew({
        route: `/product/${productId}`,
        data: { items: itemsPayload },
      })
      if (!valueResult.success) {
        throw new Error(
          valueResult.message || 'Erro ao salvar valores no produto',
        )
      }

      const fiscalResult = await createItemNew({
        route: '/fiscal/product/upsert',
        data: { ...fiscal, productId },
      })
      if (!fiscalResult.success) {
        throw new Error(fiscalResult.message || 'Erro ao salvar dados fiscais')
      }

      onSave(buildUpdatedItem(fiscal))
      onOpenChange(false)
      toast.success('Valores e dados fiscais salvos no produto e na NF')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao salvar no produto',
      )
    } finally {
      setIsSavingToProduct(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[740px] flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <div>
                <span>Editar Item</span>
                <p className="text-sm font-normal text-gray-500 mt-0.5">
                  {item.itemNumber} — {item.description}
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        {/* Tabs: Valores | Dados Fiscais */}
        <div className="border-b border-gray-100 px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'valores' | 'fiscal')}
          >
            <TabsList className="-mb-px">
              <TabsTrigger value="valores" className="gap-1.5">
                <IconCurrencyReal size={14} />
                Valores
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="gap-1.5">
                <IconReceipt size={14} />
                Dados Fiscais
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <DialogBody className="flex-1 p-6 pb-2">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'valores' | 'fiscal')}
          >
            {/* Aba Valores */}
            <TabsContent value="valores" className="mt-0">
              <div className="grid grid-cols-2 gap-4 pb-4">
                {/* Quantidade — campo numérico simples (sem R$) */}
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantidade</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min={0.001}
                    step="any"
                    value={formData.quantity}
                    onChange={(e) =>
                      updateField('quantity', Number(e.target.value))
                    }
                  />
                </div>

                <CurrencyInput
                  id="edit-unit-value"
                  label="Valor Unitário"
                  value={formData.unitValue}
                  onChange={(v) => updateField('unitValue', v)}
                />

                <CurrencyInput
                  id="edit-discount"
                  label="Desconto"
                  value={formData.discount}
                  onChange={(v) => updateField('discount', v)}
                />

                <CurrencyInput
                  id="edit-freight"
                  label="Frete"
                  value={formData.freight}
                  onChange={(v) => updateField('freight', v)}
                />

                <CurrencyInput
                  id="edit-insurance"
                  label="Seguro"
                  value={formData.insurance}
                  onChange={(v) => updateField('insurance', v)}
                />

                <CurrencyInput
                  id="edit-total-value"
                  label="Valor Total (calculado)"
                  value={formData.totalValue}
                  onChange={() => {}}
                  disabled
                />
              </div>
            </TabsContent>

            {/* Aba Dados Fiscais */}
            <TabsContent value="fiscal" className="mt-0 pb-4">
              <Form {...fiscalForm}>
                <form
                  id="edit-item-fiscal"
                  onSubmit={(e) => e.preventDefault()}
                  noValidate
                >
                  <ProductFiscalTab />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogBody>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-auto"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="neutralLight"
            LeftIcon={IconDeviceFloppy}
            onClick={handleSaveForNfOnly}
          >
            Alterar somente para NF
          </Button>

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
