'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createItemNew } from '@/actions/_cruds'

import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/common/form/FormInput'

const newContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  observations: z.string().optional(),
})

type NewContactFormType = z.infer<typeof newContactSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  onContactCreated: (contact: { id: string; name: string }) => void
}

export function NewContactModal({
  open,
  onOpenChange,
  clientId,
  onContactCreated,
}: Props) {
  const form = useForm<NewContactFormType>({
    resolver: zodResolver(newContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      mobile: '',
      observations: '',
    },
  })

  const handleToggleModal = (open: boolean) => {
    if (!open) {
      form.reset()
      form.clearErrors()
    }
    onOpenChange(open)
  }

  const onSubmit = async (formData: NewContactFormType) => {
    const payload: Record<string, string> = { name: formData.name, clientId }
    if (formData.email) payload.email = formData.email
    if (formData.phone) payload.phone = formData.phone
    if (formData.mobile) payload.mobile = formData.mobile
    if (formData.observations) payload.observations = formData.observations

    const res = await createItemNew({
      route: '/contact',
      data: payload,
    })

    if (!res.success) {
      toast.error(res.message || 'Erro ao criar responsável')
      return
    }

    toast.success('Responsável criado')
    handleToggleModal(false)
    onContactCreated({ id: res.data?.id, name: formData.name })
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">Novo responsável</div>
          </DialogTitle>
          <DialogDescription hidden>
            Cadastro rápido de responsável
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="new-contact"
              onSubmit={(e) => {
                e.stopPropagation()
                form.handleSubmit(onSubmit)(e)
              }}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput<NewContactFormType>
                name="name"
                label="Nome"
                width="w-full"
              />
              <FormInput<NewContactFormType>
                name="email"
                label="E-mail"
                width="flex-[1_0_200px]"
              />
              <FormInput<NewContactFormType>
                name="phone"
                label="Telefone"
                width="flex-[1_0_200px]"
              />
              <FormInput<NewContactFormType>
                name="mobile"
                label="Celular"
                width="flex-[1_0_200px]"
              />
              <FormInput<NewContactFormType>
                name="observations"
                label="Observações"
                width="w-full"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleToggleModal(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="new-contact"
            isLoading={form.formState.isSubmitting}
          >
            Criar responsável
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
