'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'

// Icons
import {
  IconX,
  IconBox,
  IconSum,
  IconSend,
  IconUser,
  IconCopy,
  IconScale,
  IconTruck,
  IconPencil,
  IconPrinter,
  IconSettings,
  IconFileText,
  IconDownload,
  IconCreditCard,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
} from '@/types/fiscal/nfe-prepare'

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

  const [accordionValue, setAccordionValue] = useState<string[]>([
    'config',
    'recipient',
    'items',
    'totals',
  ])

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

      setData(result.data)
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
          items: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitValue: item.unitValue,
            discount: item.discount,
            description: item.description,
            ncm: item.ncm,
            cfop: item.cfop,
            uCom: item.uCom,
            ean: item.ean,
            ceantrib: item.ceantrib,
            cstIcms: item.cstIcms,
            cstPis: item.cstPis,
            cstCofins: item.cstCofins,
            cstIpi: item.cstIpi,
          })),
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NF-e')
      }

      toast.success('NF-e emitida com sucesso!')
      router.push('/nota-fiscal/emitir')
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
        {/* Topbar */}
        <Topbar
          title="Emissão de NF-e"
          supportText={data.destinatario.razaoSocial}
          badge={{
            text: data.hasExistingNfe ? 'NF-e Emitida' : 'Em digitação',
            variant: data.hasExistingNfe ? 'success' : 'blueLight',
          }}
          previousPage="/nota-fiscal/emitir"
          primaryCta={
            <Button
              variant="neutralOutline"
              size="iconMd"
              LeftIcon={IconPrinter}
              disabled={!data.hasExistingNfe}
              onClick={() => {
                if (data.existingNfe?.danfeUrl) {
                  window.open(data.existingNfe.danfeUrl, '_blank')
                }
              }}
            />
          }
        />

        {/* Alert Area */}
        {data.emissao.ambiente === 'HOMOLOGACAO' && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center">
            <p className="text-warning-700 font-medium text-sm flex items-center justify-center gap-2">
              <span className="text-lg">⚠</span>
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Existing NF-e Alert */}
        {data.hasExistingNfe && data.existingNfe && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FeaturedIcon variant="successLight" Icon={IconFileText} />
                <div>
                  <p className="font-semibold text-success-700">
                    NF-e já emitida para esta ordem
                  </p>
                  <p className="text-sm text-success-600">
                    Número: {data.existingNfe.numero}/{data.existingNfe.serie} |
                    Status: {data.existingNfe.status}
                  </p>
                </div>
              </div>
              {data.existingNfe.danfeUrl && (
                <Button
                  variant="success"
                  RightIcon={IconExternalLink}
                  onClick={() =>
                    window.open(data.existingNfe!.danfeUrl!, '_blank')
                  }
                >
                  Visualizar DANFE
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!data.hasExistingNfe && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <Button
              variant="neutralOutline"
              className="text-error-600 border-error-100 hover:bg-error-50"
              LeftIcon={IconX}
              onClick={() => router.push('/nota-fiscal/emitir')}
            >
              Cancelar digitação
            </Button>
            <Button
              variant="success"
              className="px-8"
              RightIcon={IconSend}
              onClick={handleEmit}
              disabled={isEmitting}
              isLoading={isEmitting}
            >
              {isEmitting ? 'Emitindo...' : 'Emitir NF-e'}
            </Button>
          </div>
        )}

        {/* Form Sections */}
        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={setAccordionValue}
          className="space-y-4"
        >
          {/* Configuração de emissão */}
          <AccordionItem value="config" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Configuração de emissão
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutralGhost"
                    size="iconSm"
                    LeftIcon={IconPencil}
                  />
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </div>
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {[
                    { label: 'Emissor', value: data.emissao.emissor },
                    { label: 'CNPJ', value: data.emissao.emissorCnpj },
                    {
                      label: 'Próximo documento',
                      value: data.emissao.proximoDocumento,
                    },
                    { label: 'Tipo', value: `${data.emissao.tipo} - Saída` },
                    {
                      label: 'Finalidade',
                      value: `${data.emissao.finalidade} - NF-e normal`,
                    },
                    {
                      label: 'Natureza da operação',
                      value: data.emissao.operationNature,
                    },
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
                      label: 'NF-e referenciada',
                      value: data.emissao.nfeReferenciada || 'Sem referência',
                    },
                    {
                      label: 'Data de saída',
                      value: new Date(data.emissao.dataSaida).toLocaleString(
                        'pt-BR',
                      ),
                    },
                    {
                      label: 'Destino operação',
                      value:
                        data.emissao.destinoOperacao === 1
                          ? '1 - Operação interna'
                          : '2 - Operação interestadual',
                    },
                    {
                      label: 'Modalidade de frete',
                      value: '9 - Sem ocorrência de transporte',
                    },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Destinatário / Tomador */}
          <AccordionItem value="recipient" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Destinatário / Tomador
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutralGhost"
                    size="iconSm"
                    LeftIcon={IconPencil}
                  />
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </div>
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {[
                    {
                      label: 'Razão Social',
                      value: data.destinatario.razaoSocial,
                    },
                    { label: 'CNPJ/CPF', value: data.destinatario.cnpjCpf },
                    { label: 'I.E.', value: data.destinatario.ie || 'N/D' },
                    {
                      label: 'E-mail',
                      value: data.destinatario.email || 'N/D',
                    },
                    {
                      label: 'Telefone',
                      value: data.destinatario.telefone || 'N/D',
                    },
                    { label: 'CEP', value: data.destinatario.cep },
                    { label: 'Estado', value: data.destinatario.estado },
                    { label: 'Cidade', value: data.destinatario.cidade },
                    { label: 'Bairro', value: data.destinatario.bairro },
                    {
                      label: 'Rua',
                      value: `${data.destinatario.endereco}, ${data.destinatario.numero}`,
                    },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Itens */}
          <AccordionItem value="items" className="border-none">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Itens ({data.items.length})
                  </CardTitle>
                </div>
                <AccordionTrigger className="p-0 hover:no-underline" />
              </CardHeader>
              <AccordionContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50/50 border-y border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Referência
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          CST
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Frete
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Seguro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Valor unitário
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Qtd.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Valor final
                        </th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item: NfePrepareItem) => (
                        <tr
                          key={item.itemNumber}
                          className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.itemNumber} - {item.description}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-tight">
                                COD: {item.productCode || 'N/D'} | NCM:{' '}
                                {item.ncm || 'N/D'} | CFOP: {item.cfop || 'N/D'}
                              </p>
                              {item.needsConfiguration && (
                                <p className="text-[11px] text-error-600 font-medium">
                                  Este item ainda não foi configurado.
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {item.needsConfiguration ? (
                              <Button
                                variant="success"
                                size="sm"
                                LeftIcon={IconSettings}
                                className="h-8 text-xs"
                              >
                                Configurar
                              </Button>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                  ICMS: {item.cstIcms}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase font-medium">
                                  IPI: {item.cstIpi || 'N/D'}
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.freight > 0
                              ? formatCurrency(item.freight)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {item.insurance > 0
                              ? formatCurrency(item.insurance)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            {formatCurrency(item.unitValue)}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-sm font-bold text-success-600 text-nowrap">
                            {formatCurrency(item.totalValue)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="neutralGhost"
                              size="iconSm"
                              LeftIcon={IconPencil}
                              className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Collapsed Sections */}
          {[
            { id: 'transport', label: 'Transportadora', icon: IconTruck },
            { id: 'volumes', label: 'Volumes transportados', icon: IconScale },
            { id: 'payment', label: 'Pagamento', icon: IconCreditCard },
            { id: 'installments', label: 'Duplicatas', icon: IconCopy },
            {
              id: 'auth',
              label: 'Autorização de download',
              icon: IconDownload,
            },
            {
              id: 'info',
              label: 'Informações complementares',
              icon: IconFileText,
            },
          ].map((sec) => (
            <AccordionItem key={sec.id} value={sec.id} className="border-none">
              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex gap-3 items-center">
                    <FeaturedIcon variant="neutralOutline" Icon={sec.icon} />
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      {sec.label}
                    </CardTitle>
                  </div>
                  <AccordionTrigger className="p-0 hover:no-underline" />
                </CardHeader>
                <AccordionContent>
                  <CardContent className="text-sm text-gray-500 italic">
                    {sec.id === 'info' && data.informacoesComplementares
                      ? data.informacoesComplementares
                      : `Conteúdo do setor ${sec.label}`}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}

          {/* Totais */}
          <AccordionItem value="totals" className="border-none">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconSum} />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Totais
                  </CardTitle>
                </div>
                <AccordionTrigger className="p-0 hover:no-underline" />
              </CardHeader>
              <AccordionContent>
                <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-y-8 gap-x-4 pt-4 border-t border-gray-50">
                  {[
                    {
                      label: 'Valor Prod/Serv',
                      value: formatCurrency(data.totais.valorProdutos),
                    },
                    {
                      label: 'Base de cálc ICMS',
                      value:
                        data.totais.baseCalculoIcms > 0
                          ? formatCurrency(data.totais.baseCalculoIcms)
                          : '-',
                    },
                    {
                      label: 'Base de cálc ICMS ST',
                      value:
                        data.totais.baseCalculoIcmsSt > 0
                          ? formatCurrency(data.totais.baseCalculoIcmsSt)
                          : '-',
                    },
                    {
                      label: 'Valor COFINS',
                      value:
                        data.totais.valorCofins > 0
                          ? formatCurrency(data.totais.valorCofins)
                          : '-',
                    },
                    {
                      label: 'Outras desps. acess.',
                      value:
                        data.totais.outrasDesepesas > 0
                          ? formatCurrency(data.totais.outrasDesepesas)
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
                      label: 'Valor ICMS',
                      value:
                        data.totais.valorIcms > 0
                          ? formatCurrency(data.totais.valorIcms)
                          : '-',
                    },
                    {
                      label: 'Valor ICMS ST',
                      value:
                        data.totais.valorIcmsSt > 0
                          ? formatCurrency(data.totais.valorIcmsSt)
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
                      label: 'Total Tributos',
                      value:
                        data.totais.valorTotalTributos > 0
                          ? formatCurrency(data.totais.valorTotalTributos)
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
                      label: 'Frete',
                      value:
                        data.totais.valorFrete > 0
                          ? formatCurrency(data.totais.valorFrete)
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
                      label: 'Valor da Nota',
                      value: formatCurrency(data.totais.valorNota),
                    },
                  ].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {field.value}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </TooltipProvider>
  )
}
