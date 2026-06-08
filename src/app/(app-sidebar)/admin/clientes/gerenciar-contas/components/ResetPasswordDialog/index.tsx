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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconKey, IconMailForward } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

const formSchema = z.object({
  password: z.string().min(1, 'Senha gerencial e obrigatoria'),
})

export function ResetPasswordDialog({ open, setOpen, rowData }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!rowData?.userId) {
      toast.error('Usuario da conta nao encontrado')
      return
    }

    const res = await createItemNew({
      route: `/user/${rowData.userId}/admin-password-reset`,
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Email de redefinicao enviado')
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset()
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant="neutralOutline"
                Icon={IconKey}
                size="lg"
                rounded
              />
              <span>Redefinir senha</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Enviar link de redefinicao para {rowData?.email || 'o usuario'}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="reset-password"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha gerencial</FormLabel>
                    <Input
                      type="password"
                      placeholder="Digite aqui"
                      {...field}
                    />
                    <p className="text-sm text-gray-600">
                      Obrigatorio para enviar o reset
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            form="reset-password"
            disabled={form.formState.isSubmitting}
            RightIcon={IconMailForward}
          >
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
