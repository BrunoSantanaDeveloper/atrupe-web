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

export function SignupForm() {
  const router = useRouter()
  const { signupData, setSignupData, setCountdown } = useSignupStore()

  const form = useForm<SignupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: signupData?.name || '',
      email: signupData?.email || '',
      company: signupData?.company || '',
      mobile: signupData?.mobile || '',
    },
  })

  const {
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: SignupType) => {
    // Enviar email para verificação
    const res = await createItemNew({
      route: '/user',
      data: {
        email: data.email,
      },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    // Armazenar dados do formulário no store
    setSignupData(data)

    // Reiniciar o countdown
    setCountdown(120)

    router.replace('/cadastro/verificar-email')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="flex flex-col gap-6"
        noValidate
      >
        <FormInput
          name="name"
          label="Nome completo"
          placeholder="Digite aqui"
          width="w-full"
        />

        <FormInput
          name="email"
          type="email"
          label="E-mail"
          placeholder="Digite aqui"
          width="w-full"
        />

        <FormInput
          name="company"
          label="Empresa"
          placeholder="Digite aqui"
          width="w-full"
        />

        <FormInput
          name="mobile"
          label="Celular"
          inputMode="tel"
          placeholder="Digite aqui"
          additionalOnChange={(value) => {
            setValue('mobile', MaskPhoneNumber(value) || '')
          }}
          width="w-full"
          maxLength={15}
        />

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
