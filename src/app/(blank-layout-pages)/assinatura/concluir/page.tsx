'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { createItemNew } from '@/actions/_cruds'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'

type SubscriptionStatus = 'processing' | 'success' | 'error' | 'waiting_payment'

const ACTIVATED = ['activated', 'already_active', 'unblocked']

interface PlanFeature {
  isActive: boolean
  feature: {
    key: string
  }
}

interface PlanLimit {
  limit?: {
    key: string
  }
  value?: number
}

interface Plan {
  planType: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
  planFeatures?: PlanFeature[]
  planLimits?: PlanLimit[]
}

interface SubscriptionFeature {
  isActive: boolean
  feature: {
    key: string
  }
}

interface Subscription {
  status: 'ACTIVE' | 'INACTIVE'
  plan?: Plan
  subscriptionFeatures?: SubscriptionFeature[]
}

export default function FinishSubscriptionPage() {
  const [status, setStatus] = useState<SubscriptionStatus>('processing')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update } = useSession()

  const { refresh } = useRefreshCompanySession()

  /**
   * Leva à sessão o que o servidor diz agora. Na contratação em três etapas a
   * assinatura já nasce ativa (contratação registrada libera o acesso), então
   * "ativa" não significa "paga": se a primeira cobrança ainda está pendente, a
   * tela diz isso em vez de anunciar sucesso.
   */
  const finishActivated = async (checkResult: { subscription?: unknown }) => {
    const block = await refresh().catch(() => null)
    // Backend sem a rota de sessão: monta a sessão como antes.
    if (!block) await legacySessionUpdate(checkResult)

    if (block?.billing?.paymentPending) {
      setStatus('waiting_payment')
      setErrorMessage(
        'Contratação registrada: seu acesso já está liberado. O pagamento ainda está em confirmação — você recebe um e-mail quando ele for confirmado.',
      )
      setCountdown(30)
      return
    }

    setStatus('success')
    toast.success('Assinatura realizada com sucesso!')
    setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)
  }

  /** A montagem da sessão anterior à rota /subscriptions/session. */
  const legacySessionUpdate = async (checkResult: {
    subscription?: unknown
  }) => {
    const subscription = checkResult.subscription as Subscription | undefined
    const plan = subscription?.plan
    if (!plan || !subscription) return
    const planFeatureKeys =
      plan.planFeatures
        ?.filter((pf) => pf.isActive && pf.feature)
        .map((pf) => pf.feature.key) || []
    const subFeatureKeys =
      subscription.subscriptionFeatures
        ?.filter((sf) => sf.isActive !== false && sf.feature)
        .map((sf) => sf.feature.key) || []
    const features = Array.from(
      new Set([...planFeatureKeys, ...subFeatureKeys]),
    )
    const limits: { [key: string]: number } = {}
    plan.planLimits?.forEach((pl) => {
      if (pl.limit?.key) limits[pl.limit.key] = pl.value || 0
    })
    await update({
      company: {
        plan: {
          name: plan.planType,
          active: subscription.status === 'ACTIVE',
          features,
          limits,
        },
      },
    })
  }

  // Countdown para redirecionamento automático
  useEffect(() => {
    if (status === 'waiting_payment' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'waiting_payment' && countdown === 0) {
      router.replace('/dashboard')
    }
  }, [status, countdown, router])

  const checkPaymentStatus = async () => {
    setIsChecking(true)
    setStatus('processing')
    setProgress(20)

    try {
      setProgress(70)

      const checkResponse = await createItemNew({
        route: '/subscriptions/check-status',
      })

      if (!checkResponse.success) {
        throw new Error('Erro ao verificar status')
      }

      const checkResult = checkResponse.data

      setProgress(100)

      if (ACTIVATED.includes(checkResult.status)) {
        await finishActivated(checkResult)
      } else {
        setStatus('waiting_payment')
        setErrorMessage(
          'Pagamento ainda não confirmado. Aguarde alguns instantes e tente verificar novamente.',
        )
        setCountdown(30) // Reset countdown
        toast.info('Pagamento ainda pendente')
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus('error')
      setErrorMessage('Erro ao verificar status do pagamento')
      setProgress(0)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    const processSubscription = async () => {
      try {
        setProgress(20)

        // Aguardar um pouco para o webhook processar (se estiver configurado)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setProgress(70)

        // Chamar endpoint que verifica status no Asaas e sincroniza
        const checkResponse = await createItemNew({
          route: '/subscriptions/check-status',
        })

        if (!checkResponse.success) {
          throw new Error('Erro ao verificar status')
        }

        const checkResult = checkResponse.data

        setProgress(100)

        // Verificar o resultado da sincronização
        if (ACTIVATED.includes(checkResult.status)) {
          await finishActivated(checkResult)
        } else if (checkResult.status === 'payment_pending') {
          // Pagamento ainda pendente (PIX ou Boleto)
          setStatus('waiting_payment')
          setErrorMessage(
            'Aguardando confirmação do pagamento. Você receberá um e-mail quando o pagamento for confirmado.',
          )
          setCountdown(30)
        } else {
          // Outro status (not_found, no_payments, etc.)
          setStatus('waiting_payment')
          setErrorMessage(
            'Assinatura em processamento. Você receberá um e-mail quando o pagamento for confirmado.',
          )
          setCountdown(30)
        }
      } catch (error) {
        console.error('Erro ao processar assinatura:', error)
        setStatus('error')
        setErrorMessage('Erro inesperado ao processar assinatura')
        setProgress(0)
      }
    }

    processSubscription()
    // Roda uma vez por retorno do pagamento: incluir finishActivated (recriada
    // a cada render) repetiria a verificação sem parar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, update])

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <CardTitle className="text-xl font-bold">
                Validando dados
              </CardTitle>
              <CardDescription>
                Estamos atualizando as informações da sua assinatura.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ProgressCircle value={progress} size={180} />
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <IconCheck size={48} className="text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-green-600">
                Assinatura realizada com sucesso!
              </CardTitle>
              <CardDescription>
                Sua assinatura foi ativada. Você será redirecionado em
                instantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'waiting_payment') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <IconCheck size={48} className="text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-blue-600">
                Aguardando pagamento
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage}
              </CardDescription>
              <CardDescription className="text-gray-500 mt-4">
                Redirecionando para o dashboard em{' '}
                <span className="font-semibold text-blue-600">
                  {countdown}s
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking}
                className="w-full"
                variant="default"
              >
                {isChecking ? 'Verificando...' : 'Verificar novamente'}
              </Button>
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
                variant="outline"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <IconX size={48} className="text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-red-600">
                Erro ao processar assinatura
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage ||
                  'Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  return null
}
