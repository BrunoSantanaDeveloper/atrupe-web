'use client'

import { useRouter, useSearchParams } from 'next/navigation'
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

import { cn } from '@/lib/utils'

// Components - reuse from order-based form
import { InvoiceRecipientSection } from '../../../[orderId]/components/InvoiceRecipientSection'
import { InvoiceRecipientEditDialog } from '../../../[orderId]/components/InvoiceRecipientEditDialog'
import { InvoiceItems } from '../../../[orderId]/components/InvoiceItems'
import { InvoicePayment } from '../../../[orderId]/components/InvoicePayment'
import { InvoiceTransport } from '../../../[orderId]/components/InvoiceTransport'
import { InvoiceTotalsSection } from '../../../[orderId]/components/InvoiceTotalsSection'
import { InvoiceDownloadAuth } from '../../../[orderId]/components/InvoiceDownloadAuth'
import { InvoiceEmissionConfigSection } from '../../../components/InvoiceEmissionConfigSection'

// Standalone-specific components
import {
  ClientSelect,
  clientToNfeRecipient,
} from '../../components/ClientSelect'
import {
  getCountryNameByBacen,
  getBacenCodeByName,
} from '@/consts/country-codes'

// Icons
import {
  IconMessage,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconArrowLeft,
  IconX,
  IconSend,
  IconBan,
  IconFilePlus,
  IconEdit,
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
  const alertDialog = useAlertDialog()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [isRecipientEditOpen, setIsRecipientEditOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const devolutionOf = searchParams.get('devolutionOf')
  const complementaryOf = searchParams.get('complementaryOf')
  const reissueOf = searchParams.get('reissueOf')
  const defaultFinality = searchParams.get('defaultFinality')
  const isDevolution = !!devolutionOf || defaultFinality === '4'
  const isComplementary = !!complementaryOf || defaultFinality === '2'
  const isReissue = !!reissueOf

  // Fetch emitter defaults on mount
  const fetchData = useCallback(
    async (clientId?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        let route: string
        if (devolutionOf) {
          route = `/fiscal/nfe/${devolutionOf}/prepare-devolution`
        } else if (complementaryOf) {
          route = `/fiscal/nfe/${complementaryOf}/prepare-complementary`
        } else if (reissueOf) {
          route = `/fiscal/nfe/${reissueOf}/prepare-reissue`
        } else if (clientId) {
          route = `/fiscal/nfe/prepare-standalone?clientId=${clientId}`
        } else {
          route = '/fiscal/nfe/prepare-standalone'
        }

        const result = await getItem({ route })

        if (!result.success) {
          throw new Error(result.message || 'Erro ao carregar dados da NF-e')
        }

        const preparedData: NfePrepareResponse = {
          ...result.data,
          emissao: {
            ...result.data.emissao,
            finalidade: defaultFinality
              ? Number(defaultFinality)
              : result.data.emissao.finalidade,
            ...(defaultFinality === '4' ? { tipo: 0 } : {}),
          },
          volumes: result.data.volumes || [],
          duplicatas: result.data.duplicatas || [],
          autXml: result.data.autXml || [],
        }

        setData(preparedData)

        if (preparedData.destinatario) {
          const countryFriendlyName = getCountryNameByBacen(
            preparedData.destinatario.pais,
          )
          preparedData.destinatario.pais = countryFriendlyName

          if (
            preparedData.destinatario.cnpjCpf ||
            preparedData.destinatario.idEstrangeiro
          ) {
            setSelectedClient({
              id: preparedData.clientId || '',
              name: preparedData.destinatario.razaoSocial,
              cnpjCpf: preparedData.destinatario.cnpjCpf,
              email: preparedData.destinatario.email,
              phone: preparedData.destinatario.telefone,
              address: preparedData.destinatario.endereco,
              addressNumber: preparedData.destinatario.numero,
              complement: preparedData.destinatario.complemento,
              neighborhood: preparedData.destinatario.bairro,
              city: preparedData.destinatario.cidade,
              state: preparedData.destinatario.estado,
              cep: preparedData.destinatario.cep,
              ie: preparedData.destinatario.ie,
              country: countryFriendlyName,
              idEstrangeiro: preparedData.destinatario.idEstrangeiro,
            })
          } else {
            setSelectedClient(null)
          }
        } else {
          setSelectedClient(null)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro ao carregar dados'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    },
    [devolutionOf, complementaryOf, reissueOf, defaultFinality],
  )

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
        const countryFriendlyName = client.country || 'Brasil'
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
          pais: countryFriendlyName,
          idEstrangeiro: recipient.destIdEstrangeiro,
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
    _options?: { updateClient: boolean },
  ) => {
    if (!data) return

    setData({ ...data, destinatario: updatedDestinatario })
    toast.success('Destinatário atualizado')
  }

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

    const dest = data.destinatario
    const isForeign =
      dest.pais && dest.pais !== 'Brasil' && dest.pais !== '1058'
    if (
      !dest.endereco ||
      !dest.numero ||
      (!isForeign &&
        (!dest.bairro || !dest.cep || !dest.cidade || !dest.estado)) ||
      (isForeign && (!dest.cidade || !dest.estado))
    ) {
      toast.error(
        'O destinatário selecionado não possui um endereço completo cadastrado. Edite os dados do destinatário antes de emitir.',
      )
      return
    }

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: '/fiscal/nfe/emit-full',
        data: {
          operationNature: data.emissao.operationNature,
          tipo: data.emissao.tipo,
          finalidade: data.emissao.finalidade,
          consumidorFinal: data.emissao.consumidorFinal,
          presencaConsumidor: data.emissao.presencaConsumidor,
          dataSaida: data.emissao.dataSaida,
          nfeReferenciada: referencedKey || null,
          additionalInfo: data.informacoesComplementares,
          destCnpjCpf: data.destinatario.cnpjCpf || null,
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
          destPais: getBacenCodeByName(data.destinatario.pais),
          destIdEstrangeiro: data.destinatario.idEstrangeiro || null,
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
      router.push('/nota-fiscal/emitir?tab=gestao')
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
                onClick={() => router.push('/nota-fiscal/emitir')}
                aria-label="Voltar para emissão avulsa"
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {isDevolution
                    ? 'NF-e de Devolução'
                    : isComplementary
                      ? 'NF-e Complementar'
                      : 'Nota Fiscal Avulsa - NF-e'}
                </h1>
                {isDevolution && (
                  <Badge variant="warningLight" className="ml-2">
                    Devolução
                  </Badge>
                )}
                {isComplementary && (
                  <Badge variant="blueLight" className="ml-2">
                    Complementar
                  </Badge>
                )}
                {!isDevolution && !isComplementary && (
                  <Badge variant="blueLight" className="ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                    Em digitação
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center">
            <CustomButton
              icon={IconX}
              title="Cancelar digitação"
              iconVariant="errorLight"
              onClick={() => router.push('/nota-fiscal/emitir')}
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
        {isDevolution && data?.originalNfeNumero && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
              <IconArrowLeft size={16} />
              Devolução referente à NF-e nº {data.originalNfeNumero}
              {data.originalNfeChave &&
                ` — chave: ${data.originalNfeChave.slice(0, 8)}...`}
            </p>
          </div>
        )}

        {isComplementary && data?.originalNfeNumero && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
              <IconFilePlus size={16} />
              Complementar à NF-e nº {data.originalNfeNumero}
              {data.originalNfeChave &&
                ` — chave: ${data.originalNfeChave.slice(0, 8)}...`}
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Adicione apenas os itens com a diferença de valor ou quantidade em
              relação à NF original.
            </p>
          </div>
        )}

        {isReissue && data?.originalNfeNumero && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 text-sm font-medium flex items-center gap-2">
              <IconEdit size={16} />
              Corrigindo NF-e Rejeitada nº {data.originalNfeNumero}
            </p>
            {data.motivoRejeicao && (
              <p className="text-warning-700 text-xs mt-2 p-2 bg-white/60 border border-warning-200 rounded">
                <strong className="block text-[10px] uppercase mb-0.5">
                  Motivo da Rejeição SEFAZ:
                </strong>
                {data.motivoRejeicao}
              </p>
            )}
          </div>
        )}

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
              <InvoiceEmissionConfigSection data={data} onUpdate={setData} />

              {/* Recipient */}
              <InvoiceRecipientSection
                destinatario={data.destinatario}
                onEditClick={() => setIsRecipientEditOpen(true)}
              />

              {/* Items */}
              <InvoiceItems
                data={data}
                onUpdate={setData}
                onAddProduct={handleAddProduct}
                onRemoveItem={handleRemoveItem}
              />

              {/* Transport */}
              <InvoiceTransport data={data} onUpdate={setData} />

              {/* Payment */}
              <InvoicePayment
                data={data}
                onUpdate={setData}
                computedValorNota={
                  computedTotais?.valorNota ?? data.totais?.valorNota ?? 0
                }
              />

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
