'use client'

// Inativar o processo com "onde é usado" (PAD-7, decidido em 05/10/2026), no
// mesmo diálogo dos materiais: a lista dos produtos que o usam, pela etapa,
// antes de confirmar. Diferente do material, inativar NÃO tira a etapa dos
// produtos: ela fica, marcada "processo inativo", e só deixa de ser oferecida
// nas composições novas. Reativar tira a marca.

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
import { getProcessUsage, updateProcessMeta } from '@/actions/processes'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconBan, IconRestore } from '@tabler/icons-react'

interface Props {
  process: { id: string; name: string; active: boolean }
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function InactivateProcessDialog({
  process,
  open,
  onOpenChange,
  onDone,
}: Props) {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const inactivating = process.active

  const { data, isLoading } = useQuery({
    queryKey: ['process-usage', process.id],
    queryFn: () => getProcessUsage({ processId: process.id }),
    enabled: open && inactivating,
  })
  const usage = data?.data || []

  const confirm = async () => {
    setSaving(true)
    const res = await updateProcessMeta({
      processId: process.id,
      values: { active: !inactivating },
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message)
      return
    }
    toast.success(inactivating ? 'Processo inativado' : 'Processo reativado')
    queryClient.invalidateQueries({ queryKey: ['process-list'] })
    queryClient.invalidateQueries({ queryKey: ['process-detail'] })
    queryClient.invalidateQueries({ queryKey: ['assembly'] })
    queryClient.invalidateQueries({ queryKey: ['next-step'] })
    onOpenChange(false)
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
                ? `Inativar ${process.name}?`
                : `Reativar ${process.name}?`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirmação para inativar ou reativar o processo.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {!inactivating ? (
            <p className="text-sm text-gray">
              Ele volta a aparecer para escolher nas composições e no orçamento.
              As etapas que o usam perdem a marca de processo inativo.
            </p>
          ) : isLoading ? (
            <p className="text-sm text-gray">Procurando onde ele é usado…</p>
          ) : usage.length === 0 ? (
            <p className="text-sm text-gray">
              Nenhum produto usa este processo. Ele deixa de aparecer para
              escolher nas composições e no orçamento.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray">
                Ele é usado em {usage.length}{' '}
                {usage.length === 1 ? 'etapa' : 'etapas'}. A etapa continua nos
                produtos, marcada &quot;processo inativo&quot;; o processo só
                deixa de ser oferecido em composições novas e no orçamento. Os
                orçamentos já feitos não mudam.
              </p>
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
            {inactivating ? 'Inativar' : 'Reativar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
