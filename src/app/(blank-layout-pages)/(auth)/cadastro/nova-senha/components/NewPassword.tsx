'use client'

// React
import { useEffect } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Form } from '@/components/ui/form'

// Components
import { toast } from 'sonner'
import { NewPasswordForm } from '../../../_components/NewPasswordForm'

// Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import { type NewPasswordType, newPasswordSchema } from './schema'

// Store
import { useSignupStore } from '@/store/signupStore'

export function NewPassword() {
  const router = useRouter()

  const { signupData, verifyEmailData, setNewPasswordData } = useSignupStore()

  // Verificar se os dados necessários existem, caso contrário redirecionar para o cadastro
  useEffect(() => {
    if (!signupData || !verifyEmailData) {
      router.replace('/cadastro/inicio')
      toast.error('Sessão expirada. Por favor, faça o cadastro novamente.')
    }
  }, [signupData, verifyEmailData, router])

  const form = useForm<NewPasswordType>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: NewPasswordType) => {
    // Armazenar dados da senha no store
    setNewPasswordData(data)

    // Redirecionar para a página de validação
    router.push('/validar-cadastro')
  }

  return (
    <>
      <p className="text-xs text-gray-500 text-center mb-4">
        {signupData?.email}
      </p>
      <Form {...form}>
        <NewPasswordForm onSubmit={onSubmit} />
      </Form>
    </>
  )
}
