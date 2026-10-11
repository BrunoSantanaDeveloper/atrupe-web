'use client'

// Duplicar produto (padrão do sistema, confirmado pelo time em 03/10/2026):
// cria outro produto com os mesmos dados do cadastro e a mesma composição
// (etapas, campos do orçamento e fórmulas), e abre o novo para ser editado a
// partir do primeiro. Substitui o "Copiar de outro produto" da composição.

import { useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'

// Actions
import { getItemOld, createItemNew } from '@/actions/_cruds'
import { copyCompositionFrom } from '@/actions/product-assembly'
import { productBodyFrom } from './productBody'

// Libs
import { DEMO_DATA } from '@/lib/demo'

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
      const source = await getItemOld({ route: 'productRoute', id: productId })
      if (!source?.id) throw new Error('Produto não encontrado')

      // O mesmo corpo que o diálogo do produto envia ao criar, sem os ids
      // dos itens, que são do produto de origem
      const body = {
        ...productBodyFrom(source, {
          name: `${source.name} (cópia)`,
          code: source.code ? `${source.code}-COPIA` : undefined,
        }),
        items: productBodyFrom(source).items.map(
          ({ id: _id, ...item }: { id?: string }) => item,
        ),
      }

      const created = await createItemNew({ route: '/product', data: body })
      if (!created.success || !created.data?.id) {
        throw new Error(created.message || 'Não foi possível criar a cópia')
      }

      // A composição vai junto, como cópia independente (etapas, campos e
      // fórmulas). Falhar aqui não desfaz o produto: ele fica sem composição.
      // Ela ainda roda sobre dados de exemplo: sem a flag, não há o que copiar
      const composition = DEMO_DATA
        ? await copyCompositionFrom({
            productId: created.data.id,
            sourceProductId: productId,
          })
        : null
      if (
        composition &&
        !composition.success &&
        !/não tem composição/.test(composition.message)
      ) {
        toast.warning(
          `Produto duplicado, mas a composição não veio: ${composition.message}`,
        )
      } else {
        toast.success(`${name} duplicado. Edite a cópia a partir daqui.`)
      }

      await queryClient.invalidateQueries({ queryKey: ['product-list'] })
      // O contador da aba Ativos
      await queryClient.invalidateQueries({ queryKey: ['product-totals'] })
      await queryClient.invalidateQueries({ queryKey: ['composed-products'] })
      onDone?.(created.data.id)
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
