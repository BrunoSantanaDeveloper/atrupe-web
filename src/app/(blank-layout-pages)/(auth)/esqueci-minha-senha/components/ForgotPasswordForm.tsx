'use client'

// React
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// UI
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { toast } from 'sonner'
import { FormInput } from '@/components/common/form/FormInput'

// Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import { type ForgotPasswordType, forgotPasswordSchema } from './schema'

// Actions
import { createItemNew } from '@/actions/_cruds'

export function ForgotPasswordForm() {
  const router = useRouter()

  const form = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: ForgotPasswordType) => {
    const res = await createItemNew({
      route: '/user/forgot-password',
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    router.replace('/esqueci-minha-senha/email-enviado')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <FormInput
          name="email"
          type="email"
          label="E-mail"
          placeholder="Digite aqui"
          width="w-full"
        />

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className="[&>svg]:ml-0"
          isLoading={isSubmitting}
        >
          Redefinir senha
        </Button>

        <div className="text-center text-sm font-medium text-gray-700">
          <Link href="/login" className="text-brand hover:underline">
            Voltar ao Login
          </Link>
        </div>
      </form>
    </Form>
  )
}
