'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

// Sub-components
import { PdvItemForm } from './PdvItemForm'
import { PdvItemsTable } from './PdvItemsTable'
import { PdvConsumerPanel } from './PdvConsumerPanel'
import { PdvPaymentPanel } from './PdvPaymentPanel'
import { PdvTotalsPanel } from './PdvTotalsPanel'

// Types
import type { PdvItem, Pagamento, EmissionResult } from './pdv-types'

// Actions
import { createItemNew } from '@/actions/_cruds'

export function NfcePdvClient() {
  const [items, setItems] = useState<PdvItem[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [cpfConsumidor, setCpfConsumidor] = useState('')
  const [nomeConsumidor, setNomeConsumidor] = useState('')
  const [isEmitting, setIsEmitting] = useState(false)
  const [resultDialog, setResultDialog] = useState(false)
  const [emissionResult, setEmissionResult] = useState<EmissionResult | null>(
    null,
  )

  // Totals
  const totalItens = items.reduce((acc, item) => acc + item.valorTotal, 0)
  const totalDescontos = items.reduce(
    (acc, item) => acc + item.valorDesconto,
    0,
  )
  const totalNota = totalItens - totalDescontos
  const totalPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0)
  const troco = totalPago > totalNota ? totalPago - totalNota : 0

  const handleAddItem = (item: PdvItem) => {
    setItems((prev) => [...prev, item])
  }

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleAddPagamento = (pagamento: Pagamento) => {
    setPagamentos((prev) => [...prev, pagamento])
  }

  const handleRemovePagamento = (index: number) => {
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

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <PdvItemForm onAddItem={handleAddItem} itemCount={items.length} />
          <PdvItemsTable
            items={items}
            totalNota={totalNota}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <div className="space-y-4">
          <PdvConsumerPanel
            cpf={cpfConsumidor}
            nome={nomeConsumidor}
            onCpfChange={setCpfConsumidor}
            onNomeChange={setNomeConsumidor}
          />
          <PdvPaymentPanel
            pagamentos={pagamentos}
            onAddPagamento={handleAddPagamento}
            onRemovePagamento={handleRemovePagamento}
          />
          <PdvTotalsPanel
            totalItens={totalItens}
            totalDescontos={totalDescontos}
            totalNota={totalNota}
            totalPago={totalPago}
            troco={troco}
            isEmitting={isEmitting}
            hasItems={items.length > 0}
            onEmitir={handleEmitir}
            resultDialog={resultDialog}
            onResultDialogChange={setResultDialog}
            emissionResult={emissionResult}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
