'use client'

// React
import { useRouter } from '@/hooks/useRouter'

// UI
import { Form } from '@/components/ui/form'

// Components
import { toast } from 'sonner'
import { NewPasswordForm } from '../../_components/NewPasswordForm'

// Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import { newPasswordSchema, NewPasswordType } from '../../_components/schema'

// Store
import { useSignupStore } from '@/store/signupStore'

interface Props {
  token: string
}

export function NewPassword({ token }: Props) {
  const router = useRouter()
  const { setNewPasswordData, setVerificationToken } = useSignupStore()

  const form = useForm<NewPasswordType>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: NewPasswordType) => {
    try {
      setNewPasswordData({
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      setVerificationToken(token)

      router.replace('/redefinindo-senha')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao redefinir senha')
    }
  }

  return (
    <Form {...form}>
      <NewPasswordForm onSubmit={onSubmit} />
    </Form>
  )
}
