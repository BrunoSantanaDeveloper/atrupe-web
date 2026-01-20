'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Accordion imports removed
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Custom Components
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import {
  IconX,
  IconSum,
  IconSend,
  IconUser,
  IconPencil,
  IconPrinter,
  IconSettings,
  IconFileText,
  IconDownload,
  IconExternalLink,
  IconAlertTriangle,
  IconArrowLeft,
  IconHelpCircle,
  IconAlertTriangleFilled,
  IconCheck,
} from '@tabler/icons-react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Sub-components
import { InvoiceTransport } from './InvoiceTransport'
import { InvoicePayment } from './InvoicePayment'
import { InvoiceItems } from './InvoiceItems'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

// Types
interface Props {
  id: string
}

export function IssueInvoiceForm({ id }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [data, setData] = useState<NfePrepareResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Accordion state removed

  // Fetch data on mount
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getItem({
        route: `/fiscal/nfe/prepare/${id}`,
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao carregar dados da NF-e')
      }

      // Initialize empty arrays if null (backend guard)
      const preparedData = {
        ...result.data,
        volumes: result.data.volumes || [],
        duplicatas: result.data.duplicatas || [],
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

    // Basic validation
    if (data.items.some((item) => item.needsConfiguration)) {
      toast.error('Existem itens que precisam de configuração fiscal.')
      return
    }

    // Check if NF-e already exists
    if (data.hasExistingNfe) {
      toast.info('Esta ordem já possui uma NF-e emitida.')
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
          // Mapped from updated data
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
          pagamento: data.pagamento,
          duplicatas: data.duplicatas,
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
                  variant={data.hasExistingNfe ? 'success' : 'blueLight'}
                  className="ml-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  {data.hasExistingNfe ? 'NF-e Emitida' : 'Em digitação'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="neutralGhost"
                size="iconSm"
                className="text-gray-400"
              >
                <IconHelpCircle size={20} />
              </Button>
              <Button
                variant="neutralGhost"
                size="iconSm"
                className="text-gray-400"
                disabled={!data.hasExistingNfe}
                onClick={() => {
                  if (data.existingNfe?.danfeUrl) {
                    window.open(data.existingNfe.danfeUrl, '_blank')
                  }
                }}
              >
                <IconPrinter size={20} />
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          {!data.hasExistingNfe && (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <CustomButton
                icon={IconX}
                title="Cancelar venda"
                iconVariant="errorLight"
                onClick={() => router.push('/nota-fiscal/emitir')}
              />
              <CustomButton
                icon={IconSend}
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
        {/* Form Sections */}
        <div className="space-y-6">
          {/* Configuração de emissão */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible defaultValue="config">
              <AccordionItem value="config" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Configuração de emissão
                    </CardTitle>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="neutralGhost"
                      size="iconSm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IconPencil size={16} />
                    </Button>
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
                          { label: 'Natureza da operação', value: data.emissao.operationNature },
                          { label: 'Tipo', value: `${data.emissao.tipo} - Saída` },
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
                          { label: 'Finalidade', value: `${data.emissao.finalidade} - NF-e normal` },
                          { label: 'Destino operação', value: data.emissao.destinoOperacao === 1 ? '1 - Operação interna' : '2 - Operação interestadual' },
                          { label: 'Próximo documento', value: data.emissao.proximoDocumento },
                          { label: 'Data de saída', value: new Date(data.emissao.dataSaida).toLocaleString('pt-BR') },
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
                          { label: 'Consumidor final', value: data.emissao.consumidorFinal === 1 ? '1 - Sim' : '0 - Não' },
                          { label: 'Presença do consumidor', value: `${data.emissao.presencaConsumidor} - Operação presencial` },
                          { label: 'Modalidade de frete', value: data.emissao.modalidadeFrete !== undefined ? data.emissao.modalidadeFrete : '9 - Sem ocorrência de transporte' },
                          { label: 'NF-e referenciada', value: data.emissao.nfeReferenciada || 'Sem referência' },
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
                    <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Destinatário / Tomador
                    </CardTitle>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="neutralGhost"
                      size="iconSm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <IconPencil size={16} />
                    </Button>
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
                          { label: 'Razão Social', value: data.destinatario.razaoSocial },
                          { label: 'CNPJ/CPF', value: data.destinatario.cnpjCpf },
                          { label: 'I.E.', value: data.destinatario.ie || 'N/D' },
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
                          { label: 'Rua', value: `${data.destinatario.endereco}, ${data.destinatario.numero}` },
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
                          { label: 'Telefone', value: data.destinatario.telefone || 'N/D' },
                          { label: 'E-mail', value: data.destinatario.email || 'N/D' },
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

          {/* Payment Section */}
          <InvoicePayment data={data} onUpdate={setData} />

          {/* Info Complementar */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="info" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconFileText} />
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

          {/* Download Auth */}
          <Card className="border-none shadow-sm overflow-hidden">
            <Accordion type="single" collapsible>
              <AccordionItem value="auth" className="p-0 m-0 border-0">
                <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={IconDownload} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      Autorização de download
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
                      Funcionalidade de autorização de CNPJs ainda não disponível.
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
                    <FeaturedIcon variant="neutralOutline" Icon={IconSum} />
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
                          { label: 'Valor Prod/Serv', value: formatCurrency(data.totais.valorProdutos), highlight: true },
                          { label: 'Frete', value: data.totais.valorFrete > 0 ? formatCurrency(data.totais.valorFrete) : '-' },
                          { label: 'Seguro', value: data.totais.valorSeguro > 0 ? formatCurrency(data.totais.valorSeguro) : '-' },
                          { label: 'Desconto', value: data.totais.valorDesconto > 0 ? formatCurrency(data.totais.valorDesconto) : '-' },
                          { label: 'Outras desps.', value: data.totais.outrasDesepesas > 0 ? formatCurrency(data.totais.outrasDesepesas) : '-' },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className={`text-sm font-semibold ${field.highlight ? 'text-blue-600' : 'text-gray-900'}`}>
                              {field.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Row 2: Taxes */}
                      <div className="grid grid-cols-2 lg:grid-cols-7 gap-6 p-6 border-b border-gray-100">
                        {[
                          { label: 'Base ICMS', value: data.totais.baseCalculoIcms > 0 ? formatCurrency(data.totais.baseCalculoIcms) : '-' },
                          { label: 'Valor ICMS', value: data.totais.valorIcms > 0 ? formatCurrency(data.totais.valorIcms) : '-' },
                          { label: 'Base ST', value: data.totais.baseCalculoIcmsSt > 0 ? formatCurrency(data.totais.baseCalculoIcmsSt) : '-' },
                          { label: 'Valor ST', value: data.totais.valorIcmsSt > 0 ? formatCurrency(data.totais.valorIcmsSt) : '-' },
                          { label: 'Valor IPI', value: data.totais.valorIpi > 0 ? formatCurrency(data.totais.valorIpi) : '-' },
                          { label: 'Valor PIS', value: data.totais.valorPis > 0 ? formatCurrency(data.totais.valorPis) : '-' },
                          { label: 'Valor COFINS', value: data.totais.valorCofins > 0 ? formatCurrency(data.totais.valorCofins) : '-' },
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
                          { label: 'Total Tributos', value: data.totais.valorTotalTributos > 0 ? formatCurrency(data.totais.valorTotalTributos) : '-' },
                          { label: 'Valor da Nota', value: formatCurrency(data.totais.valorNota), highlight: true, large: true },
                        ].map((field, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              {field.label}
                            </p>
                            <p className={`font-bold ${field.large ? 'text-lg text-blue-600' : 'text-sm text-gray-900'}`}>
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
    </TooltipProvider>
  )
}
