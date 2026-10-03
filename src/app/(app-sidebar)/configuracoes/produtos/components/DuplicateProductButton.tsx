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

      // O mesmo corpo que o diálogo do produto envia ao criar
      const body = {
        name: `${source.name} (cópia)`,
        code: source.code ? `${source.code}-COPIA` : undefined,
        categoryId: source.categoryId ?? source.category?.id ?? null,
        sectorId: source.sectorId ?? source.sector?.id ?? null,
        technicalDescription: source.technicalDescription ?? '',
        allowEditValues: source.allowEditValues ?? true,
        allowEditDescription: source.allowEditDescription ?? true,
        imageUrl: source.imageUrl || null,
        imageSize: source.imageSize || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: (source.items || []).map((item: any) => ({
          name: item.name,
          unitKind: item.unitKind,
          unitCost: item.unitCost,
          salePrice: item.salePrice,
          width: item.width ?? null,
          height: item.height ?? null,
          length: item.length ?? null,
          weight: item.weight ?? null,
          volume: item.volume ?? null,
          distance: item.distance ?? null,
          duration: item.duration ?? null,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productionStages: (source.productionStages || []).map((stage: any) => ({
          id: stage.id,
          isActive: stage.isActive ?? stage.isAcive ?? false,
        })),
      }

      const created = await createItemNew({ route: '/product', data: body })
      if (!created.success || !created.data?.id) {
        throw new Error(created.message || 'Não foi possível criar a cópia')
      }

      // A composição vai junto, como cópia independente (etapas, campos e
      // fórmulas). Falhar aqui não desfaz o produto: ele fica sem composição
      const composition = await copyCompositionFrom({
        productId: created.data.id,
        sourceProductId: productId,
      })
      if (
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
