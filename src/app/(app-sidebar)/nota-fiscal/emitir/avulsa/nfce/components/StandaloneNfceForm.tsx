'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'

// UI
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { ClientSelect, ClientData } from '../../components/ClientSelect'
import { InvoiceItems } from '../../../[orderId]/components/InvoiceItems'
import { NfcePaymentSection, Pagamento } from './NfcePaymentSection'
import { NfceTotalsSection } from './NfceTotalsSection'

// Icons
import {
  IconArrowLeft,
  IconCircleCheck,
  IconFileTypePdf,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconUser,
  IconMessage,
  IconX,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'
import { NfcePreviewDialog } from '@/components/common/fiscal/preview/NfcePreviewDialog'
import type { NfcePreview } from '@/types/fiscal/nfce-preview'

// Types
import type {
  NfePrepareItem,
  NfePrepareResponse,
} from '@/types/fiscal/nfe-prepare'
import type { OrderType } from '@/types/sales/order'

interface PrepareNfceData {
  numero: number
  serie: number
  ambiente: string
  emitCrt: number
  naturezaOperacao: string
  informacoesComplementares: string
  prazoCancelamentoMinutos: number
}

interface ProductFiscalResult {
  ncm?: string
  cean?: string
  productCode?: string
  commercialUnit?: string
  icmsCst?: string
  pisCst?: string
  cofinsCst?: string
  cfopInState?: string
}

export function StandaloneNfceForm({ orderId }: { orderId?: string }) {
  const linkedOrderId = orderId?.trim() || undefined
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previa, setPrevia] = useState<NfcePreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Prepare defaults
  const [prepareData, setPrepareData] = useState<PrepareNfceData | null>(null)

  // Form Fields
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [cpfConsumidor, setCpfConsumidor] = useState('')
  const [consumidorNome, setConsumidorNome] = useState('')

  const [items, setItems] = useState<NfePrepareItem[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [valorTroco, setValorTroco] = useState(0)
  const [informacoesComplementares, setInformacoesComplementares] = useState('')
  const [naturezaOperacao, setNaturezaOperacao] = useState(
    'Venda de mercadoria',
  )

  const router = useRouter()

  const fetchDefaults = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [defaultsResult, orderResult] = await Promise.all([
        getItem({ route: '/fiscal/nfce/prepare-standalone' }),
        linkedOrderId
          ? getItem({ route: `/sale/order/${linkedOrderId}` })
          : Promise.resolve(null),
      ])

      if (!defaultsResult.success || !defaultsResult.data) {
        setPrepareData(null)
        setError(
          defaultsResult.message || 'Erro ao carregar configurações fiscais',
        )
      } else {
        const data = defaultsResult.data as PrepareNfceData
        setPrepareData(data)
        if (data.naturezaOperacao) {
          setNaturezaOperacao(data.naturezaOperacao)
        }
        setInformacoesComplementares(data.informacoesComplementares || '')
      }

      if (orderResult?.success && orderResult?.data) {
        const order = orderResult.data as OrderType
        const { client, quotationItems } = order.quotation

        if (client) {
          const cnpjCpf = client.cpf || client.cnpj || ''
          setConsumidorNome(client.name || '')
          setCpfConsumidor(cnpjCpf)
          setSelectedClient({ id: client.id, name: client.name, cnpjCpf })
        }

        if (quotationItems?.length > 0) {
          const fiscalResults = await Promise.all(
            quotationItems.map((qi) =>
              qi.product.originalProductId
                ? getItem({
                    route: `/fiscal/product/${qi.product.originalProductId}`,
                  }).catch(() => null)
                : Promise.resolve(null),
            ),
          )

          const mappedItems: NfePrepareItem[] = quotationItems.map(
            (qi, idx) => {
              const fiscalResult = fiscalResults[idx]
              const fiscal =
                fiscalResult?.success && fiscalResult?.data
                  ? (fiscalResult.data as ProductFiscalResult)
                  : null

              return {
                itemNumber: idx + 1,
                productId: qi.product.originalProductId || '',
                productCode: fiscal?.productCode || '',
                description: qi.description || qi.product.name,
                ncm: fiscal?.ncm || '',
                cfop: fiscal?.cfopInState || '5102',
                cstIcms: fiscal?.icmsCst || '',
                cstIpi: '',
                cstPis: fiscal?.pisCst || '',
                cstCofins: fiscal?.cofinsCst || '',
                unit: fiscal?.commercialUnit || 'UN',
                uCom: fiscal?.commercialUnit || 'UN',
                ean: fiscal?.cean || '',
                ceantrib: '',
                quantity: Number(qi.product.quantity) || 1,
                unitValue: Number(qi.unitValue) || 0,
                discount: Number(qi.discount) || 0,
                freight: 0,
                insurance: 0,
                totalValue: Number(qi.finalValue) || 0,
                isService: false,
                needsConfiguration:
                  !fiscal?.ncm ||
                  !fiscal?.cfopInState ||
                  !fiscal?.icmsCst ||
                  !fiscal?.pisCst ||
                  !fiscal?.cofinsCst,
              }
            },
          )

          setItems(mappedItems)
        }
      }
    } catch {
      setPrepareData(null)
      setError('Erro ao carregar configurações fiscais')
    } finally {
      setIsLoading(false)
    }
  }, [linkedOrderId])

  useEffect(() => {
    fetchDefaults()
  }, [fetchDefaults])

  const handleClientSelect = (client: ClientData | null) => {
    setSelectedClient(client)
    if (client) {
      setCpfConsumidor(client.cnpjCpf || '')
      setConsumidorNome(client.name || '')
    } else {
      setCpfConsumidor('')
      setConsumidorNome('')
    }
  }

  const handleAddProduct = (newItem: NfePrepareItem) => {
    // Aumenta quantidade se o produto já existe em vez de adicionar linha duplicada
    const existingIndex = items.findIndex(
      (i) => i.productId === newItem.productId,
    )
    if (existingIndex > -1) {
      const newItems = [...items]
      newItems[existingIndex].quantity += 1
      newItems[existingIndex].totalValue =
        newItems[existingIndex].quantity * newItems[existingIndex].unitValue -
        newItems[existingIndex].discount
      setItems(newItems)
      toast.success(`Quantidade de "${newItem.description}" atualizada`)
    } else {
      setItems([...items, newItem])
      toast.success(`Produto "${newItem.description}" adicionado`)
    }
  }

  const handleRemoveItem = (itemNumber: number) => {
    const newItems = items
      .filter((item) => item.itemNumber !== itemNumber)
      .map((item, idx) => ({ ...item, itemNumber: idx + 1 }))
    setItems(newItems)
  }

  // Adapter: expõe items como NfePrepareResponse para reutilizar InvoiceItems
  const nfceData = useMemo(
    (): NfePrepareResponse => ({
      items,
      defaultCfop: '5102',
      emissao: { finalidade: 1 } as NfePrepareResponse['emissao'],
      orderId: '',
      quotationId: '',
      orderCode: '',
      hasExistingNfe: false,
      existingNfe: null,
      destinatario: {} as NfePrepareResponse['destinatario'],
      transportadora: {} as NfePrepareResponse['transportadora'],
      volumes: [],
      pagamento: {} as NfePrepareResponse['pagamento'],
      duplicatas: [],
      informacoesComplementares: '',
      totais: {} as NfePrepareResponse['totais'],
    }),
    [items],
  )

  // Compute Totals
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitValue,
    0,
  )
  const descontos = items.reduce((acc, item) => acc + item.discount, 0)
  const totalNota = Math.max(0, subtotal - descontos)
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0)

  /** Pré-checagens comuns a emitir e pré-visualizar. */
  const validarAntesDeEnviar = (): boolean => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto na NFC-e')
      return false
    }

    if (pagamentos.length === 0) {
      toast.error('Adicione pelo menos uma forma de pagamento')
      return false
    }

    const invalidItem = items.find(
      (item) =>
        item.needsConfiguration ||
        !item.ncm ||
        !item.cfop ||
        !item.unit ||
        !item.cstIcms ||
        !item.cstPis ||
        !item.cstCofins,
    )

    if (invalidItem) {
      toast.error(
        `Complete os dados fiscais do item "${invalidItem.description}" antes de emitir a NFC-e`,
      )
      return false
    }

    if (totalPago < totalNota) {
      toast.error('O valor total pago é menor que o valor total da nota')
      return false
    }

    return true
  }

  /**
   * Corpo da emissão. A pré-visualização manda EXATAMENTE este objeto.
   */
  const montarPayload = () => ({
    cpfConsumidor: cpfConsumidor ? cpfConsumidor.replace(/\D/g, '') : undefined,
    consumidorNome: consumidorNome || undefined,
    naturezaOperacao,
    informacoesComplementares,
    itens: items.map((item) => ({
      productId: item.productId,
      codigo: item.productCode,
      descricao: item.description,
      ncm: item.ncm,
      cfop: item.cfop,
      unidade: item.unit,
      quantidade: item.quantity,
      valorUnitario: item.unitValue,
      valorDesconto: item.discount || undefined,
      cean: item.ean || undefined,
      icmsCst: item.cstIcms || undefined,
      pisCst: item.cstPis || undefined,
      cofinsCst: item.cstCofins || undefined,
    })),
    pagamentos: pagamentos.map((pag) => ({
      tipo: pag.tipo,
      valor: pag.valor,
    })),
    valorTroco: valorTroco || undefined,
    orderId: linkedOrderId,
  })

  const handlePreview = async () => {
    if (!validarAntesDeEnviar()) return

    setIsPreviewing(true)
    try {
      const result = await createItemNew({
        route: '/fiscal/nfce/preview',
        data: montarPayload(),
      })

      if (!result.success) {
        throw new Error(
          result.message || 'Não foi possível gerar a pré-visualização',
        )
      }

      setPrevia(result.data as NfcePreview)
      setPreviewOpen(true)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível gerar a pré-visualização',
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleEmit = async () => {
    if (!validarAntesDeEnviar()) return

    setIsEmitting(true)

    try {
      const result = await createItemNew({
        route: '/fiscal/nfce/emit',
        data: montarPayload(),
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFC-e')
      }

      setPreviewOpen(false)
      toast.success('NFC-e avulsa emitida')
      router.push(
        linkedOrderId
          ? `/nota-fiscal/emitir?tab=gestao&highlight=${result.data?.id}`
          : '/nota-fiscal/emitir?tab=gestao',
      )
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao emitir NFC-e'
      toast.error(message)
    } finally {
      setIsEmitting(false)
    }
  }

  const isHomologacao = prepareData?.ambiente === 'HOMOLOGACAO'

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="space-y-6 pb-10">
          <div className="space-y-4">
            <Skeleton className="h-16 w-full animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full animate-pulse" />
                <Skeleton className="h-64 w-full animate-pulse" />
                <Skeleton className="h-48 w-full animate-pulse" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-64 w-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
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
                aria-label="Voltar para emissão avulsa"
              >
                <IconArrowLeft size={ICON_SIZE.sm} />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="type-page-title">
                    Nota Fiscal Avulsa - NFC-e
                  </h1>
                  <Badge variant="blueLight" className="ml-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                    Em digitação
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Série: {prepareData?.serie || 1} | Próximo número:{' '}
                  {prepareData?.numero || 1}
                </p>
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
            <div className="flex items-center gap-2">
              <CustomButton
                icon={IconFileTypePdf}
                title={isPreviewing ? 'Gerando...' : 'Pré-visualizar'}
                iconVariant="neutralOutline"
                onClick={handlePreview}
                disabled={isEmitting || isPreviewing}
                isLoading={isPreviewing}
              />
              <CustomButton
                icon={IconCircleCheck}
                title={isEmitting ? 'Emitindo...' : 'Emitir NFC-e'}
                iconVariant="successLight"
                onClick={handleEmit}
                disabled={isEmitting}
                isLoading={isEmitting}
              />
            </div>
          </div>

          <NfcePreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            previa={previa}
            isEmitting={isEmitting}
            onEmit={handleEmit}
          />
        </div>

        {/* Homologação banner */}
        {isHomologacao && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled
                size={ICON_SIZE.md}
                className="text-warning-500"
              />
              Atenção! O emissor está em ambiente de homologação, a nota emitida
              não terá valor fiscal.
            </p>
          </div>
        )}

        {/* Banner de vínculo com Ordem de Serviço */}
        {linkedOrderId && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Esta NFC-e será vinculada à Ordem de Serviço{' '}
            <span className="font-mono font-semibold">
              {linkedOrderId.slice(0, 8)}
            </span>
          </div>
        )}

        {error && (
          <Card className="border-error-200 bg-error-50">
            <CardContent className="flex items-center gap-4 py-6 px-6">
              <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
              <div>
                <p className="font-semibold text-error-700">
                  Erro ao carregar configurações fiscais
                </p>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                variant="neutralOutline"
                onClick={fetchDefaults}
                className="ml-auto"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Consumer Identification Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-2.5 py-4 bg-white border-b border-gray-100">
                <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
                <div className="flex-1">
                  <CardTitle>Consumidor (Opcional)</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-6 pt-4">
                <ClientSelect
                  selectedClient={selectedClient}
                  onSelect={handleClientSelect}
                  label="Selecionar Cliente Cadastrado"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cpf-consumidor">
                      CPF / CNPJ do Consumidor
                    </Label>
                    <Input
                      id="cpf-consumidor"
                      placeholder="000.000.000-00"
                      value={cpfConsumidor}
                      onChange={(e) => setCpfConsumidor(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="nome-consumidor">Nome do Consumidor</Label>
                    <Input
                      id="nome-consumidor"
                      placeholder="Consumidor não identificado"
                      value={consumidorNome}
                      onChange={(e) => setConsumidorNome(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Products Section */}
            <InvoiceItems
              data={nfceData}
              onUpdate={(updated) => setItems(updated.items)}
              onAddProduct={handleAddProduct}
              onRemoveItem={handleRemoveItem}
            />

            {/* 3. Payment Section */}
            <NfcePaymentSection
              pagamentos={pagamentos}
              onChangePagamentos={setPagamentos}
              totalNota={totalNota}
              valorTroco={valorTroco}
              onChangeValorTroco={setValorTroco}
            />

            {/* 4. Complementary Info Section */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-2.5 py-4 bg-white border-b border-gray-100">
                <FeaturedIcon variant="neutralOutline" Icon={IconMessage} />
                <div className="flex-1">
                  <CardTitle>Informações Complementares</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-1.5">
                  <Textarea
                    placeholder="Informações de interesse do contribuinte ou fisco..."
                    className="min-h-[100px]"
                    value={informacoesComplementares}
                    onChange={(e) =>
                      setInformacoesComplementares(e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <NfceTotalsSection
              subtotal={subtotal}
              descontos={descontos}
              totalNota={totalNota}
              totalPago={totalPago}
              troco={valorTroco}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
