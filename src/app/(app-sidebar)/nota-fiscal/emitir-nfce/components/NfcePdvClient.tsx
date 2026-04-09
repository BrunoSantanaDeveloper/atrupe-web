'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Icons
import {
  IconPlus,
  IconTrash,
  IconCash,
  IconCreditCard,
  IconQrcode,
  IconReceipt,
  IconShoppingCart,
  IconUser,
} from '@tabler/icons-react'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Types
type PdvItem = {
  id: string
  productId: string
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valorUnitario: number
  valorDesconto: number
  valorTotal: number
}

type Pagamento = {
  tipo: string
  valor: number
  label: string
}

const PAYMENT_TYPES = [
  { value: '01', label: 'Dinheiro', icon: IconCash },
  { value: '03', label: 'Cartão de Crédito', icon: IconCreditCard },
  { value: '04', label: 'Cartão de Débito', icon: IconCreditCard },
  { value: '17', label: 'PIX', icon: IconQrcode },
  { value: '99', label: 'Outros', icon: IconReceipt },
]

export function NfcePdvClient() {
  // Item state
  const [items, setItems] = useState<PdvItem[]>([])
  const [itemCodigo, setItemCodigo] = useState('')
  const [itemDescricao, setItemDescricao] = useState('')
  const [itemNcm, setItemNcm] = useState('00000000')
  const [itemCfop, setItemCfop] = useState('5102')
  const [itemQtd, setItemQtd] = useState('1')
  const [itemValor, setItemValor] = useState('')
  const [itemDesconto, setItemDesconto] = useState('0')

  // Payment state
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [pagTipo, setPagTipo] = useState('01')
  const [pagValor, setPagValor] = useState('')

  // Consumer
  const [cpfConsumidor, setCpfConsumidor] = useState('')
  const [nomeConsumidor, setNomeConsumidor] = useState('')

  // Emission
  const [isEmitting, setIsEmitting] = useState(false)
  const [resultDialog, setResultDialog] = useState(false)
  const [emissionResult, setEmissionResult] = useState<any>(null)

  // Totals
  const totalItens = items.reduce((acc, item) => acc + item.valorTotal, 0)
  const totalDescontos = items.reduce(
    (acc, item) => acc + item.valorDesconto,
    0,
  )
  const totalNota = totalItens - totalDescontos
  const totalPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0)
  const troco = totalPago > totalNota ? totalPago - totalNota : 0

  const addItem = useCallback(() => {
    if (!itemDescricao) {
      toast.error('Informe a descrição do produto.')
      return
    }
    const valor = parseFloat(itemValor)
    const qtd = parseFloat(itemQtd)
    const desc = parseFloat(itemDesconto) || 0

    if (!valor || valor <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    if (!qtd || qtd <= 0) {
      toast.error('Informe uma quantidade válida.')
      return
    }

    const newItem: PdvItem = {
      id: crypto.randomUUID(),
      productId: itemCodigo || `PDV-${Date.now()}`,
      codigo: itemCodigo || `PDV-${items.length + 1}`,
      descricao: itemDescricao,
      ncm: itemNcm || '00000000',
      cfop: itemCfop || '5102',
      unidade: 'UN',
      quantidade: qtd,
      valorUnitario: valor,
      valorDesconto: desc,
      valorTotal: qtd * valor,
    }

    setItems((prev) => [...prev, newItem])
    // Reset fields
    setItemCodigo('')
    setItemDescricao('')
    setItemQtd('1')
    setItemValor('')
    setItemDesconto('0')

    toast.success(`${newItem.descricao} adicionado.`)
  }, [itemCodigo, itemDescricao, itemNcm, itemCfop, itemQtd, itemValor, itemDesconto, items.length])

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addPagamento = useCallback(() => {
    const valor = parseFloat(pagValor)
    if (!valor || valor <= 0) {
      toast.error('Informe o valor do pagamento.')
      return
    }

    const payType = PAYMENT_TYPES.find((p) => p.value === pagTipo)
    setPagamentos((prev) => [
      ...prev,
      { tipo: pagTipo, valor, label: payType?.label || pagTipo },
    ])
    setPagValor('')
  }, [pagTipo, pagValor])

  const removePagamento = (index: number) => {
    setPagamentos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleEmitir = async () => {
    if (items.length === 0) {
      toast.error('Adicione ao menos um item.')
      return
    }
    if (pagamentos.length === 0) {
      toast.error('Adicione ao menos uma forma de pagamento.')
      return
    }
    if (totalPago < totalNota) {
      toast.error(
        `Pagamento insuficiente. Falta ${(totalNota - totalPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      )
      return
    }

    setIsEmitting(true)
    try {
      const payload = {
        naturezaOperacao: 'Venda de mercadoria',
        cpfConsumidor: cpfConsumidor.replace(/\D/g, '') || undefined,
        consumidorNome: nomeConsumidor || undefined,
        itens: items.map((item) => ({
          productId: item.productId,
          codigo: item.codigo,
          descricao: item.descricao,
          ncm: item.ncm,
          cfop: item.cfop,
          unidade: item.unidade,
          quantidade: item.quantidade,
          valorUnitario: item.valorUnitario,
          valorDesconto: item.valorDesconto,
        })),
        pagamentos: pagamentos.map((pag) => ({
          tipo: pag.tipo,
          valor: pag.valor,
        })),
        valorTroco: troco > 0 ? troco : undefined,
      }

      const result = await createItemNew({
        route: '/fiscal/nfce/emit',
        data: payload,
      })

      if (!result.success) {
        throw new Error(result.message || 'Erro ao emitir NFC-e')
      }

      setEmissionResult(result.data)
      setResultDialog(true)
      toast.success('NFC-e emitida com sucesso!')

      // Reset PDV
      setItems([])
      setPagamentos([])
      setCpfConsumidor('')
      setNomeConsumidor('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao emitir'
      toast.error(message)
    } finally {
      setIsEmitting(false)
    }
  }

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Items + Add */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Item Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconShoppingCart className="h-5 w-5" />
                Adicionar Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Código</Label>
                  <Input
                    value={itemCodigo}
                    onChange={(e) => setItemCodigo(e.target.value)}
                    placeholder="Cód."
                  />
                </div>
                <div className="col-span-2 md:col-span-1 space-y-1">
                  <Label className="text-xs">Descrição *</Label>
                  <Input
                    value={itemDescricao}
                    onChange={(e) => setItemDescricao(e.target.value)}
                    placeholder="Nome do produto"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">NCM</Label>
                  <Input
                    value={itemNcm}
                    onChange={(e) => setItemNcm(e.target.value)}
                    placeholder="NCM"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CFOP</Label>
                  <Input
                    value={itemCfop}
                    onChange={(e) => setItemCfop(e.target.value)}
                    placeholder="CFOP"
                    maxLength={4}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qtd *</Label>
                  <Input
                    type="number"
                    min={0.001}
                    step="1"
                    value={itemQtd}
                    onChange={(e) => setItemQtd(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor Unit. *</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={itemValor}
                    onChange={(e) => setItemValor(e.target.value)}
                    placeholder="0,00"
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Desconto</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={itemDesconto}
                    onChange={(e) => setItemDesconto(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <Button
                className="mt-3 w-full"
                variant="default"
                onClick={addItem}
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Itens ({items.length})
                </CardTitle>
                <Badge variant="blue" className="text-sm">
                  Total: {formatBRL(totalNota)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <IconShoppingCart size={40} className="mb-2" />
                  <p className="text-sm">
                    Nenhum item adicionado. Adicione produtos acima.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">V. Unit.</TableHead>
                        <TableHead className="text-right">Desc.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-gray-500">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">
                                {item.descricao}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {item.codigo}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantidade}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBRL(item.valorUnitario)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.valorDesconto > 0
                              ? formatBRL(item.valorDesconto)
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBRL(
                              item.valorTotal - item.valorDesconto,
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="iconXs"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Payment + Consumer + Emit */}
        <div className="space-y-4">
          {/* Consumer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Consumidor (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">CPF</Label>
                <Input
                  value={cpfConsumidor}
                  onChange={(e) => setCpfConsumidor(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={nomeConsumidor}
                  onChange={(e) => setNomeConsumidor(e.target.value)}
                  placeholder="Nome do consumidor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconCash className="h-5 w-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Forma</Label>
                <Select value={pagTipo} onValueChange={setPagTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={pagValor}
                  onChange={(e) => setPagValor(e.target.value)}
                  placeholder="0,00"
                  onKeyDown={(e) => e.key === 'Enter' && addPagamento()}
                />
              </div>
              <Button
                variant="neutralOutline"
                size="sm"
                className="w-full"
                onClick={addPagamento}
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Adicionar Pagamento
              </Button>

              {pagamentos.length > 0 && (
                <div className="space-y-2 pt-2">
                  {pagamentos.map((pag, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-2"
                    >
                      <span>{pag.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatBRL(pag.valor)}
                        </span>
                        <Button
                          variant="ghost"
                          size="iconXs"
                          onClick={() => removePagamento(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <IconTrash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals + Emit */}
          <Card className="border-brand/30 bg-brand-50/30">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatBRL(totalItens)}</span>
              </div>
              {totalDescontos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descontos</span>
                  <span className="text-red-500">
                    -{formatBRL(totalDescontos)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatBRL(totalNota)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pago</span>
                <span
                  className={
                    totalPago >= totalNota ? 'text-green-600' : 'text-red-500'
                  }
                >
                  {formatBRL(totalPago)}
                </span>
              </div>
              {troco > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Troco</span>
                  <span className="text-blue-600 font-medium">
                    {formatBRL(troco)}
                  </span>
                </div>
              )}
              <Separator />
              <Button
                className="w-full h-12 text-base"
                onClick={handleEmitir}
                disabled={isEmitting || items.length === 0}
                isLoading={isEmitting}
              >
                <IconReceipt className="h-5 w-5 mr-2" />
                {isEmitting ? 'Emitindo...' : 'Emitir NFC-e'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={resultDialog} onOpenChange={setResultDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <IconReceipt className="h-5 w-5" />
              NFC-e Emitida!
            </DialogTitle>
            <DialogDescription>
              A nota fiscal de consumidor foi emitida com sucesso.
            </DialogDescription>
          </DialogHeader>
          {emissionResult && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Número</span>
                  <span className="font-medium">
                    {emissionResult.numero}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Série</span>
                  <span className="font-medium">
                    {emissionResult.serie}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <Badge variant="success">
                    {emissionResult.status === 'AUTHORIZED'
                      ? 'Autorizada'
                      : emissionResult.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500 block">Valor</span>
                  <span className="font-medium">
                    {formatBRL(emissionResult.valorTotal || 0)}
                  </span>
                </div>
              </div>
              {emissionResult.chaveAcesso && (
                <div className="text-xs break-all bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block mb-1">
                    Chave de Acesso:
                  </span>
                  {emissionResult.chaveAcesso}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {emissionResult.danfeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(emissionResult.danfeUrl, '_blank')
                    }
                  >
                    Ver DANFE
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setResultDialog(false)}
                >
                  Nova Venda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
