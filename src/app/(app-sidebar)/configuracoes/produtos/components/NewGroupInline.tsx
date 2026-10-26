'use client'

// Criar o grupo de produtos sem sair do formulário do produto (decisão do
// produto, 26/10/2026): o grupo é obrigatório e a empresa nova não tem
// nenhum — antes era sair, cadastrar o grupo e voltar.

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconPlus } from '@tabler/icons-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ActionButton } from '@/components/common/ActionButton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PermissionGate } from '@/components/common/PermissionGate'

import { createItem } from '@/actions/_cruds'

interface Props {
  sectorId?: string
  onCreated: (groupId: string) => void
}

export function NewGroupInline({ sectorId, onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed || !sectorId) return
    setSaving(true)
    try {
      const res = await createItem({
        route: 'productGroupRoute',
        data: { name: trimmed, sectorId, kind: 'PRODUCT' },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const created = (res as any)?.data ?? res
      const id: string | undefined = created?.id
      await queryClient.invalidateQueries({ queryKey: ['product-group-list'] })
      toast.success('Grupo criado.')
      if (id) onCreated(id)
      setOpen(false)
      setName('')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o grupo.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <PermissionGate permissions={['product_settings:products:create']}>
      {/* Alinha com o campo ao lado, que tem rótulo em cima */}
      <div className="flex items-end pb-px">
        <TooltipProvider>
          <ActionButton
            Icon={IconPlus}
            size="iconMd"
            variant="neutralOutline"
            tooltip={
              sectorId ? 'Novo grupo neste setor' : 'Escolha o setor primeiro'
            }
            disabled={!sectorId}
            onClick={() => setOpen(true)}
          />
        </TooltipProvider>
      </div>
      <Dialog open={open} onOpenChange={(value) => !saving && setOpen(value)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Novo grupo de produtos</DialogTitle>
            <DialogDescription>
              O grupo nasce no setor escolhido e já fica selecionado no produto.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <label htmlFor="new-group-name" className="text-sm font-medium">
              Nome do grupo
            </label>
            <Input
              id="new-group-name"
              autoFocus
              value={name}
              placeholder="Ex.: Adesivos"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  save()
                }
              }}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={save}
              isLoading={saving}
              disabled={!name.trim()}
            >
              Criar grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
