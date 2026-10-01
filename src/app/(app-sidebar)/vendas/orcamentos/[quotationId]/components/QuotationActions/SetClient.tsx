'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconUserPlus } from '@tabler/icons-react'

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
import { Form } from '@/components/ui/form'
import { CustomButton } from '@/components/common/CustomButton'
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'
import { updateItemNew } from '@/actions/_cruds'
import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'

interface FormType {
  clientId: { label?: string; value?: string } | null
}

/**
 * Informar o cliente de uma venda rápida em digitação. A venda continua
 * marcada como rápida; o cliente passa a valer para a O.S., o financeiro e
 * a nota.
 */
export function SetClient({ quotationId }: { quotationId: string }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const form = useForm<FormType>({ defaultValues: { clientId: null } })
  const clientId = form.watch('clientId')?.value

  const handleSave = async () => {
    if (!clientId) return
    const res = await updateItemNew({
      route: `/sale/quotation/${quotationId}`,
      data: { clientId },
    })
    if (!res.success) {
      toast.error(res.message || 'Não foi possível informar o cliente.')
      return
    }
    toast.success('Cliente informado.')
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    setOpen(false)
    form.reset({ clientId: null })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <CustomButton
        icon={IconUserPlus}
        title="Informar cliente"
        onClick={() => setOpen(true)}
      />
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Informar cliente</DialogTitle>
          <DialogDescription>
            O cliente passa a valer para a ordem de serviço, o financeiro e a
            nota fiscal desta venda.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleSave()
              }}
            >
              <ClientSelector name="clientId" label="Cliente" width="w-full" />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!clientId || form.formState.isSubmitting}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
