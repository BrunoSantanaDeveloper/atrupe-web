'use client'

// React
import Link from 'next/link'
import { useRouter } from '@/hooks/useRouter'
import { useEffect, useState } from 'react'

// UI
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { toast } from 'sonner'
import { FormOtp } from '@/components/common/form/FormOtp'

// Third-party
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import { type VerifyEmailType, verifyEmailSchema } from './schema'

// Icons
import { IconArrowNarrowRight, IconBug } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Store
import { useSignupStore } from '@/store/signupStore'

export function VerifyEmailForm() {
  const router = useRouter()
  const {
    setVerifyEmailData,
    signupData,
    verificationToken,
    countdown,
    setCountdown,
    decrementCountdown,
    clearSignupData,
    setVerificationToken,
  } = useSignupStore()

  const isDevEnv = process.env.NEXT_PUBLIC_ENV !== 'production'
  const [isResending, setIsResending] = useState(false)

  // Verificar se o email existe, caso contrário redirecionar para o cadastro
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!signupData?.email) {
        clearSignupData()
        router.replace('/cadastro/inicio')
        toast.error('Sessão expirada. Por favor, faça o cadastro novamente.')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [signupData, router, clearSignupData])

  // Efeito para controlar a contagem regressiva
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        decrementCountdown()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown, decrementCountdown])

  const form = useForm<VerifyEmailType>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    },
  })

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: VerifyEmailType) => {
    // Verificar o código OTP (normalizar email para evitar erros de case)
    const res = await createItemNew({
      route: '/user/verify-email',
      data: {
        email: signupData?.email?.toLowerCase().trim(),
        token: data.otp,
      },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    // Armazenar dados da verificação no store
    setVerifyEmailData(data)

    // Redirecionar para a página de nova senha
    router.replace('/cadastro/nova-senha')
  }

  const handleResendCode = async () => {
    // Verificar se temos o email no store
    if (!signupData?.email) {
      toast.error(
        'Não foi possível reenviar o código. Por favor, faça o cadastro novamente.',
      )
      router.replace('/cadastro/inicio')
      return
    }

    setIsResending(true)

    // Reenviar código de verificação (normalizar email para garantir consistência)
    const res = await createItemNew({
      route: '/user/resend-verification',
      data: {
        email: signupData.email.toLowerCase().trim(),
      },
    })

    if (!res.success) {
      toast.error(res.message)
      clearSignupData()
      return
    }

    // In dev/homolog, store the new token
    if (res.data?.devToken) {
      setVerificationToken(res.data.devToken)
    }

    // Iniciar contagem regressiva de 2 minutos (120 segundos)
    setCountdown(120)

    setIsResending(false)

    setValue('otp', '')

    toast.success('Código reenviado com sucesso')
  }

  // Função para formatar o tempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="flex justify-center">
          <FormOtp name="otp" maxLength={4} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            type="submit"
            className="[&>svg]:ml-0"
            RightIcon={IconArrowNarrowRight}
            isLoading={isSubmitting}
            disabled={isSubmitting || !form.formState.isValid}
          >
            Verificar
          </Button>

          <Button
            variant="neutralOutline"
            onClick={handleResendCode}
            type="button"
            isLoading={isResending}
            disabled={countdown > 0 || isSubmitting}
          >
            {countdown > 0
              ? `Reenviar em ${formatTime(countdown)}`
              : 'Reenviar código'}
          </Button>
        </div>

        <div className="text-center text-sm font-medium text-gray-700">
          Já possui uma conta?{' '}
          <Link href="/login" className="text-brand hover:underline">
            Entre agora!
          </Link>
        </div>
      </form>

      {isDevEnv && verificationToken && (
        <div className="mt-6 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon icon={IconBug} size="sm" className="text-amber-600" />
            <span className="type-eyebrow text-amber-700">
              Dev / Homolog only
            </span>
          </div>
          <p className="text-sm text-amber-800">
            Token de verificação:{' '}
            <span className="font-mono font-semibold text-lg tracking-widest text-amber-900">
              {verificationToken}
            </span>
          </p>
        </div>
      )}
    </Form>
  )
}
