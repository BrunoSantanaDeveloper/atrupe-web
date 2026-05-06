'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

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

import { cn } from '@/lib/utils'

// Components - reuse from order-based form
import { InvoiceRecipientSection } from '../../../[orderId]/components/InvoiceRecipientSection'
import { InvoiceRecipientEditDialog } from '../../../[orderId]/components/InvoiceRecipientEditDialog'
import { InvoiceItems } from '../../../[orderId]/components/InvoiceItems'
import { InvoicePayment } from '../../../[orderId]/components/InvoicePayment'
import { InvoiceTransport } from '../../../[orderId]/components/InvoiceTransport'
import { InvoiceTotalsSection } from '../../../[orderId]/components/InvoiceTotalsSection'
import { InvoiceDownloadAuth } from '../../../[orderId]/components/InvoiceDownloadAuth'

// Standalone-specific components
import {
  ClientSelect,
  clientToNfeRecipient,
} from '../../components/ClientSelect'
import { ProductSelector } from './ProductSelector'

// Icons
import {
  IconMessage,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconX,
  IconSend,
  IconTrash,
} from '@tabler/icons-react'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'

// Components - shared
import { CustomButton } from '@/components/common/CustomButton'
import { Badge } from '@/components/ui/badge'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
  NfePrepareDestinatario,
} from '@/types/fiscal/nfe-prepare'
import type { ClientData } from '../../components/ClientSelect'

export function StandaloneNfeForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [isRecipientEditOpen, setIsRecipientEditOpen] = useState(false)

  const router = useRouter()

  // Fetch emitter defaults on mount
  const fetchData = useCallback(async (clientId?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const route = clientId
        ? `/fiscal/nfe/prepare-standalone?clientId=${clientId}`
        : '/fiscal/nfe/prepare-standalone'

      const result = await getItem({ route })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar dados da NF-e')
      }

      const preparedData: NfePrepareResponse = {
        ...result.data,
        volumes: result.data.volumes || [],
        duplicatas: result.data.duplicatas || [],
        autXml: result.data.autXml || [],
      }

      setData(preparedData)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle client selection
  const handleClientSelect = useCallback(
    async (client: ClientData | null) => {
      setSelectedClient(client)

      if (!client) {
        // Clear recipient — re-fetch without clientId
        fetchData()
        return
      }

      // Use clientToNfeRecipient to map client data directly into destinatario
      if (data) {
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
        })
      }
    },
    [data, fetchData],
  )

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

  // Handle add product from ProductSelector
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

    setData({
      ...data,
      items: newItems,
    })
  }

  // Handle recipient update
  const handleRecipientSave = (
    updatedDestinatario: NfePrepareResponse['destinatario'],
  ) => {
    if (!data) return

    setData({ ...data, destinatario: updatedDestinatario })
    toast.success('Destinatário atualizado')
  }

  // Handle emit
  const handleEmit = async () => {
    if (!data) return

    if (data.items.length === 0) {
      toast.error('Adicione pelo menos um item antes de emitir a NF-e.')
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

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/emit-full',
        data: {
          operationNature: data.emissao.operationNature,
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
      toast.error(message)
    } finally {
      setIsEmitting(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-64" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Note: We no longer show a full-page error state.
  // The ClientSelect is always visible so the user can select a client
  // even when the prepare-standalone API fails. Data-dependent sections
  // are conditionally rendered below.

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="iconSm"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/nota-fiscal/emitir/avulsa')}
                aria-label="Voltar para emissão avulsa"
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Nota Fiscal Avulsa - NF-e
                </h1>
                <Badge variant="blueLight" className="ml-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  Em digitação
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <CustomButton
              icon={IconX}
              title="Cancelar digitação"
              iconVariant="errorLight"
              onClick={() => router.push('/nota-fiscal/emitir/avulsa')}
            />
            <CustomButton
              icon={IconSend}
              title={isEmitting ? 'Emitindo...' : 'Emitir NF-e'}
              iconVariant="light"
              onClick={handleEmit}
              disabled={isEmitting || !data}
              isLoading={isEmitting}
            />
          </div>
        </div>

        {/* Alert Area */}
        {data?.emissao.ambiente === 'HOMOLOGACAO' && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Error banner — non-fatal, form still renders */}
        {error && (
          <Card className="border-error-200 bg-error-50">
            <CardContent className="flex items-center gap-4 py-6">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <p className="font-semibold text-error-700">
                  Erro ao carregar dados
                </p>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                variant="neutralOutline"
                onClick={() => fetchData()}
                className="ml-auto"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Client Selection — always visible */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <ClientSelect
                onSelect={handleClientSelect}
                selectedClient={selectedClient}
                label="Cliente / Destinatário"
                placeholder="Selecione o destinatário da NF-e..."
              />
            </CardContent>
          </Card>

          {/* Data-dependent sections — only rendered when prepare data is available */}
          {data && (
            <>
              {/* Emission Config */}
              <Card className="border-none shadow-sm overflow-hidden">
                <Accordion type="single" collapsible defaultValue="config">
                  <AccordionItem value="config" className="p-0 m-0 border-0">
                    <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                      <div className="flex gap-3 items-center">
                        <FeaturedIcon
                          variant="neutralOutline"
                          Icon={IconMessage}
                        />
                        <CardTitle className="text-gray-700 font-semibold text-base">
                          Configuração de emissão
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
                      <CardContent className="p-0">
                        <div className="flex flex-col">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Emissor
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.emissor}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                CNPJ
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.emissorCnpj}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Natureza da operação
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.operationNature}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Próximo documento
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.proximoDocumento}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Finalidade
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.finalidade} - NF-e normal
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Consumidor final
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.consumidorFinal === 1
                                  ? '1 - Sim'
                                  : '0 - Não'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Modalidade de frete
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.modalidadeFrete !== undefined
                                  ? data.emissao.modalidadeFrete
                                  : '9 - Sem ocorrência de transporte'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Ambiente
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {data.emissao.ambiente === 'HOMOLOGACAO'
                                  ? 'Homologação'
                                  : 'Produção'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>

              {/* Recipient */}
              <InvoiceRecipientSection
                destinatario={data.destinatario}
                onEditClick={() => setIsRecipientEditOpen(true)}
              />

              {/* Items + Product Selector */}
              <div className="space-y-4">
                <InvoiceItems data={data} onUpdate={setData} />

                {/* Add Product + Remove buttons */}
                <div className="flex flex-wrap gap-2">
                  <ProductSelector
                    onAddProduct={handleAddProduct}
                    nextItemNumber={data.items.length + 1}
                    defaultCfop={
                      (data as NfePrepareResponse & { defaultCfop?: string })
                        .defaultCfop || '5101'
                    }
                  />

                  {data.items.length > 0 && (
                    <Button
                      variant="neutralGhost"
                      LeftIcon={IconTrash}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50"
                      onClick={() => {
                        const lastItem = data.items[data.items.length - 1]
                        if (lastItem) handleRemoveItem(lastItem.itemNumber)
                      }}
                    >
                      Remover último item
                    </Button>
                  )}
                </div>
              </div>

              {/* Transport */}
              <InvoiceTransport data={data} onUpdate={setData} />

              {/* Payment */}
              <InvoicePayment data={data} onUpdate={setData} />

              {/* Download Auth */}
              <InvoiceDownloadAuth data={data} onUpdate={setData} />

              {/* Info Complementar */}
              <Card className="border-none shadow-sm overflow-hidden">
                <Accordion type="single" collapsible>
                  <AccordionItem value="info" className="p-0 m-0 border-0">
                    <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                      <div className="flex gap-3 items-center">
                        <FeaturedIcon
                          variant="neutralOutline"
                          Icon={IconMessage}
                        />
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
                        <p className="text-sm text-gray-500 italic">
                          {data.informacoesComplementares ||
                            'Nenhuma informação adicional'}
                        </p>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>

              {/* Totals */}
              <InvoiceTotalsSection totais={computedTotais ?? data.totais} />
            </>
          )}
        </div>
      </div>

      {/* Recipient Edit Dialog */}
      {data && (
        <InvoiceRecipientEditDialog
          open={isRecipientEditOpen}
          onOpenChange={setIsRecipientEditOpen}
          destinatario={data.destinatario}
          onSave={handleRecipientSave}
        />
      )}
    </TooltipProvider>
  )
}
