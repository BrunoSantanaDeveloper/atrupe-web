'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

// Hooks
import { useAlertDialog } from '@/store/useAlertDialog'

// UI
import { toast } from 'sonner'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogDescription,
} from '@/components/ui/dialog'

import { cn } from '@/lib/utils'

// Components
import { InvoiceFormHeader } from './InvoiceFormHeader'
import { InvoiceEmissionConfigSection } from '../../components/InvoiceEmissionConfigSection'
import { InvoiceRecipientSection } from './InvoiceRecipientSection'
import { InvoiceItems } from './InvoiceItems'
import { InvoicePayment } from './InvoicePayment'
import { Topbar } from '@/components/common/Topbar'
import { InvoiceTransport } from './InvoiceTransport'
import { InvoiceDownloadAuth } from './InvoiceDownloadAuth'
import { InvoiceTotalsSection } from './InvoiceTotalsSection'
import { InvoiceRecipientEditDialog } from './InvoiceRecipientEditDialog'
import {
  ClientSelect,
  clientToNfeRecipient,
} from '../../avulsa/components/ClientSelect'

// Icons
import {
  IconMessage,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconBan,
  IconUserSearch,
} from '@tabler/icons-react'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
  NfePrepareDestinatario,
} from '@/types/fiscal/nfe-prepare'
import type { ClientData } from '../../avulsa/components/ClientSelect'

interface Props {
  id?: string
  orderIds?: string[]
}

export function IssueInvoiceForm({ id, orderIds }: Props) {
  const alertDialog = useAlertDialog()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [originalItems, setOriginalItems] = useState<
    NfePrepareResponse['items'] | null
  >(null)
  const [isRecipientEditOpen, setIsRecipientEditOpen] = useState(false)
  const [isClientChangeOpen, setIsClientChangeOpen] = useState(false)
  const isConsolidated = Boolean(orderIds?.length)

  // Fetch data on mount - create or get draft
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createItemNew(
        isConsolidated
          ? {
              route: '/fiscal/nfe/draft/consolidated',
              data: { orderIds },
            }
          : {
              route: `/fiscal/nfe/draft/${id}`,
              data: {},
            },
      )

      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar dados da NF-e')
      }

      const preparedData = {
        ...result.data,
        volumes: result.data.volumes || [],
        duplicatas: result.data.duplicatas || [],
        autXml: result.data.autXml || [],
      }

      setData(preparedData)
      setOriginalItems(
        preparedData.items.map((item: NfePrepareItem) => ({ ...item })),
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [id, isConsolidated, orderIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Recalculate totais from current items whenever data changes
  const computedTotais = data
    ? (() => {
        const productItems = data.items.filter((item) => !item.isService)
        const valorProdutos = productItems.reduce(
          (sum, item) => sum + item.unitValue * item.quantity,
          0,
        )
        const valorDesconto = productItems.reduce(
          (sum, item) => sum + item.discount,
          0,
        )
        const valorFrete = productItems.reduce(
          (sum, item) => sum + item.freight,
          0,
        )
        const valorSeguro = productItems.reduce(
          (sum, item) => sum + item.insurance,
          0,
        )
        const valorNota =
          valorProdutos - valorDesconto + valorFrete + valorSeguro
        return {
          ...data.totais,
          valorProdutos: Number(valorProdutos.toFixed(2)),
          valorDesconto: Number(valorDesconto.toFixed(2)),
          valorFrete: Number(valorFrete.toFixed(2)),
          valorSeguro: Number(valorSeguro.toFixed(2)),
          valorNota: Number(valorNota.toFixed(2)),
        }
      })()
    : null

  // Check if any item value was manually edited vs original
  const valuesModified =
    originalItems != null &&
    data != null &&
    data.items.some((item) => {
      const orig = originalItems.find((o) => o.itemNumber === item.itemNumber)
      if (!orig) return false
      return (
        item.unitValue !== orig.unitValue ||
        item.quantity !== orig.quantity ||
        item.discount !== orig.discount ||
        item.freight !== orig.freight ||
        item.insurance !== orig.insurance
      )
    })

  // Handle emit
  const handleEmit = async () => {
    if (!data) return

    const referencedKey = (data.emissao.nfeReferenciada || '').replace(
      /\D/g,
      '',
    )
    if (referencedKey.length > 0 && referencedKey.length !== 44) {
      toast.error('A NF-e referenciada deve conter uma chave com 44 digitos.')
      return
    }

    const invalidItems = data.items.filter((item) => item.needsConfiguration)
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map((i) => i.description).join(', ')
      toast.error(
        `Existem produtos que precisam de configuração fiscal: ${itemNames}`,
      )
      return
    }

    const isNfeAuthorized =
      data.hasExistingNfe && data.existingNfe?.status === 'AUTHORIZED'
    if (isNfeAuthorized) {
      toast.info('Esta ordem já possui uma NF-e autorizada.')
      if (data.existingNfe?.danfeUrl) {
        window.open(data.existingNfe.danfeUrl, '_blank')
      }
      return
    }

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: isConsolidated
          ? '/fiscal/nfe/emit-consolidated'
          : '/fiscal/nfe/emit-full',
        data: {
          orderId: data.orderId,
          orderIds: data.orderIds,
          quotationId: data.quotationId,
          operationNature: data.emissao.operationNature,
          tipo: data.emissao.tipo,
          finalidade: data.emissao.finalidade,
          consumidorFinal: data.emissao.consumidorFinal,
          presencaConsumidor: data.emissao.presencaConsumidor,
          dataSaida: data.emissao.dataSaida,
          nfeReferenciada: referencedKey || null,
          additionalInfo: data.informacoesComplementares,
          destCnpjCpf: data.destinatario.cnpjCpf,
          destNome: data.destinatario.razaoSocial,
          destIe: data.destinatario.ie,
          destEmail: data.destinatario.email,
          destEndereco: data.destinatario.endereco,
          destNumero: data.destinatario.numero,
          destComplemento: data.destinatario.complemento,
          destBairro: data.destinatario.bairro,
          destCep: data.destinatario.cep,
          destMunicipio: data.destinatario.cidade,
          destUf: data.destinatario.estado,
          destPais: data.destinatario.pais,
          items: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitValue: item.unitValue,
            discount: item.discount,
            description: item.description,
            ncm: item.ncm,
            cfop: item.cfop ? Number(item.cfop) : undefined,
            uCom: item.uCom,
            ean: item.ean,
            ceantrib: item.ceantrib,
            cstIcms: item.cstIcms,
            cstPis: item.cstPis,
            cstCofins: item.cstCofins,
            cstIpi: item.cstIpi,
            freight: item.freight,
            insurance: item.insurance,
          })),
          transportadora: data.transportadora,
          volumes: data.volumes,
          pagamento: {
            forma: data.pagamento?.forma,
            valor: data.pagamento?.valor,
          },
          duplicatas: data.duplicatas,
          autXml: data.autXml,
          modalidadeFrete: data.emissao.modalidadeFrete,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NF-e')
      }

      toast.success('NF-e emitida com sucesso!')
      router.push('/nota-fiscal/emitidas')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir NF-e'
      alertDialog.open({
        title: 'Erro na emissão da NF-e',
        description: message,
        Icon: IconBan,
        iconVariant: 'error',
        confirmLabel: 'Entendi',
        cancelLabel: '',
        onConfirm: () => {},
      })
    } finally {
      setIsEmitting(false)
    }
  }

  const handleEmissionUpdate = async (
    updatedData: NfePrepareResponse,
    options?: { persist?: boolean },
  ) => {
    setData(updatedData)

    if (!updatedData.draftId || options?.persist === false) return

    try {
      const result = await updateItemNew({
        route: `/fiscal/nfe/draft/${updatedData.draftId}`,
        data: { emissao: updatedData.emissao },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar configuracao')
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar configuracao'
      toast.error(message)
    }
  }

  // Handle recipient update — persist to draft + optionally update client cadastro
  const handleRecipientSave = async (
    updatedDestinatario: NfePrepareDestinatario,
    options: { updateClient: boolean },
  ) => {
    if (!data || !data.draftId) return

    try {
      // 1. Persist to draft
      const result = await updateItemNew({
        route: `/fiscal/nfe/draft/${data.draftId}`,
        data: { destinatario: updatedDestinatario },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar destinatário')
      }

      // 2. Optionally update client cadastro
      if (options.updateClient && data.clientId) {
        try {
          await updateItemNew({
            route: `/client/${data.clientId}`,
            data: {
              general: {
                stateRegistration: updatedDestinatario.ie,
              },
            },
          })
          toast.success('Destinatário e cadastro do cliente atualizados')
        } catch {
          toast.warning(
            'Destinatário salvo, mas não foi possível atualizar o cadastro do cliente.',
          )
        }
      } else {
        toast.success('Destinatário salvo com sucesso')
      }

      setData({ ...data, destinatario: updatedDestinatario })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar destinatário'
      toast.error(message)
    }
  }

  // Handle client change from ClientSelect dialog
  const handleClientChange = (client: ClientData | null) => {
    if (!client || !data) return

    const recipient = clientToNfeRecipient(client)
    const updatedDestinatario: NfePrepareDestinatario = {
      razaoSocial: recipient.destNome,
      cnpjCpf: recipient.destCnpjCpf,
      ie: recipient.destIe,
      email: recipient.destEmail,
      telefone: '',
      cep: recipient.destCep,
      estado: recipient.destUf,
      cidade: recipient.destMunicipio,
      bairro: recipient.destBairro,
      endereco: recipient.destEndereco,
      numero: recipient.destNumero,
      complemento: recipient.destComplemento,
      pais: 'Brasil',
    }

    setData({
      ...data,
      destinatario: updatedDestinatario,
      clientId: client.id,
    })

    setIsClientChangeOpen(false)
    toast.success(`Cliente alterado para "${client.name}"`)
  }

  // Handle add product
  const handleAddProduct = (item: NfePrepareItem) => {
    if (!data) return
    setData({
      ...data,
      items: [...data.items, item],
    })
    toast.success(`Produto "${item.description}" adicionado`)
  }

  // Handle remove item
  const handleRemoveItem = (itemNumber: number) => {
    if (!data) return
    const newItems = data.items
      .filter((item) => item.itemNumber !== itemNumber)
      .map((item, idx) => ({
        ...item,
        itemNumber: idx + 1,
      }))
    setData({ ...data, items: newItems })
  }

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar
            title={
              isConsolidated ? 'Emissão consolidada de NF-e' : 'Emissão de NF-e'
            }
            previousPage="/nota-fiscal/emitir"
          />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar
            title={
              isConsolidated ? 'Emissão consolidada de NF-e' : 'Emissão de NF-e'
            }
            previousPage="/nota-fiscal/emitir"
          />
          <Card className="border-error-200 bg-error-50">
            <CardContent className="flex items-center gap-4 py-6">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <p className="font-semibold text-error-700">
                  Erro ao carregar dados
                </p>
                <p className="text-sm text-error-600">
                  {error || 'Dados não encontrados'}
                </p>
              </div>
              <Button
                variant="neutralOutline"
                onClick={fetchData}
                className="ml-auto"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        <InvoiceFormHeader
          data={data}
          isEmitting={isEmitting}
          onEmit={handleEmit}
        />

        {/* Alert Area */}
        {data.emissao.ambiente === 'HOMOLOGACAO' && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          <InvoiceEmissionConfigSection
            data={data}
            onUpdate={handleEmissionUpdate}
          />

          <InvoiceRecipientSection
            destinatario={data.destinatario}
            onEditClick={() => setIsRecipientEditOpen(true)}
            onChangeClientClick={() => setIsClientChangeOpen(true)}
          />

          <InvoiceItems
            data={data}
            onUpdate={setData}
            onAddProduct={handleAddProduct}
            onRemoveItem={handleRemoveItem}
          />

          <InvoiceTransport data={data} onUpdate={setData} />

          <InvoicePayment
            data={data}
            onUpdate={setData}
            computedValorNota={
              computedTotais?.valorNota ?? data?.totais?.valorNota ?? 0
            }
          />

          <InvoiceDownloadAuth data={data} onUpdate={setData} />

          {/* Info Complementar */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="info" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconMessage} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Informações complementares
                    </CardTitle>
                  </div>
                  <AccordionTrigger
                    className={cn(
                      buttonVariants({
                        variant: 'neutralLight',
                        size: 'icon',
                      }),
                      'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                    )}
                  />
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-6">
                    <Textarea
                      value={data.informacoesComplementares}
                      onChange={(e) =>
                        setData({
                          ...data,
                          informacoesComplementares: e.target.value,
                        })
                      }
                      placeholder="Texto que aparecerá no campo de informações adicionais da NF-e (ex.: dados fiscais, condições especiais, etc.)"
                      rows={4}
                      className="resize-none text-sm text-gray-700"
                    />
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          <InvoiceTotalsSection
            totais={computedTotais ?? data.totais}
            valuesModified={valuesModified}
          />
        </div>
      </div>

      {/* Recipient Edit Dialog */}
      <InvoiceRecipientEditDialog
        open={isRecipientEditOpen}
        onOpenChange={setIsRecipientEditOpen}
        destinatario={data.destinatario}
        clientId={data.clientId}
        onSave={handleRecipientSave}
      />

      {/* Change Client Dialog */}
      <Dialog open={isClientChangeOpen} onOpenChange={setIsClientChangeOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                <FeaturedIcon variant="neutralOutline" Icon={IconUserSearch} />
                <span>Trocar cliente / destinatário</span>
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <ClientSelect
              onSelect={handleClientChange}
              label="Buscar cliente"
              placeholder="Buscar por nome ou CNPJ/CPF..."
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
