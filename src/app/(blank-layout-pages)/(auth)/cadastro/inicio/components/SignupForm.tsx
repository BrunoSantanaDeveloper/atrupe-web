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
import { type SignupType, signupSchema } from './schema'

// Icons
import { IconArrowNarrowRight } from '@tabler/icons-react'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Store
import { useSignupStore } from '@/store/signupStore'

// import recaptcha from '@public/temp/recaptcha-v2.jpg'
import { MaskPhoneNumber } from '@/lib/utils'
import { safeRedirectPath } from '@/lib/safeRedirect'

export function SignupForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const {
    signupData,
    setSignupData,
    setCountdown,
    setVerificationToken,
    setRedirectTo,
  } = useSignupStore()

  const form = useForm<SignupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: signupData?.name || '',
      email: signupData?.email || '',
      company: signupData?.company || '',
      mobile: signupData?.mobile || '',
    },
    // Valida ao sair do campo e, depois do primeiro erro, a cada tecla: o
    // erro some assim que o valor fica válido.
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: SignupType) => {
    // Normalizar email antes de enviar (evita problemas de case no fluxo inteiro)
    const normalizedEmail = data.email.toLowerCase().trim()

    // Enviar email para verificação
    const res = await createItemNew({
      route: '/user',
      data: {
        email: normalizedEmail,
        name: data.name,
        companyName: data.company,
        phone: data.mobile,
      },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    // Armazenar dados do formulário no store (com email normalizado)
    setSignupData({ ...data, email: normalizedEmail })
    // Quem veio de um endereço protegido volta para ele depois do cadastro.
    setRedirectTo(safeRedirectPath(redirectTo))

    // Usar o tempo retornado pela API ou 120 como fallback
    const countdownTime = res.data?.canResendIn || 120
    setCountdown(countdownTime)

    // In dev/homolog, store the token for easy testing
    if (res.data?.devToken) {
      setVerificationToken(res.data.devToken)
    }

    router.replace('/cadastro/verificar-email')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
        noValidate
      >
        <FormInput
          name="name"
          label="Nome completo *"
          placeholder="Digite aqui"
          width="w-full"
          autoFocus
        />

        <FormInput
          name="email"
          type="email"
          label="E-mail *"
          placeholder="Digite aqui"
          width="w-full"
        />

        <FormInput
          name="company"
          label="Nome fantasia *"
          placeholder="Digite aqui"
          width="w-full"
        />

        <FormInput
          name="mobile"
          label="Celular *"
          inputMode="tel"
          placeholder="Digite aqui"
          additionalOnChange={(value) => {
            setValue('mobile', MaskPhoneNumber(value) || '')
          }}
          width="w-full"
          maxLength={15}
        />

        <p className="text-xs text-gray-500 -mt-2">
          Campos com * são obrigatórios.
        </p>

        {/* <div className="flex justify-center">
          <Image src={recaptcha} alt="ReCAPTCHA" width={302} height={76} />
        </div> */}

        <Button
          type="submit"
          disabled={isSubmitting || !form.formState.isValid}
          className="[&>svg]:ml-0"
          RightIcon={IconArrowNarrowRight}
          isLoading={isSubmitting}
        >
          Avançar
        </Button>

        <div className="text-center text-sm font-medium text-gray-700 mb-2">
          Já possui uma conta?{' '}
          <Link href="/login" className="text-brand hover:underline">
            Entre agora!
          </Link>
        </div>

        <div className="text-sm text-gray-700 text-center">
          Ao continuar, estou de acordo com os{' '}
          <Link
            href="/termos-de-uso"
            className="text-brand hover:underline"
            target="_blank"
          >
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link
            href="/aviso-de-privacidade"
            className="text-brand hover:underline"
            target="_blank"
          >
            Aviso de Privacidade
          </Link>{' '}
          da Atrupe.
        </div>
      </form>
    </Form>
  )
}
