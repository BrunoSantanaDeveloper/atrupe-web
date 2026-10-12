'use client'

// Duplicar produto (padrão do sistema, confirmado pelo time em 03/10/2026):
// cria outro produto com os mesmos dados do cadastro e a mesma composição
// (etapas, campos do orçamento e fórmulas), e abre o novo para ser editado a
// partir do primeiro. Substitui o "Copiar de outro produto" da composição.

import { useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'

// Actions
import { duplicateProduct } from '@/actions/assembly'

// Third-party
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCopy } from '@tabler/icons-react'

interface Props {
  productId: string
  name: string
  // Recebe o id do produto novo, para a lista abri-lo em edição
  onDone?: (newProductId: string) => void
}

export function DuplicateProductButton({ productId, name, onDone }: Props) {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)

  const duplicate = async () => {
    setBusy(true)
    try {
      // O servidor copia o cadastro e, com o plano, a composição (etapas,
      // campos, fórmulas, variações e faixas) num passo só; a cópia nasce em
      // edição (IP-14)
      const created = await duplicateProduct({
        productId,
        name: `${name} (cópia)`,
      })
      if (!created.success || !created.data) {
        throw new Error(created.message || 'Não foi possível criar a cópia')
      }
      toast.success(`${name} duplicado. Edite a cópia a partir daqui.`)

      await queryClient.invalidateQueries({ queryKey: ['product-list'] })
      // O contador da aba Ativos
      await queryClient.invalidateQueries({ queryKey: ['product-totals'] })
      await queryClient.invalidateQueries({ queryKey: ['composed-products'] })
      onDone?.(created.data)
    } catch (error) {
      toast.error(
        `Erro ao duplicar: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <ActionButton
      Icon={IconCopy}
      tooltip={`Duplicar ${name}`}
      disabled={busy}
      onClick={duplicate}
    />
  )
}
