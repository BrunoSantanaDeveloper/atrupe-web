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
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { CustomButton } from '@/components/common/CustomButton'
import { NfseTomadorSection } from './NfseTomadorSection'
import { NfseServicosSection } from './NfseServicosSection'
import { NfseDadosFiscaisSection } from './NfseDadosFiscaisSection'
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
  company?: {
    invoicyConfig?: {
      ambiente?: string
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
  const [tomadorOverride, setTomadorOverride] =
    useState<NfePrepareDestinatario | null>(null)

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
      if (isConsolidated) {
        const results = await Promise.all(
          orderIds!.map((oid) => getItem({ route: `/sale/order/${oid}` })),
        )

        const failed = results.find((r) => !r.success || !r.data)
        if (failed) {
          throw new Error(failed.message || 'Erro ao carregar dados das ordens')
        }

        const orders = results.map((r) => r.data as OrderData)

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
        const result = await getItem({
          route: `/sale/order/${primaryId}`,
        })

        if (!result.success || !result.data) {
          throw new Error(result.message || 'Erro ao carregar dados da ordem')
        }

        setOrderData(result.data as OrderData)

        const deliveryAddr = (result.data as OrderData).quotation?.deliveryInfo
          ?.clientAddress
        if (deliveryAddr) {
          setEntrega({
            cnpjCpf:
              result.data.quotation.client?.cnpj ||
              result.data.quotation.client?.cpf ||
              '',
            endereco: deliveryAddr.street || '',
            numero: deliveryAddr.number || 'S/N',
            complemento: deliveryAddr.complement || '',
            bairro: deliveryAddr.neighborhood || '',
            cidade: deliveryAddr.city || '',
            estado: deliveryAddr.state || '',
            cep: deliveryAddr.zipcode || '',
          })
          setSelectedAddressId(deliveryAddr.id)
        }

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

    if (!codigoServico.trim()) {
      toast.error('Código do serviço é obrigatório')
      return
    }
    if (!discriminacao.trim()) {
      toast.error('Discriminação do serviço é obrigatória')
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
          aliquotaIss: aliquotaIss || undefined,
          issRetido,
          addressId: selectedAddressId || undefined,
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
    if (isConsolidated && allOrdersData.length > 0) {
      return (
        allOrdersData.reduce((total, o) => {
          return (
            total +
            (o.quotation?.quotationItems || [])
              .filter((item) => item.product?.isService)
              .reduce((acc, item) => acc + (item.finalValue || 0), 0)
          )
        }, 0) / 100
      )
    }
    if (!orderData?.quotation?.quotationItems) return 0
    return (
      orderData.quotation.quotationItems
        .filter((item) => item.product?.isService)
        .reduce((acc, item) => acc + (item.finalValue || 0), 0) / 100
    )
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
  const serviceItems = isConsolidated
    ? allOrdersData.flatMap((o) =>
        (o.quotation?.quotationItems || []).filter(
          (item) => item.product?.isService,
        ),
      )
    : orderData.quotation?.quotationItems?.filter(
        (item) => item.product?.isService,
      ) || []
  const isHomologacao =
    orderData.company?.invoicyConfig?.ambiente === 'HOMOLOGACAO'

  // Handlers for Delivery Address (Local de Prestação)
  const handleEntregaToggle = (enabled: boolean) => {
    if (enabled) {
      const defaultEntrega = client?.address?.[0]
        ? {
            cnpjCpf: client.cnpj || client.cpf || '',
            endereco: client.address[0].street || '',
            numero: client.address[0].number || 'S/N',
            complemento: client.address[0].complement || '',
            bairro: client.address[0].neighborhood || '',
            cidade: client.address[0].city || '',
            estado: client.address[0].state || '',
            cep: client.address[0].zipcode || '',
          }
        : {
            cnpjCpf: client?.cnpj || client?.cpf || '',
            endereco: '',
            numero: 'S/N',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
          }
      setEntrega(defaultEntrega)
      setSelectedAddressId(client?.address?.[0]?.id || null)
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

        <NfseTomadorSection
          client={client}
          servicesTotal={formatCurrency(getServicesTotal())}
          onEditClick={() => setIsTomadorEditOpen(true)}
        />

        <InvoiceDeliveryAddressSection
          entrega={entrega}
          clientId={client?.id}
          selectedAddressId={selectedAddressId}
          pais="Brasil"
          sectionTitle="Local de Prestação"
          onEntregaToggle={handleEntregaToggle}
          onAddressSelect={handleEntregaAddressSelect}
          onEntregaChange={handleEntregaChange}
        />

        <NfseServicosSection
          items={serviceItems}
          formatCurrency={formatCurrency}
        />

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
