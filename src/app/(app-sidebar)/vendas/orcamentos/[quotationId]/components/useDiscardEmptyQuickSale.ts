'use client'

// A venda rápida nasce como orçamento ao abrir (a API cria com os padrões da
// configuração), antes de o vendedor escolher o item. Quem abre e sai sem
// lançar nada deixava um registro vazio na lista de orçamentos. Ao sair da
// tela com a venda ainda em Digitação e sem nenhum item, ela é apagada.
//
// Limite: fechar a aba ou o navegador não passa por aqui, e o número da
// série já foi consumido. O certo é a API só criar a venda rápida junto com
// o primeiro item (pendência do backend).

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { deleteItemNew } from '@/actions/_cruds'
import type { QuotationType } from '@/types/sales/quotation'

// A saída é adiada um pouco: se a mesma venda volta a montar logo em seguida
// (StrictMode, recarga da página pelo roteador), a exclusão é cancelada
const pending = new Map<string, ReturnType<typeof setTimeout>>()
const GRACE_MS = 800

export function useDiscardEmptyQuickSale(data: QuotationType) {
  const queryClient = useQueryClient()
  const latest = useRef(data)
  latest.current = data

  useEffect(() => {
    const id = String(data.id)
    const scheduled = pending.get(id)
    if (scheduled) {
      clearTimeout(scheduled)
      pending.delete(id)
    }

    return () => {
      const sale = latest.current
      const empty =
        sale?.quickSale &&
        sale.status === 'OPEN' &&
        !(sale.quotationItems?.length ?? 0)
      if (!empty) return

      pending.set(
        id,
        setTimeout(async () => {
          pending.delete(id)
          const res = await deleteItemNew({ route: `/sale/quotation/${id}` })
          if (!res.success) return
          queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
          queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
        }, GRACE_MS),
      )
    }
    // Uma vez por venda: a leitura do estado mais novo vem do ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.id])
}
