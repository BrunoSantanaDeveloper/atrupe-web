'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { ClientSelect, ClientData } from '../../components/ClientSelect'
import { ProductSelector } from '../../nfe/components/ProductSelector'
import { NfcePaymentSection, Pagamento } from './NfcePaymentSection'
import { NfceTotalsSection } from './NfceTotalsSection'

// Icons
import {
  IconArrowLeft,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertTriangleFilled,
  IconFileInvoice,
  IconUser,
  IconTrash,
  IconMessage,
  IconX,
} from '@tabler/icons-react'

// Actions
import { getItem, createItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareItem } from '@/types/fiscal/nfe-prepare'

interface PrepareNfceData {
  numero: number
  serie: number
  ambiente: string
  emitCrt: number
  naturezaOperacao: string
  informacoesComplementares: string
  prazoCancelamentoMinutos: number
}

export function StandaloneNfceForm({ orderId }: { orderId?: string }) {
  const linkedOrderId = orderId?.trim() || undefined
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
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
      const result = await getItem({
        route: '/fiscal/nfce/prepare-standalone',
      })

      if (!result.success || !result.data) {
        setPrepareData(null)
        setError(result.message || 'Erro ao carregar configurações fiscais')
      } else {
        const data = result.data as PrepareNfceData
        setPrepareData(data)
        if (data.naturezaOperacao) {
          setNaturezaOperacao(data.naturezaOperacao)
        }
        setInformacoesComplementares(data.informacoesComplementares || '')
      }
    } catch {
      setPrepareData(null)
      setError('Erro ao carregar configurações fiscais')
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    // Check if product already exists to increase quantity instead of adding duplicate line
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
      .map((item, idx) => ({
        ...item,
        itemNumber: idx + 1,
      }))
    setItems(newItems)
  }

  const handleQuantityChange = (itemNumber: number, qty: number) => {
    if (qty <= 0) return
    const newItems = items.map((item) => {
      if (item.itemNumber === itemNumber) {
        const quantity = qty
        const totalValue = quantity * item.unitValue - item.discount
        return { ...item, quantity, totalValue }
      }
      return item
    })
    setItems(newItems)
  }

  const handleDiscountChange = (itemNumber: number, disc: number) => {
    if (disc < 0) return
    const newItems = items.map((item) => {
      if (item.itemNumber === itemNumber) {
        const discount = disc
        const totalValue = item.quantity * item.unitValue - discount
        return { ...item, discount, totalValue }
      }
      return item
    })
    setItems(newItems)
  }

  // Compute Totals
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitValue,
    0,
  )
  const descontos = items.reduce((acc, item) => acc + item.discount, 0)
  const totalNota = Math.max(0, subtotal - descontos)
  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0)

  const handleEmit = async () => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um produto na NFC-e')
      return
    }

    if (pagamentos.length === 0) {
      toast.error('Adicione pelo menos uma forma de pagamento')
      return
    }

    if (totalPago < totalNota) {
      toast.error('O valor total pago é menor que o valor total da nota')
      return
    }

    setIsEmitting(true)

    try {
      const payload = {
        cpfConsumidor: cpfConsumidor
          ? cpfConsumidor.replace(/\D/g, '')
          : undefined,
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
          icmsOrigem: item.cstIcms ? '0' : undefined, // fallback logic
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
      }

      const result = await createItemNew({
        route: '/fiscal/nfce/emit',
        data: payload,
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFC-e')
      }

      toast.success('NFC-e avulsa emitida com sucesso!')
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
                <IconArrowLeft size={20} />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900">
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

        {/* Homologação banner */}
        {isHomologacao && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3 text-center transition-all animate-in fade-in slide-in-from-top-2">
            <p className="text-warning-800 font-medium text-sm flex items-center justify-center gap-2">
              <IconAlertTriangleFilled size={18} className="text-warning-500" />
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
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Consumidor (Opcional)
                  </CardTitle>
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
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <FeaturedIcon
                    variant="neutralOutline"
                    Icon={IconFileInvoice}
                  />
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Itens da Nota
                  </CardTitle>
                </div>
                <ProductSelector
                  onAddProduct={handleAddProduct}
                  nextItemNumber={items.length + 1}
                  defaultCfop="5102"
                />
              </CardHeader>

              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <p className="text-sm">Nenhum produto adicionado ainda.</p>
                    <p className="text-xs">
                      Utilize o botão &quot;Adicionar Produto&quot; acima.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Item</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-28">Qtd.</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead className="w-32">Desc. (R$)</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-16 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.itemNumber}>
                          <TableCell className="font-medium text-gray-900">
                            {item.itemNumber}
                          </TableCell>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell className="font-medium text-gray-800">
                            {item.description}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              className="h-8 py-1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.itemNumber,
                                  parseInt(e.target.value) || 1,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {item.unitValue.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              className="h-8 py-1"
                              value={item.discount}
                              onChange={(e) =>
                                handleDiscountChange(
                                  item.itemNumber,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">
                            {item.totalValue.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.itemNumber)}
                              className="text-red-500 hover:text-red-700 transition"
                            >
                              <IconTrash size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

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
                  <CardTitle className="text-gray-700 font-semibold text-base">
                    Informações Complementares
                  </CardTitle>
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
