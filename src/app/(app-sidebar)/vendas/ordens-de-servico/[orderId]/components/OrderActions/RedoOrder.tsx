'use client'

// Refazer a O.S. (GP-51; Maicol, 23/11/2026). A O.S. aprovada não se altera:
// refazer cancela a atual e cria a nova, cópia em digitação, ligada a ela.
// Com produção ou material já baixado, outra pessoa aprova. Aprovada a nova,
// as etapas feitas passam para ela pelo item; o que sobra é cobrado do
// cliente ou fica como perda da empresa.

// React / Next
import Link from 'next/link'
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { CustomButton } from '@/components/common/CustomButton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  getOrderRedos,
  requestOrderRedo,
  approveOrderRedo,
  rejectOrderRedo,
} from '@/actions/order-redo'

// Hooks
import { useSector } from '@/hooks/queries/useSector'
import { useEmployee } from '@/hooks/queries/useEmployee'

// Icons
import { IconRefresh } from '@tabler/icons-react'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function RedoOrder({
  orderId,
  canRedo,
}: {
  orderId: string
  canRedo: boolean
}) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['order-redo', orderId],
    queryFn: () => getOrderRedos(orderId),
  })
  const redos = data?.data || []
  const pending = redos.find((item) => item.status === 'PENDING_APPROVAL')
  const executed = redos.find((item) => item.status === 'EXECUTED')
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [excess, setExcess] = useState<'CLIENT' | 'COMPANY'>('CLIENT')
  const [rejectText, setRejectText] = useState('')
  // Quem causou a refação (a pessoa ou o setor): mede a perda por responsável
  const [responsible, setResponsible] = useState('')
  const { data: employees } = useEmployee()
  const { data: sectors } = useSector()
  const responsibleOptions = [
    ...(sectors || [])
      .filter((sector) => sector.isActive)
      .map((sector) => ({
        value: `SECTOR:${sector.id}`,
        label: `Setor: ${sector.name}`,
      })),
    ...(employees || [])
      .filter((employee) => employee.isActive)
      .map((employee) => ({
        value: `PERSON:${employee.id}`,
        label: employee.name,
      })),
  ]
  const responsibleData = () => {
    const [kind, id] = responsible.split(':')
    return kind && id
      ? { responsibleKind: kind as 'PERSON' | 'SECTOR', responsibleId: id }
      : {}
  }
  const [busy, setBusy] = useState(false)

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['order-redo', orderId] })
    queryClient.invalidateQueries({ queryKey: ['order-data', orderId] })
  }

  const act = async (
    action: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(true)
    const res = await action()
    setBusy(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setOpen(false)
    refresh()
  }

  return (
    <>
      {canRedo && !pending && !executed && (
        <PermissionGate permissions={['sale:order:edit']}>
          <CustomButton
            icon={IconRefresh}
            title="Refazer a O.S."
            onClick={() => setOpen(true)}
          />
        </PermissionGate>
      )}

      {pending && (
        <div className="w-full space-y-2 rounded-lg border border-warning-200 bg-warning-25 p-3 text-sm">
          <p className="text-warning-700">
            {pending.requestedByName} pediu para refazer esta O.S.:{' '}
            {pending.reason}. Já há produção ou material baixado, por isso outra
            pessoa aprova.
          </p>
          <PermissionGate permissions={['sale:order_redo_approve:edit']}>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                isLoading={busy}
                onClick={() => act(() => approveOrderRedo(pending.id))}
              >
                Aprovar e refazer
              </Button>
              <Input
                aria-label="Motivo da recusa"
                placeholder="Motivo da recusa"
                className="h-9 w-56"
                value={rejectText}
                onChange={(event) => setRejectText(event.target.value)}
              />
              <Button
                size="sm"
                variant="neutralOutline"
                onClick={() =>
                  act(() => rejectOrderRedo(pending.id, rejectText))
                }
              >
                Recusar
              </Button>
            </div>
          </PermissionGate>
        </div>
      )}

      {executed?.newQuotationId && (
        <div className="w-full space-y-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-gray-800">
            Esta O.S. foi refeita ({executed.reason}
            {executed.responsibleName
              ? `; responsável: ${executed.responsibleName}`
              : ''}
            ).{' '}
            <Link
              href={`/vendas/orcamentos/${executed.newQuotationId}`}
              className="font-medium text-brand-700 underline"
            >
              Abrir a O.S. nova
            </Link>
          </p>
          {!!executed.lossItems?.length && (
            <p className="text-gray">
              Excedente{' '}
              {executed.excess === 'CLIENT'
                ? '(cobrar do cliente)'
                : '(perda da empresa)'}
              :{' '}
              {executed.lossItems
                .map((item) => `${item.item}: ${item.excess}`)
                .join('; ')}
            </p>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Refazer a O.S.</DialogTitle>
            <DialogDescription>
              A O.S. atual é cancelada e a nova nasce como cópia em digitação,
              para editar o que mudou. O que já foi produzido passa para a nova
              pelo item; nada é apagado.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="redo-reason">Motivo</Label>
              <Input
                id="redo-reason"
                placeholder="Cliente alterou a quantidade…"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </div>
            <SelectBasic
              name="redo-excess"
              label="O que já foi produzido e não cabe na nova"
              options={[
                { value: 'CLIENT', label: 'Cobrar do cliente' },
                { value: 'COMPANY', label: 'Perda da empresa (erro interno)' },
              ]}
              value={excess}
              onChange={(value) => setExcess(value as 'CLIENT' | 'COMPANY')}
            />
            <SelectBasic
              name="redo-responsible"
              label="Quem causou a refação (opcional)"
              placeholder="Ninguém (pedido do cliente)"
              options={responsibleOptions}
              value={responsible}
              onChange={(value) => setResponsible(value as string)}
            />
            <p className="text-xs text-gray">
              O que foi pago fica na O.S. cancelada; levar para a nova é feito à
              mão.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="neutralOutline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              isLoading={busy}
              disabled={!reason.trim()}
              onClick={() =>
                act(() =>
                  requestOrderRedo(orderId, {
                    reason: reason.trim(),
                    excess,
                    ...responsibleData(),
                  }),
                )
              }
            >
              Refazer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
