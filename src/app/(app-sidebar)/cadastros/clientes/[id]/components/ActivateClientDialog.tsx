'use client'

// Ativar um cliente inativo exige definir as formas de pagamento permitidas
// para ele (decisão do produto, 24/10/2026): inativar pode ter bloqueado
// tudo, e um cadastro reativado sem forma venderia sem controle. Pelo menos
// uma forma marcada; grava as formas e só então ativa.

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconRestore } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { getItem, updateItemNew } from '@/actions/_cruds'
import { extractConditions } from '@/app/(app-sidebar)/cadastros/clientes/components/NewClient/utils/ExtractConditions'

type Condition = { id: string; name: string; isActive: boolean }
type Method = { id: string; name: string; conditions: Condition[] }
// A API pede o bloco do limite completo: os outros campos vão como estão
type Limit = { minValue: number; maxValue: number; blockClient: boolean }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
}

export function ActivateClientDialog({ open, onOpenChange, clientId }: Props) {
  const queryClient = useQueryClient()
  const [methods, setMethods] = useState<Method[] | null>(null)
  const [limit, setLimit] = useState<Limit>({
    minValue: 0,
    maxValue: 0,
    blockClient: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setMethods(null)
    getItem({ route: `/client/${clientId}` }).then((res) => {
      if (!res.success) {
        toast.error(res.message)
        onOpenChange(false)
        return
      }
      const current = res.data?.creditLimit
      setLimit({
        minValue: current?.minValue ?? 0,
        maxValue: current?.maxValue ?? 0,
        blockClient: current?.blockClient ?? false,
      })
      setMethods(current?.paymentMethods ?? [])
    })
  }, [open, clientId, onOpenChange])

  const toggle = (methodId: string, conditionId: string, checked: boolean) =>
    setMethods((current) =>
      (current ?? []).map((method) =>
        method.id !== methodId
          ? method
          : {
              ...method,
              conditions: method.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, isActive: checked }
                  : condition,
              ),
            },
      ),
    )

  const chosen = (methods ?? []).some((method) =>
    method.conditions.some((condition) => condition.isActive),
  )

  const activate = async () => {
    if (!chosen) {
      toast.error('Marque pelo menos uma forma de pagamento para ativar')
      return
    }
    setSaving(true)
    const forms = await updateItemNew({
      route: `/client/${clientId}`,
      data: {
        creditLimit: { ...limit, conditions: extractConditions(methods ?? []) },
      },
    })
    if (!forms.success) {
      setSaving(false)
      toast.error(forms.message)
      return
    }
    const status = await updateItemNew({
      route: `/client/${clientId}/status`,
      data: {},
    })
    setSaving(false)
    if (!status.success) {
      toast.error(status.message)
      return
    }
    toast.success('Cadastro ativado.')
    queryClient.invalidateQueries()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !saving && onOpenChange(value)}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Ativar cadastro</DialogTitle>
          <DialogDescription>
            Marque as formas de pagamento que este cliente pode usar. O cadastro
            só é ativado com pelo menos uma.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {methods === null ? (
            <div className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-gray">
              Nenhuma forma de pagamento cadastrada. Cadastre as condições de
              pagamento em Configurações › Financeiro.
            </p>
          ) : (
            <div className="rounded-lg border border-gray-200">
              {methods.map((method) => (
                <div key={method.id}>
                  <div className="flex h-11 items-center bg-gray-100 px-6">
                    <h3 className="type-body-strong">{method.name}</h3>
                  </div>
                  {method.conditions.map((condition) => (
                    <div
                      key={condition.id}
                      className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 text-sm text-gray-900"
                    >
                      <p>{condition.name}</p>
                      <Switch
                        checked={condition.isActive}
                        onCheckedChange={(checked) =>
                          toggle(method.id, condition.id, checked)
                        }
                        aria-label={condition.name}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            LeftIcon={IconRestore}
            onClick={activate}
            disabled={methods === null || !chosen}
            isLoading={saving}
          >
            Ativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
