'use client'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

// Third-party
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { TrialAccountItem } from '../Table/Data'

// Icons
import { IconAlertTriangle, IconLockOpen } from '@tabler/icons-react'
import { FormInput } from '@/components/common/form/FormInput'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: TrialAccountItem | null
}

const formSchema = z.object({
  status: z.literal('ACTIVE'),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

export function ChangeStatusDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'ACTIVE',
      password: '',
    },
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const id = rowData?.subscriptionId

    if (!id) {
      toast.error('ID da assinatura não encontrado')
      return
    }

    const res = await updateItemNew({
      route: `/subscriptions/${id}/extend-trial`,
      data: { password: data.password },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success('Trial ativado com sucesso')
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant="warningBorderedLight"
                Icon={IconAlertTriangle}
                size="lg"
                rounded
              />
              <span>Alterar status</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Trial expirado, deseja ativar novamente?
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form id="change-status" onSubmit={handleSubmit(onSubmit)}>
              <FormToggleCard
                name="status"
                options={[
                  {
                    label: 'Ativar',
                    value: 'ACTIVE',
                    icon: IconLockOpen,
                  },
                ]}
                groupClassName="grid grid-cols-1"
              />

              <FormInput
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha"
                width="w-full"
              />

              <p className="text-sm text-gray-600">Obrigatório para alterar</p>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            form="change-status"
            isLoading={form.formState.isSubmitting}
          >
            Alterar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
