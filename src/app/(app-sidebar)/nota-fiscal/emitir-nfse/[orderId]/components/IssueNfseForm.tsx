'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

// UI
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import {
  IconX,
  IconUserCog,
  IconSettings,
  IconArrowLeft,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconFileInvoice,
} from '@tabler/icons-react'

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
    compositions?: Array<{
      id: string
      name: string
      unitKind: string
      quantity: number
      totalValue: number
    }>
  }
}

interface OrderData {
  id: string
  quotation: {
    client: {
      name: string
      corporateName?: string
      cnpj?: string
      cpf?: string
      email?: string
      phone?: string
      mobile?: string
      address?: Array<{
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
  }
  company?: {
    invoicyConfig?: {
      ambiente?: string
    }
  }
}

interface Props {
  id: string
}

export function IssueNfseForm({ id }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<OrderData | null>(null)

  // Form fields
  const [codigoServico, setCodigoServico] = useState('')
  const [discriminacao, setDiscriminacao] = useState('')
  const [aliquotaIss, setAliquotaIss] = useState<number>(0)
  const [issRetido, setIssRetido] = useState(false)

  const router = useRouter()

  // Fetch order data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getItem({
        route: `/sale/order/${id}`,
      })

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Erro ao carregar dados da ordem')
      }

      setOrderData(result.data)

      // Auto-preencher discriminação com descrição dos serviços
      const items = result.data.quotation?.quotationItems || []
      if (items.length > 0) {
        // Usar a descrição do primeiro item como base para discriminação
        const descriptions = items
          .map((item: QuotationItem) => item.description)
          .join('; ')
        setDiscriminacao(descriptions)
      }
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
    if (!orderData) return

    // Validation
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
        route: '/fiscal/nfse/emit',
        data: {
          orderId: id,
          codigoServico,
          discriminacao,
          aliquotaIss: aliquotaIss || undefined,
          issRetido,
        },
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFS-e')
      }

      toast.success('NFS-e emitida com sucesso!')
      router.push('/nota-fiscal/emitidas')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao emitir NFS-e'
      toast.error(message)
    } finally {
      setIsEmitting(false)
    }
  }

  // Calculate total value (only services for NFS-e)
  const getServicesTotal = () => {
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

  // Loading state
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

  // Error state
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
  const serviceItems =
    orderData.quotation?.quotationItems?.filter(
      (item) => item.product?.isService,
    ) || []
  const isHomologacao =
    orderData.company?.invoicyConfig?.ambiente === 'HOMOLOGACAO'

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
              >
                <IconArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  Emissão de NFS-e
                </h1>
                <span className="text-xl text-gray-400">
                  {client?.corporateName || client?.name}
                </span>
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
              onClick={() => router.push('/nota-fiscal/emitir')}
            />
            <CustomButton
              icon={IconCircleCheck}
              title={isEmitting ? 'Emitindo...' : 'Emitir NFS-e'}
              iconVariant="successLight"
              onClick={handleEmit}
              disabled={isEmitting}
              isLoading={isEmitting}
            />
          </div>
        </div>

        {/* Alert Area - Homologação */}
        {isHomologacao && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-orange-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-orange-500" />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Tomador / Cliente */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconUserCog} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Tomador do Serviço
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Razão Social
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {client?.corporateName || client?.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  CNPJ/CPF
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {client?.cnpj || client?.cpf || 'N/D'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  E-mail
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {client?.email || 'N/D'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Valor Total
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {formatCurrency(getServicesTotal())}
                </p>
              </div>
            </div>

            {/* Endereço do Tomador */}
            {client?.address?.[0] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                  Endereço
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1 lg:col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Logradouro
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.address[0].street || 'N/D'}
                      {client.address[0].number ? `, ${client.address[0].number}` : ''}
                      {client.address[0].complement ? ` - ${client.address[0].complement}` : ''}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Bairro
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.address[0].neighborhood || 'N/D'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Cidade/UF
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.address[0].city || 'N/D'}
                      {client.address[0].state ? `/${client.address[0].state}` : ''}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      CEP
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client.address[0].zipcode || 'N/D'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Telefone
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {client?.phone || client?.mobile || 'N/D'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Warning: missing address */}
            {!client?.address?.[0] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-orange-600">
                  <IconAlertTriangle size={16} />
                  <p className="text-sm">
                    Tomador sem endereço cadastrado. O endereço pode ser exigido pela prefeitura.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Serviços ({serviceItems.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Descrição
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Qtd
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {item.product?.quantity || 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency((item.finalValue || 0) / 100)}
                    </td>
                  </tr>
                ))}
                {serviceItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Nenhum serviço encontrado nesta ordem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Dados Fiscais */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Dados Fiscais do Serviço
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="codigoServico">Código do Serviço *</Label>
                <Input
                  id="codigoServico"
                  value={codigoServico}
                  onChange={(e) => setCodigoServico(e.target.value)}
                  placeholder="Ex: 1.01"
                />
                <p className="text-xs text-gray-500">
                  Código conforme LC 116/03
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aliquotaIss">Alíquota ISS (%)</Label>
                <Input
                  id="aliquotaIss"
                  type="number"
                  step="0.01"
                  value={aliquotaIss || ''}
                  onChange={(e) => setAliquotaIss(Number(e.target.value))}
                  placeholder="Ex: 5.00"
                />
              </div>
              <div className="space-y-2">
                <Label>ISS Retido</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={issRetido} onCheckedChange={setIssRetido} />
                  <span className="text-sm text-gray-600">
                    {issRetido ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discriminacao">Discriminação do Serviço *</Label>
              <Textarea
                id="discriminacao"
                value={discriminacao}
                onChange={(e) => setDiscriminacao(e.target.value)}
                placeholder="Descreva detalhadamente os serviços prestados..."
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Esta descrição aparecerá na NFS-e
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
