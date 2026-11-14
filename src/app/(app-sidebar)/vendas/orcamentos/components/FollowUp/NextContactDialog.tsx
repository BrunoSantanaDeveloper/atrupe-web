'use client'

// Combinar o próximo contato com o cliente (CRM fase 1, 24/10/2026). A mesma
// janela abre no card Acompanhamento do orçamento e na lista do Aguardando
// (14/11/2026), para agendar sem entrar no orçamento.

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormDatePickerInput } from '@/components/common/form/FormDatePickerInput'

import { updateItemNew } from '@/actions/_cruds'

const schema = z.object({
  nextContactAt: z.date({ required_error: 'Informe a data do contato' }),
  nextContactNote: z.string().max(500, 'No máximo 500 caracteres').optional(),
})
type FormType = z.infer<typeof schema>

export type NextContactBody = {
  nextContactAt: string | null
  nextContactNote: string | null
}

export async function saveNextContact(
  queryClient: QueryClient,
  quotationId: string,
  body: NextContactBody,
) {
  const res = await updateItemNew({
    route: `/sale/quotation/${quotationId}`,
    data: body,
  })
  if (!res.success) {
    toast.error(res.message || 'Não foi possível salvar o próximo contato.')
    return false
  }
  // O orçamento aberto, a lista e as contagens do Aguardando
  queryClient.invalidateQueries({ queryKey: ['quotation-data'] })
  queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
  queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
  return true
}

export function NextContactDialog({
  open,
  onOpenChange,
  quotation,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  quotation: {
    id: string
    nextContactAt?: string | null
    nextContactNote?: string | null
  } | null
}) {
  const queryClient = useQueryClient()
  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      nextContactAt: quotation?.nextContactAt
        ? new Date(quotation.nextContactAt)
        : (undefined as unknown as Date),
      nextContactNote: quotation?.nextContactNote || '',
    },
  })

  const submit = form.handleSubmit(async (values) => {
    if (!quotation) return
    // Meio-dia local: o dia não muda ao virar UTC
    const day = new Date(values.nextContactAt)
    day.setHours(12, 0, 0, 0)
    const ok = await saveNextContact(queryClient, quotation.id, {
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
