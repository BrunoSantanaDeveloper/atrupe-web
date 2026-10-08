'use client'

// Inativar o material (05/10/2026): ele sai das composições em que está, então
// o diálogo mostra a lista de onde é usado e pede a confirmação. Reativar não
// devolve o material às composições.

import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

// Types
import type { Material } from '../types'

// Actions
import { setMaterialActive } from '@/actions/materials'
import {
  getMaterialUsage,
  removeMaterialFromCompositions,
} from '@/actions/product-assembly'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons

interface Props {
  material: Material
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

export function InactivateMaterialDialog({
  material,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const inactivating = material.active

  const { data, isLoading } = useQuery({
    queryKey: ['material-usage', material.id],
    queryFn: () => getMaterialUsage({ materialId: material.id }),
    enabled: open && inactivating,
  })
  const usage = data?.data || []

  const confirm = async () => {
    setSaving(true)
    if (inactivating && usage.length) {
      const removed = await removeMaterialFromCompositions({
        materialId: material.id,
      })
      if (!removed.success) {
        setSaving(false)
        toast.error(removed.message)
        return
      }
    }
    const res = await setMaterialActive({
      id: material.id,
      active: !inactivating,
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message)
      return
    }
    toast.success(inactivating ? 'Material inativado' : 'Material reativado')
    queryClient.invalidateQueries({ queryKey: ['materials'] })
    queryClient.invalidateQueries({ queryKey: ['assembly'] })
    queryClient.invalidateQueries({ queryKey: ['process-detail'] })
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>
              {inactivating
                ? `Inativar ${material.name}?`
                : `Reativar ${material.name}?`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirmação para inativar ou reativar o material.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!inactivating ? (
            <p className="text-sm text-gray">
              Ele volta a aparecer para escolher em composições e vendas. As
              composições de onde ele saiu não o recebem de volta sozinhas.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-gray">Procurando onde ele é usado…</p>
          ) : usage.length === 0 ? (
            <p className="text-sm text-gray">
              Ele não está em nenhuma composição. Deixa de aparecer para
              escolher em composições e vendas.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray">
                Ele está em {usage.length}{' '}
                {usage.length === 1 ? 'composição' : 'composições'} e vai sair
                de todas. Onde ele era a única opção da linha, a linha sai da
                etapa. Os orçamentos já feitos não mudam.
              </p>
              <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                {usage.map((item, index) => (
                  <li
                    key={`${item.kind}-${item.name}-${item.stage}-${index}`}
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
                    <Badge variant="neutralLight">
                      {item.kind === 'PRODUCT' ? 'Produto' : 'Processo'}
                    </Badge>
                  </li>
                ))}
              </ul>
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
            {inactivating
              ? usage.length
                ? 'Retirar e inativar'
                : 'Inativar'
              : 'Reativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
