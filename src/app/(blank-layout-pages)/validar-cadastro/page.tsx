'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'

// Store
import { useSignupStore } from '@/store/signupStore'
import { useAttributionStore } from '@/store/attributionStore'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Analytics
import { trackRegistrationCompleted, hashString } from '@/lib/analytics'

// Components
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'

export default function ValidationPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const { signupData, newPasswordData, clearSignupData } = useSignupStore()
  const processStarted = useRef(false)

  useEffect(() => {
    if (progress > 0) return

    let isMounted = true

    const sendData = async () => {
      // Evitar execução duplicada
      if (processStarted.current) {
        // Processo já iniciado anteriormente, ignorando chamada duplicada
        return
      }

      processStarted.current = true

      // Enviar dados para o backend e atualizar progresso simultaneamente
      // Normalizar email antes de finalizar o cadastro
      const normalizedEmail = signupData?.email?.toLowerCase().trim()

      // Atribuição capturada na entrada do funil (§6): enviada ao backend para
      // vincular à conta e reutilizada no evento de conversão.
      const { oppref, gclid, utm } = useAttributionStore.getState()
      const hasUtm = Object.keys(utm).length > 0

      const finishSignupPromise = createItemNew({
        route: '/user/create-password',
        data: {
          name: signupData?.name,
          email: normalizedEmail,
          company: signupData?.company,
          mobile: signupData?.mobile,
          password: newPasswordData?.password,
          cpf: signupData?.cpf,
          oppref: oppref ?? undefined,
          gclid: gclid ?? undefined,
          utm: hasUtm ? utm : undefined,
        },
      })

      let currentProgress = 0
      while (currentProgress < 80) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        const increment = Math.floor(Math.random() * 6)
        currentProgress = Math.min(80, currentProgress + increment)
        setProgress(currentProgress)
      }

      try {
        const signupResponse = await finishSignupPromise

        if (!signupResponse.success) {
          toast.error(signupResponse.message)
          router.replace('/cadastro/inicio')
          return
        }

        // Conta criada e teste grátis iniciado com sucesso pelo backend.
        // Dispara GA4 sign_up (+ OpenAI registration_completed quando o pixel
        // for instalado) exatamente uma vez por conta. Usa o event_id (UUID)
        // gerado pelo backend (§5.2) como chave de dedup e id do evento OpenAI;
        // cai no hash do e-mail só se o backend não retornar o id. A dedup
        // persiste em localStorage (sobrevive a F5/re-render/outra aba).
        const eventId = signupResponse.data?.eventId as string | undefined
        trackRegistrationCompleted({
          dedupKey: eventId ?? `signup:${hashString(normalizedEmail ?? '')}`,
          eventId,
          attribution: { oppref, gclid, utm },
        })
        // Atribuição cumpriu o papel (vinculada ao cadastro); limpa para não
        // vazar para um próximo cadastro no mesmo navegador.
        useAttributionStore.getState().clear()

        toast.success('Cadastro realizado com sucesso. Fazendo login...')

        // Iniciar o login em paralelo com o progresso
        const loginPromise = signIn('credentials', {
          username: normalizedEmail,
          password: newPasswordData?.password,
          redirect: false,
        })

        // Atualizar progresso enquanto o login é processado
        while (currentProgress < 99) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          const increment = Math.floor(Math.random() * 6)
          currentProgress = Math.min(
            99,
            Math.max(81, currentProgress + increment),
          )
          setProgress(currentProgress)
        }

        // Aguardar resposta do login
        const loginResponse = await loginPromise

        if (loginResponse?.error) {
          setProgress(0)
          console.error('Erro no login:', loginResponse.error)
          toast.error(
            'Erro ao fazer login. Por favor, tente novamente com os dados do cadastro.',
          )
          clearSignupData()
          router.replace('/login')
        } else {
          clearSignupData()
          setProgress(100)

          // Buscar a sessão para obter o userId
          const { getSession } = await import('next-auth/react')
          const session = await getSession()

          if (session?.user?.userId) {
            const academyPrefs = JSON.parse(
              localStorage.getItem('academyPreferences') || '{}',
            )
            academyPrefs[session.user.userId] = true
            localStorage.setItem(
              'academyPreferences',
              JSON.stringify(academyPrefs),
            )
          }

          router.replace('/academy/start')
        }
      } catch (error) {
        setProgress(0)
        console.error('Erro durante o processo de cadastro:', error)
        toast.error('Erro ao finalizar cadastro. Por favor, tente novamente.')

        if (isMounted) {
          // Em caso de erro, redirecionar para o início do cadastro
          router.replace('/cadastro/inicio')
        }

        router.replace('/')
      }
    }

    // Iniciar envio dos dados. Componente montado, iniciando processo
    sendData()

    return () => {
      // Componente desmontado, cancelando operações
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signupData, newPasswordData, clearSignupData])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <Logo text width={154} />
        <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
          <CardHeader className="p-0 mb-8 text-center">
            <CardTitle className="text-xl font-bold">Validando dados</CardTitle>
            <CardDescription>
              Estamos preparando o ambiente da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressCircle value={progress} size={180} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
