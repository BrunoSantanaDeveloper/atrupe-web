'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

// UI
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  Card as UiCard,
  CardContent as UiCardContent,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { CustomButton } from '@/components/common/CustomButton'
import { NfseTomadorSection } from './NfseTomadorSection'
import { NfseDadosFiscaisSection } from './NfseDadosFiscaisSection'
import {
  NfseCamposAdicionaisSection,
  type NfseCamposAdicionais,
} from './NfseCamposAdicionaisSection'
import {
  ListaServicosSelect,
  useListaServicosNfse,
  type NfseServicoItem,
} from '@/components/common/fiscal/ListaServicosNfse'

import { NfseTotaisSection } from './NfseTotaisSection'
import { InvoiceDeliveryAddressSection } from '../../../emitir/[orderId]/components/InvoiceDeliveryAddressSection'
import { InvoiceRecipientEditDialog } from '../../../emitir/[orderId]/components/InvoiceRecipientEditDialog'
import type {
  NfePrepareEntrega,
  NfePrepareDestinatario,
} from '@/types/fiscal/nfe-prepare'

// Icons
import {
  IconX,
  IconArrowLeft,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconBan,
} from '@tabler/icons-react'

// Hooks
import { useAlertDialog } from '@/store/useAlertDialog'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

interface QuotationItem {
  id: string
  description: string
  finalValue: number
  product: {
    originalProductId: string
    name: string
    isService: boolean
    quantity: number
    finalValue: number
  }
}

interface OrderData {
  id: string
  quotation: {
    client: {
      id?: string
      name: string
      corporateName?: string
      cnpj?: string
      cpf?: string
      email?: string
      phone?: string
      mobile?: string
      address?: Array<{
        id?: string
        street?: string
        number?: string
        complement?: string
        neighborhood?: string
        city?: string
        state?: string
        zipcode?: string
      }>
    }
    quotationItems: QuotationItem[]
    deliveryInfo?: {
      clientAddress?: {
        id: string
        street?: string
        number?: string
        complement?: string
        neighborhood?: string
        city?: string
        state?: string
        zipcode?: string
      }
    }
  }
}

interface ClientAddressItem {
  id: string
  label?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
  type?: string
}

/** Conferência do cadastro fiscal dos serviços, feita antes de emitir. */
interface ConferenciaEmissao {
  codigoPadraoEmissor: string | null
  bloqueiam: string[]
  usandoCodigoPadrao: string[]
  codigosDivergentes: string[]
  podeEmitir: boolean
  exigeConfirmacao: boolean
}

interface Props {
  id?: string
  orderIds?: string[]
}

export function IssueNfseForm({ id, orderIds }: Props) {
  const isConsolidated = Boolean(orderIds && orderIds.length > 0)
  const primaryId = isConsolidated ? orderIds![0] : (id ?? '')

  const alertDialog = useAlertDialog()
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [allOrdersData, setAllOrdersData] = useState<OrderData[]>([])
  const [entrega, setEntrega] = useState<NfePrepareEntrega | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  )
  const [isTomadorEditOpen, setIsTomadorEditOpen] = useState(false)
  const [conferencia, setConferencia] = useState<ConferenciaEmissao | null>(
    null,
  )
  const [confirmouClassificacao, setConfirmouClassificacao] = useState(false)
  const [camposAdicionais, setCamposAdicionais] =
    useState<NfseCamposAdicionais>({})
  const { servicos: listaServicos } = useListaServicosNfse()
  const [servicoEscolhidoId, setServicoEscolhidoId] = useState<string | null>(
    null,
  )
  const [servicoEscolhido, setServicoEscolhido] =
    useState<NfseServicoItem | null>(null)
  const [tomadorOverride, setTomadorOverride] =
    useState<NfePrepareDestinatario | null>(null)
  const [ambiente, setAmbiente] = useState<string | null>(null)
  const [prestadorEndereco, setPrestadorEndereco] =
    useState<NfePrepareEntrega | null>(null)

  // Form fields
  const [codigoServico, setCodigoServico] = useState('')
  const [discriminacao, setDiscriminacao] = useState('')
  const [aliquotaIss, setAliquotaIss] = useState<number>(0)
  const [issRetido, setIssRetido] = useState(false)

  const router = useRouter()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const preparePromise = getItem({
        route: '/fiscal/nfse/prepare-standalone',
      })

      if (isConsolidated) {
        const [prepareResult, ...orderResults] = await Promise.all([
          preparePromise,
          ...orderIds!.map((oid) => getItem({ route: `/sale/order/${oid}` })),
        ])

        if (!prepareResult.success) {
          throw new Error(
            prepareResult.message || 'Emissor fiscal não configurado',
          )
        }
        const prepareData = prepareResult.data
        if (prepareData?.prestador?.ambiente) {
          setAmbiente(prepareData.prestador.ambiente as string)
        }
        if (prepareData?.codigoServico) {
          setCodigoServico(prepareData.codigoServico as string)
        }
        if (prepareData?.aliquotaIss) {
          setAliquotaIss(prepareData.aliquotaIss as number)
        }
        const prestadorEnd = prepareData?.prestador?.endereco
        if (prestadorEnd) {
          const enderecoObj: NfePrepareEntrega = {
            endereco: prestadorEnd.logradouro || '',
            numero: prestadorEnd.numero || 'S/N',
            complemento: prestadorEnd.complemento || '',
            bairro: prestadorEnd.bairro || '',
            cidade: prestadorEnd.cidade || '',
            estado: prestadorEnd.uf || '',
            cep: prestadorEnd.cep || '',
          }
          setEntrega(enderecoObj)
          setPrestadorEndereco(enderecoObj)
        }

        const failed = orderResults.find((r) => !r.success || !r.data)
        if (failed) {
          throw new Error(failed.message || 'Erro ao carregar dados das ordens')
        }

        const orders = orderResults.map((r) => r.data as OrderData)

        const clientIds = orders
          .map((o) => o.quotation?.client?.id)
          .filter((id, index, self) => id && self.indexOf(id) === index)
        if (clientIds.length > 1) {
          throw new Error(
            'Todas as ordens devem pertencer ao mesmo cliente para consolidar a NFS-e',
          )
        }

        setAllOrdersData(orders)
        setOrderData(orders[0])

        const allServiceItems = orders.flatMap((o) =>
          (o.quotation?.quotationItems || []).filter(
            (item: QuotationItem) => item.product?.isService,
          ),
        )
        if (allServiceItems.length > 0) {
          setDiscriminacao(
            allServiceItems
              .map((item: QuotationItem) => item.description)
              .join('; '),
          )
        }
      } else {
        const [prepareResult, result] = await Promise.all([
          preparePromise,
          getItem({ route: `/sale/order/${primaryId}` }),
        ])

        if (!prepareResult.success) {
          throw new Error(
            prepareResult.message || 'Emissor fiscal não configurado',
          )
        }
        const prepareData = prepareResult.data
        if (prepareData?.prestador?.ambiente) {
          setAmbiente(prepareData.prestador.ambiente as string)
        }
        if (prepareData?.codigoServico) {
          setCodigoServico(prepareData.codigoServico as string)
        }
        if (prepareData?.aliquotaIss) {
          setAliquotaIss(prepareData.aliquotaIss as number)
        }
        const prestadorEnd = prepareData?.prestador?.endereco
        if (prestadorEnd) {
          const enderecoObj: NfePrepareEntrega = {
            endereco: prestadorEnd.logradouro || '',
            numero: prestadorEnd.numero || 'S/N',
            complemento: prestadorEnd.complemento || '',
            bairro: prestadorEnd.bairro || '',
            cidade: prestadorEnd.cidade || '',
            estado: prestadorEnd.uf || '',
            cep: prestadorEnd.cep || '',
          }
          setEntrega(enderecoObj)
          setPrestadorEndereco(enderecoObj)
        }

        if (!result.success || !result.data) {
          throw new Error(result.message || 'Erro ao carregar dados da ordem')
        }

        setOrderData(result.data as OrderData)

        const items = result.data.quotation?.quotationItems || []
        if (items.length > 0) {
          const descriptions = items
            .map((item: QuotationItem) => item.description)
            .join('; ')
          setDiscriminacao(descriptions)
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar dados'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [primaryId, isConsolidated, orderIds])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Conferência do cadastro fiscal dos serviços da ordem. Roda em paralelo e
  // não bloqueia a tela: se falhar, a emissão segue com as validações do
  // backend, que continuam valendo.
  useEffect(() => {
    const ids = isConsolidated ? orderIds! : [primaryId]
    if (!ids.filter(Boolean).length) return

    getItem({
      route: `/fiscal/nfse/conferir-emissao?orderIds=${ids.join(',')}`,
    })
      .then((r) => {
        if (r.success && r.data) setConferencia(r.data as ConferenciaEmissao)
      })
      .catch(() => undefined)
  }, [primaryId, isConsolidated, orderIds])

  const clientToDestinatario = (
    c: OrderData['quotation']['client'],
  ): NfePrepareDestinatario => ({
    razaoSocial: c.corporateName || c.name || '',
    cnpjCpf: c.cnpj || c.cpf || '',
    idEstrangeiro: '',
    ie: '',
    email: c.email || '',
    telefone: c.phone || c.mobile || '',
    cep: c.address?.[0]?.zipcode || '',
    estado: c.address?.[0]?.state || '',
    cidade: c.address?.[0]?.city || '',
    bairro: c.address?.[0]?.neighborhood || '',
    endereco: c.address?.[0]?.street || '',
    numero: c.address?.[0]?.number || '',
    complemento: c.address?.[0]?.complement || '',
    pais: 'Brasil',
  })

  const handleServicoEscolhido = (servico: NfseServicoItem | null) => {
    setServicoEscolhidoId(servico?.id ?? null)
    setServicoEscolhido(servico)
    if (servico) {
      setCodigoServico(servico.codigo)
      if (servico.aliquotaIss != null) setAliquotaIss(servico.aliquotaIss)
      toast.success(`Serviço ${servico.codigo} aplicado à emissão`)
    }
  }

  const handleTomadorSave = (
    updated: NfePrepareDestinatario,
    _options: { updateClient: boolean },
  ) => {
    setTomadorOverride(updated)
    setIsTomadorEditOpen(false)
    toast.success('Dados do tomador atualizados para esta NFS-e')
  }

  const handleEmit = async () => {
    if (!orderData) return

    // Classificação fiscal: sem código próprio a nota sai com o código padrão
    // do emissor, e a prefeitura autoriza mesmo assim. Exigir a confirmação
    // explícita evita autorizar uma nota com classificação errada sem que
    // ninguém perceba.
    if (
      conferencia &&
      conferencia.exigeConfirmacao &&
      !confirmouClassificacao
    ) {
      toast.error(
        'Confirme a classificação fiscal dos serviços antes de emitir',
      )
      return
    }

    if (!codigoServico.trim()) {
      toast.error('Código do serviço é obrigatório')
      return
    }
    if (!discriminacao.trim()) {
      toast.error('Discriminação do serviço é obrigatória')
      return
    }

    if (getServicesTotal() <= 0) {
      toast.error('A NFS-e precisa ter valor de serviÃ§os maior que zero')
      return
    }

    const tomadorDocumento =
      tomadorOverride?.cnpjCpf ||
      clientToDestinatario(orderData.quotation.client).cnpjCpf
    const tomadorDocumentoDigits = tomadorDocumento.replace(/\D/g, '')

    if (
      tomadorDocumentoDigits.length !== 11 &&
      tomadorDocumentoDigits.length !== 14
    ) {
      toast.error('Informe CPF ou CNPJ vÃ¡lido para o tomador da NFS-e')
      return
    }

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: isConsolidated
          ? '/fiscal/nfse/emit-consolidated'
          : '/fiscal/nfse/emit',
        data: {
          ...(isConsolidated ? { orderIds } : { orderId: primaryId }),
          codigoServico,
          discriminacao,
          // `??` não serve aqui: o estado inicia em 0 sem escolha do usuário.
          // Mas 0 vindo da lista é isenção legítima e precisa viajar.
          aliquotaIss:
            servicoEscolhido?.aliquotaIss != null
              ? aliquotaIss
              : aliquotaIss || undefined,
          issRetido,
          addressId: selectedAddressId || undefined,
          // Classificação da lista de serviços escolhida no ato da emissão
          ...(servicoEscolhido
            ? {
                nbs: servicoEscolhido.nbs || undefined,
                codTribNacional: servicoEscolhido.codTribNacional || undefined,
                codTribMunicipio:
                  servicoEscolhido.codTribMunicipio || undefined,
                codClassificacao:
                  servicoEscolhido.codClassificacao || undefined,
                cnae: servicoEscolhido.cnae || undefined,
              }
            : {}),
          // Campos adicionais (Reforma Tributária / retenções)
          ...camposAdicionais,
          ...(tomadorOverride
            ? {
                tomadorRazaoSocial: tomadorOverride.razaoSocial,
                tomadorCnpjCpf: tomadorOverride.cnpjCpf || null,
                tomadorEmail: tomadorOverride.email || null,
                tomadorTelefone: tomadorOverride.telefone || null,
                tomadorEndereco: tomadorOverride.endereco || null,
                tomadorNumero: tomadorOverride.numero || null,
                tomadorComplemento: tomadorOverride.complemento || null,
                tomadorBairro: tomadorOverride.bairro || null,
                tomadorCep: tomadorOverride.cep || null,
                tomadorMunicipio: tomadorOverride.cidade || null,
                tomadorUf: tomadorOverride.estado || null,
              }
            : {}),
          ...(entrega
            ? {
                entregaEndereco: entrega.endereco,
                entregaNumero: entrega.numero,
                entregaComplemento: entrega.complemento || null,
                entregaBairro: entrega.bairro,
                entregaCep: entrega.cep,
                entregaMunicipio: entrega.cidade,
                entregaUf: entrega.estado,
              }
            : {}),
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFS-e')
      }

      toast.success('NFS-e emitida com sucesso!')
      router.push('/nota-fiscal/emitir?tab=gestao')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao emitir NFS-e'
      alertDialog.open({
        title: 'Erro na emissão da NFS-e',
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

  const getServicesTotal = () => {
    const sumItems = (items: QuotationItem[]) => {
      const serviceItems = items.filter((i) => i.product?.isService)
      const toSum = serviceItems.length > 0 ? serviceItems : items
      return toSum.reduce((acc, i) => acc + (i.finalValue || 0), 0)
    }

    if (isConsolidated && allOrdersData.length > 0) {
      return (
        allOrdersData.reduce(
          (total, o) => total + sumItems(o.quotation?.quotationItems || []),
          0,
        ) / 100
      )
    }
    if (!orderData?.quotation?.quotationItems) return 0
    return sumItems(orderData.quotation.quotationItems) / 100
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar title="Emissão de NFS-e" previousPage="/nota-fiscal/emitir" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </TooltipProvider>
    )
  }

  if (error || !orderData) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <Topbar title="Emissão de NFS-e" previousPage="/nota-fiscal/emitir" />
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

  const client = orderData.quotation?.client
  const isHomologacao = ambiente === 'HOMOLOGACAO'

  // Reflete as edições do diálogo do tomador na exibição — sem isso o aviso de
  // "tomador sem endereço" persistia mesmo após o usuário informar o endereço.
  const clientComOverride =
    client && tomadorOverride
      ? {
          ...client,
          corporateName: tomadorOverride.razaoSocial || client.corporateName,
          email: tomadorOverride.email || client.email,
          phone: tomadorOverride.telefone || client.phone,
          address: tomadorOverride.endereco
            ? [
                {
                  ...client.address?.[0],
                  street: tomadorOverride.endereco,
                  number: tomadorOverride.numero,
                  complement: tomadorOverride.complemento,
                  neighborhood: tomadorOverride.bairro,
                  city: tomadorOverride.cidade,
                  state: tomadorOverride.estado,
                  zipcode: tomadorOverride.cep,
                },
              ]
            : client.address,
        }
      : client

  // Handlers for Delivery Address (Local de Prestação)
  const handleEntregaToggle = (enabled: boolean) => {
    if (enabled) {
      setEntrega(
        prestadorEndereco ?? {
          endereco: '',
          numero: 'S/N',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
        },
      )
      setSelectedAddressId(null)
      toast.success('Local de prestação habilitado')
    } else {
      setEntrega(null)
      setSelectedAddressId(null)
      toast.info('Local de prestação desabilitado')
    }
  }

  const handleEntregaAddressSelect = (address: ClientAddressItem | null) => {
    if (!address) {
      setSelectedAddressId(null)
      setEntrega({
        cnpjCpf: client?.cnpj || client?.cpf || '',
        endereco: '',
        numero: 'S/N',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      })
      return
    }
    setSelectedAddressId(address.id)
    setEntrega({
      cnpjCpf: client?.cnpj || client?.cpf || '',
      endereco: address.street || '',
      numero: address.number || 'S/N',
      complemento: address.complement || '',
      bairro: address.neighborhood || '',
      cidade: address.city || '',
      estado: address.state || '',
      cep: address.zipcode || '',
    })
    toast.success(
      `Local de prestação alterado para "${address.label || 'Principal'}"`,
    )
  }

  const handleEntregaChange = (updatedEntrega: NfePrepareEntrega) => {
    setEntrega(updatedEntrega)
  }

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
                aria-label="Voltar para emissão"
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {isConsolidated ? 'NFS-e Consolidada' : 'Emissão de NFS-e'}
                </h1>
                <span className="text-xl text-gray-400">
                  {client?.corporateName || client?.name}
                </span>
                {isConsolidated && (
                  <Badge variant="warningLight" className="ml-1">
                    {orderIds!.length} ordens
                  </Badge>
                )}
                <Badge variant="blueLight" className="ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  Em digitação
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <CustomButton
              icon={IconX}
              title="Cancelar digitação"
              iconVariant="errorLight"
              onClick={() => router.push('/nota-fiscal/emitir')}
            />
            <CustomButton
              icon={IconCircleCheck}
              title={
                isEmitting
                  ? 'Emitindo...'
                  : isConsolidated
                    ? 'Emitir NFS-e Consolidada'
                    : 'Emitir NFS-e'
              }
              iconVariant="successLight"
              onClick={handleEmit}
              disabled={isEmitting}
              isLoading={isEmitting}
            />
          </div>
        </div>

        {isHomologacao && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {conferencia && conferencia.exigeConfirmacao && (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <FeaturedIcon variant="warningLight" Icon={IconAlertTriangle} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-warning-800">
                  Confira a classificação fiscal antes de emitir
                </p>

                {conferencia.usandoCodigoPadrao.length > 0 && (
                  <p className="text-xs text-warning-700 mt-1">
                    {conferencia.usandoCodigoPadrao.length === 1
                      ? 'O serviço '
                      : 'Os serviços '}
                    <strong>{conferencia.usandoCodigoPadrao.join(', ')}</strong>{' '}
                    não{' '}
                    {conferencia.usandoCodigoPadrao.length === 1
                      ? 'tem'
                      : 'têm'}{' '}
                    código da LC 116 cadastrado. A nota vai sair com o código
                    padrão do emissor
                    {conferencia.codigoPadraoEmissor
                      ? ` (${conferencia.codigoPadraoEmissor})`
                      : ''}
                    , que pode não corresponder ao serviço prestado.
                  </p>
                )}

                {conferencia.codigosDivergentes.length > 0 && (
                  <p className="text-xs text-warning-700 mt-1">
                    Os serviços desta emissão têm códigos diferentes (
                    <strong>{conferencia.codigosDivergentes.join(', ')}</strong>
                    ). A NFS-e carrega um único código, então apenas o primeiro
                    será usado.
                  </p>
                )}

                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmouClassificacao}
                    onChange={(e) =>
                      setConfirmouClassificacao(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-warning-300"
                  />
                  <span className="text-xs font-medium text-warning-800">
                    Confirmo a classificação e quero emitir assim
                  </span>
                </label>

                <Button
                  variant="neutralOutline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    router.push('/configuracoes/produtos?status=ativos')
                  }
                >
                  Cadastrar o código do serviço
                </Button>
              </div>
            </div>
          </div>
        )}

        <NfseTomadorSection
          client={clientComOverride}
          servicesTotal={formatCurrency(getServicesTotal())}
          onEditClick={() => setIsTomadorEditOpen(true)}
        />

        <InvoiceDeliveryAddressSection
          entrega={entrega}
          clientId={client?.id}
          selectedAddressId={selectedAddressId}
          pais="Brasil"
          sectionTitle="Local de Prestação"
          destinatarioAddress={{
            endereco: clientComOverride?.address?.[0]?.street,
            numero: clientComOverride?.address?.[0]?.number,
            complemento: clientComOverride?.address?.[0]?.complement,
            bairro: clientComOverride?.address?.[0]?.neighborhood,
            cidade: clientComOverride?.address?.[0]?.city,
            estado: clientComOverride?.address?.[0]?.state,
            cep: clientComOverride?.address?.[0]?.zipcode,
          }}
          onEntregaToggle={handleEntregaToggle}
          onAddressSelect={handleEntregaAddressSelect}
          onEntregaChange={handleEntregaChange}
        />

        {listaServicos.length > 0 && (
          <UiCard className="border-none shadow-sm overflow-hidden">
            <UiCardContent className="p-6">
              <ListaServicosSelect
                servicos={listaServicos}
                selecionadoId={servicoEscolhidoId}
                onSelecionar={handleServicoEscolhido}
              />
            </UiCardContent>
          </UiCard>
        )}

        <NfseDadosFiscaisSection
          codigoServico={codigoServico}
          aliquotaIss={aliquotaIss}
          issRetido={issRetido}
          discriminacao={discriminacao}
          onCodigoServicoChange={setCodigoServico}
          onAliquotaIssChange={setAliquotaIss}
          onIssRetidoChange={setIssRetido}
          onDiscriminacaoChange={setDiscriminacao}
        />

        <NfseCamposAdicionaisSection
          valores={camposAdicionais}
          onChange={setCamposAdicionais}
        />

        <NfseTotaisSection
          servicesTotal={getServicesTotal()}
          aliquotaIss={aliquotaIss}
          issRetido={issRetido}
          formatCurrency={formatCurrency}
        />
      </div>

      <InvoiceRecipientEditDialog
        open={isTomadorEditOpen}
        onOpenChange={setIsTomadorEditOpen}
        destinatario={
          tomadorOverride ?? (client ? clientToDestinatario(client) : null!)
        }
        clientId={client?.id}
        onSave={handleTomadorSave}
      />
    </TooltipProvider>
  )
}
