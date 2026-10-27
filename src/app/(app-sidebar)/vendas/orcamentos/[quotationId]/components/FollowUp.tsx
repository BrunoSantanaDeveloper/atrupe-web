'use client'

// Acompanhamento da negociação (CRM fase 1, 24/10/2026): o marcador de
// acompanhamento, o próximo contato combinado com o cliente e um lembrete do
// que ficou de ser feito. A lista de orçamentos tem a aba "Para retomar" com
// os contatos vencidos ou de hoje.

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconCalendarEvent, IconPencil, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Form } from '@/components/ui/form'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
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
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'
import { QuotationTagDropdown } from '../../components/QuotationsTable/QuotationTagDropdown'

import { updateItemNew } from '@/actions/_cruds'
import { useQuotationTag } from '@/hooks/queries/useQuotationTag'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { formatToLocaleDate } from '@/lib/formatDate'
import { nextContactLabel, nextContactState } from '@/lib/nextContact'
import type { QuotationType } from '@/types/sales/quotation'
import { QUOTATION_DATA_QUERY_KEY } from './Quotation'

const schema = z.object({
  nextContactAt: z.date({ required_error: 'Informe a data do contato' }),
  nextContactNote: z.string().max(500, 'No máximo 500 caracteres').optional(),
})
type FormType = z.infer<typeof schema>

const stateVariant = {
  overdue: 'errorLight',
  today: 'warningLight',
  upcoming: 'neutralLight',
} as const

export function FollowUp({ data }: { data: QuotationType }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { hasFeature } = usePlanFeatures()
  const showTag = hasFeature(FEATURES.SALES.QUOTATION_STATUS_COLUMN)
  const { data: tagsList } = useQuotationTag()

  // Só enquanto a negociação está aberta. Depois de aprovado ou rejeitado,
  // o card fica se ainda houver um contato anotado, para não sumir com ele
  const negotiating = ['OPEN', 'DONE', 'OVERDUE'].includes(data?.status)
  if (!negotiating && !data?.nextContactAt) return null

  const state = nextContactState(data?.nextContactAt)

  const save = async (body: {
    nextContactAt: string | null
    nextContactNote: string | null
  }) => {
    const res = await updateItemNew({
      route: `/sale/quotation/${data.id}`,
      data: body,
    })
    if (!res.success) {
      toast.error(res.message || 'Não foi possível salvar o próximo contato.')
      return false
    }
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    return true
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FeaturedIcon tone="neutral" Icon={IconCalendarEvent} />
          <CardTitle>Acompanhamento</CardTitle>
          {negotiating ? (
            <PermissionGate permissions={['sale:quotation:edit']}>
              <div className="ml-auto flex gap-1">
                <TooltipProvider>
                  {data?.nextContactAt ? (
                    <ActionButton
                      Icon={IconTrash}
                      tooltip="Limpar próximo contato"
                      onClick={async () => {
                        const ok = await save({
                          nextContactAt: null,
                          nextContactNote: null,
                        })
                        if (ok) toast.success('Próximo contato removido.')
                      }}
                    />
                  ) : null}
                  <ActionButton
                    Icon={IconPencil}
                    tooltip={
                      data?.nextContactAt
                        ? 'Alterar próximo contato'
                        : 'Combinar próximo contato'
                    }
                    onClick={() => setOpen(true)}
                  />
                </TooltipProvider>
              </div>
            </PermissionGate>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
          {showTag ? (
            <div className="space-y-1">
              <p className="text-sm text-gray">Status</p>
              <QuotationTagDropdown
                quotation={data}
                tagsList={tagsList || []}
              />
            </div>
          ) : null}
          <div className="space-y-1">
            <p className="text-sm text-gray">Próximo contato</p>
            {data?.nextContactAt && state ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {formatToLocaleDate(data.nextContactAt)}
                </p>
                <Badge status variant={stateVariant[state]} size="sm">
                  {nextContactLabel[state]}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-900">Não combinado</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray">Lembrete</p>
            <p className="text-sm text-gray-900 whitespace-pre-line">
              {data?.nextContactNote || '-'}
            </p>
          </div>
        </div>
      </CardContent>
      <NextContactDialog
        open={open}
        onOpenChange={setOpen}
        data={data}
        onSave={save}
      />
    </Card>
  )
}

function NextContactDialog({
  open,
  onOpenChange,
  data,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: QuotationType
  onSave: (body: {
    nextContactAt: string | null
    nextContactNote: string | null
  }) => Promise<boolean>
}) {
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      nextContactAt: data?.nextContactAt
        ? new Date(data.nextContactAt)
        : (undefined as unknown as Date),
      nextContactNote: data?.nextContactNote || '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    // Meio-dia local: o dia não muda ao virar UTC
    const day = new Date(values.nextContactAt)
    day.setHours(12, 0, 0, 0)
    const ok = await onSave({
      nextContactAt: day.toISOString(),
      nextContactNote: values.nextContactNote?.trim() || null,
    })
    if (ok) {
      toast.success('Próximo contato salvo.')
      onOpenChange(false)
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Próximo contato</DialogTitle>
          <DialogDescription>
            Quando retomar a conversa com o cliente e o que ficou combinado. O
            orçamento aparece em &quot;Para retomar&quot; no dia.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={submit} className="space-y-4">
              <FormDatePickerInput
                name="nextContactAt"
                label="Data do contato"
                width="w-full sm:w-[220px]"
              />
              <FormTextarea<FormType>
                name="nextContactNote"
                label="Lembrete"
                placeholder="Ex.: ligar depois que o cliente falar com o sócio"
                rows={3}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            isLoading={form.formState.isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
