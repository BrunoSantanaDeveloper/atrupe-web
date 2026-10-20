'use client'

// React
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

// Third
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types
import { type LoginType, loginSchema } from './schema'
import { safeRedirectPath } from '@/lib/safeRedirect'

// Icons
import { IconArrowRight } from '@tabler/icons-react'

export function LoginForm() {
  const [errorState, setErrorState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const searchParams = useSearchParams()

  // Só destinos internos: um ?to=https://… levaria a pessoa para fora logo
  // depois de ela digitar a senha.
  const redirectUrl = safeRedirectPath(searchParams.get('to'))

  useEffect(() => {
    if (redirectUrl !== '/') router.refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const form = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (formValues: LoginType) => {
    setErrorState(null)

    const res = await signIn('credentials', {
      username: formValues.username,
      password: formValues.password,
      redirect: false,
    })

    if (res?.error) {
      setErrorState(
        res.code === 'access_transferred'
          ? 'O ambiente desta conta foi transferido para outra empresa, e ela não tem mais acesso a ele. Seu histórico continua lá, no seu nome.'
          : 'Dados de acesso inválidos',
      )
      return
    }

    if (res && res.ok && !res.error) {
      setIsLoading(true)
      // Se não há URL de redirecionamento específica, verificar preferência da academy
      if (!redirectUrl) {
        // Aguardar um momento para a sessão ser estabelecida
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Buscar a sessão para obter o userId
        const { getSession } = await import('next-auth/react')
        const session = await getSession()

        if (session?.user?.userId) {
          const academyPrefs = JSON.parse(
            localStorage.getItem('academyPreferences') || '{}',
          )
          const isAcademyEnabled = academyPrefs[session.user.userId] === true

          router.replace(isAcademyEnabled ? '/academy/start' : '/')
        } else {
          router.replace('/')
        }
      } else {
        router.replace(redirectUrl)
      }

      setTimeout(() => {
        setIsLoading(false)
      }, 10000)
    } else {
      setErrorState(
        'Ocorreu um erro. Tente novamente mais tarde ou contate o suporte.',
      )
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        method="post"
        className="flex flex-col gap-5 w-full"
        noValidate
      >
        <FormInput
          name="username"
          type="email"
          label="E-mail"
          placeholder="Digite aqui"
          width="w-full"
        />
        <FormInput
          name="password"
          type="password"
          label="Senha"
          width="w-full"
          placeholder="Digite"
        />
        {errorState && (
          <span className="text-sm font-medium text-error text-center">
            {errorState}
          </span>
        )}
        <div className="flex justify-between items-center w-full">
          <FormCheckbox name="remember" label="Continuar conectado" />
          <Link
            href="/esqueci-minha-senha"
            className="text-sm font-semibold text-success hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
        <Button
          type="submit"
          variant="default"
          className="mt-2 w-full [&>svg]:ml-0"
          RightIcon={IconArrowRight}
          isLoading={isLoading || isSubmitting}
        >
          Entrar
        </Button>
      </form>
      <div className="flex justify-center items-center mt-6 w-full gap-1">
        <span className="text-sm font-medium text-gray-700">
          Não tem uma conta?
        </span>
        <Link
          href={
            redirectUrl
              ? `/cadastro/inicio?to=${encodeURIComponent(redirectUrl)}`
              : '/cadastro/inicio'
          }
          className="text-sm font-semibold text-success hover:underline"
        >
          Experimente grátis!
        </Link>
      </div>
    </Form>
  )
}
