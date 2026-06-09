'use client'

// React
import { useState } from 'react'

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
import { IconCopy, IconKey, IconMailForward } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

const formSchema = z.object({
  password: z.string().min(1, 'Senha gerencial e obrigatoria'),
})

export function ResetPasswordDialog({ open, setOpen, rowData }: Props) {
  const [generatedPassword, setGeneratedPassword] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  const handleSendResetEmail = form.handleSubmit(async (data) => {
    if (!rowData?.userId) {
      toast.error('Usuario da conta nao encontrado')
      return
    }

    setGeneratedPassword('')

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
  })

  const handleGeneratePassword = form.handleSubmit(async (data) => {
    if (!rowData?.userId) {
      toast.error('Usuario da conta nao encontrado')
      return
    }

    const res = await createItemNew({
      route: `/user/${rowData.userId}/admin-generate-password`,
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    const temporaryPassword = String(res.data?.temporaryPassword || '')

    if (!temporaryPassword) {
      toast.error('Senha temporaria nao retornada')
      return
    }

    setGeneratedPassword(temporaryPassword)
    toast.success('Senha temporaria gerada')
  })

  const handleCopyPassword = async () => {
    if (!generatedPassword) return

    await navigator.clipboard.writeText(generatedPassword)
    toast.success('Senha copiada')
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset()
      setGeneratedPassword('')
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
            Envie link por email ou gere uma senha temporaria para{' '}
            {rowData?.email || 'o usuario'}.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="reset-password"
              onSubmit={handleSendResetEmail}
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
                      Obrigatorio para enviar link ou gerar senha
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {generatedPassword ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Senha temporaria gerada
                    </p>
                    <p className="text-xs text-gray-600">
                      Copie agora. Ela nao ficara visivel depois que fechar.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input value={generatedPassword} readOnly />
                    <Button
                      type="button"
                      variant="neutralOutline"
                      onClick={handleCopyPassword}
                      RightIcon={IconCopy}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              ) : null}
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
            type="button"
            disabled={form.formState.isSubmitting}
            onClick={handleGeneratePassword}
            RightIcon={IconKey}
          >
            Gerar senha
          </Button>
          <Button
            type="submit"
            form="reset-password"
            disabled={form.formState.isSubmitting}
            RightIcon={IconMailForward}
          >
            Enviar link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
