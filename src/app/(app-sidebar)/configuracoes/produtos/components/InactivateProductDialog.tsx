'use client'

// Inativar o produto com "onde é usado" (PAD-7, decidido em 05/10/2026), no
// mesmo diálogo dos materiais: a lista dos produtos em que ele é parte, pela
// etapa, antes de confirmar. A etapa fica nesses produtos, marcada "produto
// inativo". O diálogo também mostra quantos orçamentos abertos têm o produto:
// pela regra do Maicol eles ficam marcados e não podem ser aprovados até o
// item ser trocado ou retirado, mas esse bloqueio é da rotina do orçamento.
// O cadastro (API) continua sendo quem inativa; o mock só guarda a marca
// para a composição.

import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Actions
import { createItemNew } from '@/actions/_cruds'
import { getProductUsage } from '@/actions/assembly'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconBan, IconRestore } from '@tabler/icons-react'

interface Props {
  product: { id: string; name: string; active: boolean }
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function InactivateProductDialog({
  product,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const inactivating = product.active

  // Onde é usado (PAD-7): como parte e nos orçamentos abertos
  const { data, isLoading } = useQuery({
    queryKey: ['product-usage', product.id],
    queryFn: () => getProductUsage({ productId: product.id }),
    enabled: open && inactivating,
  })
  const usage = data?.data?.asPart || []
  const openQuotations = data?.data?.openQuotations || []

  const confirm = async () => {
    setSaving(true)
    const result = await createItemNew({
      route: `/product/${product.id}/toggle-status`,
      data: { isActive: !inactivating },
    })
    if (!result.success) {
      setSaving(false)
      toast.error(result.message || 'Não foi possível alterar o produto')
      return
    }
    // A composição lê o cadastro: o produto inativo vem marcado onde é parte
    // Fecha antes de recarregar, como em produção: recarregando com o
    // diálogo aberto, o título e o botão viravam "Ativar" e um segundo
    // clique reativava o produto (CC-10)
    toast.success(inactivating ? 'Produto inativado' : 'Produto ativado')
    onOpenChange(false)
    await queryClient.invalidateQueries()
    setSaving(false)
    onDone?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon
              variant="neutralOutline"
              Icon={inactivating ? IconBan : IconRestore}
            />
            <DialogTitle>
              {inactivating
                ? `Inativar ${product.name}?`
                : `Ativar ${product.name}?`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirmação para inativar ou ativar o produto.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!inactivating ? (
            <p className="text-sm text-gray">
              O produto fica disponível de novo para orçamentos e vendas, e as
              etapas em que ele é parte perdem a marca de produto inativo.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-gray">Procurando onde ele é usado…</p>
          ) : (
            <>
              <p className="text-sm text-gray">
                {usage.length === 0
                  ? 'Ele não é parte de nenhum outro produto. Fica indisponível para novos orçamentos e vendas.'
                  : `Ele é parte de ${usage.length} ${usage.length === 1 ? 'produto' : 'produtos'}. A etapa continua lá, marcada "produto inativo"; ele só deixa de ser oferecido em novos orçamentos e como parte nova.`}
              </p>
              {usage.length > 0 && (
                <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                  {usage.map((item, index) => (
                    <li
                      key={`${item.productId}-${item.stage}-${index}`}
                      className="flex items-center justify-between gap-3 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                        <span className="block text-xs text-gray">
                          Etapa {item.stage}
                        </span>
                      </span>
                      <Badge variant="neutralLight">Produto</Badge>
                    </li>
                  ))}
                </ul>
              )}
              {openQuotations.length > 0 && (
                <p className="rounded-lg bg-warning-25 px-3 py-2 text-sm text-warning-700">
                  {openQuotations.length === 1
                    ? '1 orçamento aberto tem este produto'
                    : `${openQuotations.length} orçamentos abertos têm este produto`}
                  : troque ou retire o item antes de aprovar.
                </p>
              )}
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant={inactivating ? 'error' : 'default'}
            isLoading={saving}
            disabled={inactivating && isLoading}
            onClick={confirm}
          >
            {inactivating ? 'Inativar' : 'Ativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
