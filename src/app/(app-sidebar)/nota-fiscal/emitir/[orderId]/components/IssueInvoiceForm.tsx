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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'

// Components
import { InvoiceItems } from './InvoiceItems'
import { InvoicePayment } from './InvoicePayment'
import { Topbar } from '@/components/common/Topbar'
import { InvoiceTransport } from './InvoiceTransport'
import { CustomButton } from '@/components/common/CustomButton'
import { InvoiceDuplicates } from './InvoiceDuplicates'
import { InvoiceDownloadAuth } from './InvoiceDownloadAuth'
import { InvoiceRecipientEditDialog } from './InvoiceRecipientEditDialog'

// Icons
import {
  IconX,
  IconPencil,
  IconUserCog,
  IconMessage,
  IconSettings,
  IconArrowLeft,
  IconCalculator,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertTriangleFilled,
} from '@tabler/icons-react'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface Props {
  id: string
}

export function IssueInvoiceForm({ id }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [isRecipientEditOpen, setIsRecipientEditOpen] = useState(false)

  const router = useRouter()

  // Fetch data on mount - create or get draft
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use draft endpoint to create or get existing draft
      const result = await createItemNew({
        route: `/fiscal/nfe/draft/${id}`,
        data: {},
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar dados da NF-e')
      }

      // Initialize empty arrays if null (backend guard)
      const preparedData = {
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
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle emit
  const handleEmit = async () => {
    if (!data) return

    // Basic validation - only for products
    const productItems = data.items.filter((item) => !item.isService)

    if (productItems.length === 0) {
      toast.error(
        'Esta ordem não possui produtos para emissão de NF-e. Use a emissão de NFS-e para serviços.',
      )
      return
    }

    const invalidItems = productItems.filter((item) => item.needsConfiguration)
    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map((i) => i.description).join(', ')
      toast.error(
        `Existem produtos que precisam de configuração fiscal: ${itemNames}`,
      )
      return
    }

    // Check if NF-e already exists and is authorized
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
        route: '/fiscal/nfe/emit-full',
        data: {
          orderId: data.orderId,
          quotationId: data.quotationId,
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
          // Mapped from updated data - only products
          items: productItems.map((item) => ({
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
          pagamento: data.pagamento,
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

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  // Handle recipient update - persist to backend
  const handleRecipientSave = async (
    updatedDestinatario: NfePrepareResponse['destinatario'],
  ) => {
    if (!data || !data.draftId) return

    try {
      // Save to backend
      const result = await updateItemNew({
        route: `/fiscal/nfe/draft/${data.draftId}`,
        data: {
          destinatario: updatedDestinatario,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao salvar destinatário')
      }

      // Update local state
      setData({
        ...data,
        destinatario: updatedDestinatario,
      })

      toast.success('Destinatário salvo com sucesso')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar destinatário'
      toast.error(message)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar title="Emissão de NF-e" previousPage="/nota-fiscal/emitir" />
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
          <Topbar title="Emissão de NF-e" previousPage="/nota-fiscal/emitir" />
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
        {/* Header Customizado */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="iconSm"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => router.push('/nota-fiscal/emitir')}
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Emissão de NF-e
                </h1>
                <span className="text-xl text-gray-400">
                  {data.destinatario.razaoSocial}
                </span>
                <Badge
                  variant={
                    data.existingNfe?.status === 'AUTHORIZED'
                      ? 'success'
                      : data.existingNfe?.status === 'REJECTED'
                        ? 'error'
                        : 'blueLight'
                  }
                  className="ml-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  {data.existingNfe?.status === 'AUTHORIZED'
                    ? 'NF-e Autorizada'
                    : data.existingNfe?.status === 'REJECTED'
                      ? 'NF-e Rejeitada'
                      : 'Em digitação'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Bar - Show when no NF-e, draft, or when NF-e was rejected (allow retry) */}
          {(!data.hasExistingNfe ||
            data.existingNfe?.status === 'DRAFT' ||
            data.existingNfe?.status === 'REJECTED') && (
            <div className="flex justify-between items-center">
              <CustomButton
                icon={IconX}
                title="Cancelar digitação"
                iconVariant="errorLight"
                onClick={() => router.push('/nota-fiscal/emitir')}
              />
              <CustomButton
                icon={IconCircleCheck}
                title={isEmitting ? 'Emitindo...' : 'Emitir NF-e'}
                iconVariant="successLight"
                onClick={handleEmit}
                disabled={isEmitting}
                isLoading={isEmitting}
              />
            </div>
          )}
        </div>

        {/* Alert Area */}
        {data.emissao.ambiente === 'HOMOLOGACAO' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-orange-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-orange-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Configuração de emissão */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="config">
              <AccordionItem value="config" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon
                      variant="neutralOutline"
                      Icon={IconSettings}
                    />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Configuração de emissão
                    </CardTitle>
                  </div>
                  <div className="flex gap-3">
                    {/* {<Button
                      variant="neutralLight"
                      size="icon"
                      RightIcon={IconPencil}
                    />} */}
                    <AccordionTrigger
                      className={cn(
                        buttonVariants({
                          variant: 'neutralLight',
                          size: 'icon',
                        }),
                        'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                      )}
                    />
                  </div>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {/* Row 1: Emissor & Basic Info */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                        {[
                          { label: 'Emissor', value: data.emissao.emissor },
                          { label: 'CNPJ', value: data.emissao.emissorCnpj },
                          {
                            label: 'Natureza da operação',
                            value: data.emissao.operationNature,
                          },
                          {
                            label: 'Tipo',
                            value: `${data.emissao.tipo} - Saída`,
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 2: Operation Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                        {[
                          {
                            label: 'Finalidade',
                            value: `${data.emissao.finalidade} - NF-e normal`,
                          },
                          {
                            label: 'Destino operação',
                            value:
                              data.emissao.destinoOperacao === 1
                                ? '1 - Operação interna'
                                : '2 - Operação interestadual',
                          },
                          {
                            label: 'Próximo documento',
                            value: data.emissao.proximoDocumento,
                          },
                          {
                            label: 'Data de saída',
                            value: new Date(
                              data.emissao.dataSaida,
                            ).toLocaleString('pt-BR'),
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 3: Consumer & Transport */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                        {[
                          {
                            label: 'Consumidor final',
                            value:
                              data.emissao.consumidorFinal === 1
                                ? '1 - Sim'
                                : '0 - Não',
                          },
                          {
                            label: 'Presença do consumidor',
                            value: `${data.emissao.presencaConsumidor} - Operação presencial`,
                          },
                          {
                            label: 'Modalidade de frete',
                            value:
                              data.emissao.modalidadeFrete !== undefined
                                ? data.emissao.modalidadeFrete
                                : '9 - Sem ocorrência de transporte',
                          },
                          {
                            label: 'NF-e referenciada',
                            value:
                              data.emissao.nfeReferenciada || 'Sem referência',
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Destinatário / Tomador */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="recipient">
              <AccordionItem value="recipient" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconUserCog} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Destinatário / Tomador
                    </CardTitle>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="neutralLight"
                      size="icon"
                      RightIcon={IconPencil}
                      onClick={() => setIsRecipientEditOpen(true)}
                    />
                    <AccordionTrigger
                      className={cn(
                        buttonVariants({
                          variant: 'neutralLight',
                          size: 'icon',
                        }),
                        'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                      )}
                    />
                  </div>
                </CardHeader>
                <AccordionContent>
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      {/* Row 1: Basic Info */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                        {[
                          {
                            label: 'Razão Social',
                            value: data.destinatario.razaoSocial,
                          },
                          {
                            label: 'CNPJ/CPF',
                            value: data.destinatario.cnpjCpf,
                          },
                          {
                            label: 'I.E.',
                            value: data.destinatario.ie || 'N/D',
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 2: Address */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 border-b border-gray-100">
                        {[
                          {
                            label: 'Rua',
                            value: `${data.destinatario.endereco}, ${data.destinatario.numero}`,
                          },
                          { label: 'Bairro', value: data.destinatario.bairro },
                          { label: 'CEP', value: data.destinatario.cep },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 3: Contact & Location */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                        {[
                          { label: 'Cidade', value: data.destinatario.cidade },
                          { label: 'Estado', value: data.destinatario.estado },
                          {
                            label: 'Telefone',
                            value: data.destinatario.telefone || 'N/D',
                          },
                          {
                            label: 'E-mail',
                            value: data.destinatario.email || 'N/D',
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Items Section */}
          <InvoiceItems data={data} onUpdate={setData} />

          {/* Transport Section */}
          <InvoiceTransport data={data} onUpdate={setData} />

          {/* Pagamento */}
          <InvoicePayment data={data} onUpdate={setData} />

          {/* Duplicatas */}
          <InvoiceDuplicates data={data} onUpdate={setData} />

          {/* Download Auth */}
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
                    <p className="text-sm text-gray-500 italic">
                      {data.informacoesComplementares
                        ? data.informacoesComplementares
                        : 'Nenhuma informação adicional'}
                    </p>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>

          {/* Totais */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="totals">
              <AccordionItem value="totals" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon
                      variant="neutralOutline"
                      Icon={IconCalculator}
                    />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Totais
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
                      {/* Row 1: Invoice Components */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 p-6 border-b border-gray-100">
                        {[
                          {
                            label: 'Valor Prod/Serv',
                            value: formatCurrency(data.totais.valorProdutos),
                            highlight: true,
                          },
                          {
                            label: 'Frete',
                            value:
                              data.totais.valorFrete > 0
                                ? formatCurrency(data.totais.valorFrete)
                                : '-',
                          },
                          {
                            label: 'Seguro',
                            value:
                              data.totais.valorSeguro > 0
                                ? formatCurrency(data.totais.valorSeguro)
                                : '-',
                          },
                          {
                            label: 'Desconto',
                            value:
                              data.totais.valorDesconto > 0
                                ? formatCurrency(data.totais.valorDesconto)
                                : '-',
                          },
                          {
                            label: 'Outras desps.',
                            value:
                              data.totais.outrasDesepesas > 0
                                ? formatCurrency(data.totais.outrasDesepesas)
                                : '-',
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p
                              className={`text-sm font-semibold ${field.highlight ? 'text-blue-600' : 'text-gray-900'}`}
                            >
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 2: Taxes */}
                      <div className="grid grid-cols-2 lg:grid-cols-7 gap-6 p-6 border-b border-gray-100">
                        {[
                          {
                            label: 'Base ICMS',
                            value:
                              data.totais.baseCalculoIcms > 0
                                ? formatCurrency(data.totais.baseCalculoIcms)
                                : '-',
                          },
                          {
                            label: 'Valor ICMS',
                            value:
                              data.totais.valorIcms > 0
                                ? formatCurrency(data.totais.valorIcms)
                                : '-',
                          },
                          {
                            label: 'Base ST',
                            value:
                              data.totais.baseCalculoIcmsSt > 0
                                ? formatCurrency(data.totais.baseCalculoIcmsSt)
                                : '-',
                          },
                          {
                            label: 'Valor ST',
                            value:
                              data.totais.valorIcmsSt > 0
                                ? formatCurrency(data.totais.valorIcmsSt)
                                : '-',
                          },
                          {
                            label: 'Valor IPI',
                            value:
                              data.totais.valorIpi > 0
                                ? formatCurrency(data.totais.valorIpi)
                                : '-',
                          },
                          {
                            label: 'Valor PIS',
                            value:
                              data.totais.valorPis > 0
                                ? formatCurrency(data.totais.valorPis)
                                : '-',
                          },
                          {
                            label: 'Valor COFINS',
                            value:
                              data.totais.valorCofins > 0
                                ? formatCurrency(data.totais.valorCofins)
                                : '-',
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 3: Totals */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50/50">
                        {[
                          {
                            label: 'Total Tributos',
                            value:
                              data.totais.valorTotalTributos > 0
                                ? formatCurrency(data.totais.valorTotalTributos)
                                : '-',
                          },
                          {
                            label: 'Valor da Nota',
                            value: formatCurrency(data.totais.valorNota),
                            highlight: true,
                            large: true,
                          },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p
                              className={`font-bold ${field.large ? 'text-lg text-blue-600' : 'text-sm text-gray-900'}`}
                            >
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      </div>

      {/* Recipient Edit Dialog */}
      <InvoiceRecipientEditDialog
        open={isRecipientEditOpen}
        onOpenChange={setIsRecipientEditOpen}
        destinatario={data.destinatario}
        onSave={handleRecipientSave}
      />
    </TooltipProvider>
  )
}
