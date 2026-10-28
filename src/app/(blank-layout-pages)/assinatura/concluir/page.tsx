'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ProgressCircle } from '@/components/ui/progress-circle'
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  CheckoutShell,
  ProceedButton,
} from '../components/checkout/CheckoutLayout'
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
   * Leva à sessão o que o servidor diz agora. A evolução (e a contratação
   * anterior a 20/10) nasce ativa com a cobrança em aberto, então "ativa" não
   * significa "paga": se a primeira cobrança ainda está pendente, a tela diz
   * isso em vez de anunciar sucesso. A contratação nova só fica ativa paga.
   */
  const finishActivated = async (checkResult: { subscription?: unknown }) => {
    const block = await refresh().catch(() => null)
    // Backend sem a rota de sessão: monta a sessão como antes.
    if (!block) await legacySessionUpdate(checkResult)

    if (block?.billing?.paymentPending) {
      setStatus('waiting_payment')
      setErrorMessage(
        block.billing.activationPending
          ? 'O plano contratado é liberado assim que a confirmação do pagamento chegar.'
          : 'Seu acesso já está liberado. Assim que a confirmação do pagamento chegar, o aviso de cobrança pendente some sozinho.',
      )
      setCountdown(30)
      return
    }

    setStatus('success')
    toast.success('Contratação confirmada!')
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

  const goToDashboard = (
    <ProceedButton onClick={() => router.replace('/dashboard')}>
      Ir para o dashboard
    </ProceedButton>
  )

  if (status === 'processing') {
    return (
      <ResultCard title="Validando dados">
        <p>Estamos atualizando as informações da sua assinatura.</p>
        <div className="flex justify-center py-2">
          <ProgressCircle value={progress} size={160} />
        </div>
      </ResultCard>
    )
  }

  if (status === 'success') {
    return (
      <ResultCard
        tone="ok"
        icon={<IconCircleCheck className="size-6" />}
        title="Contratação confirmada!"
        actions={goToDashboard}
      >
        <p>
          O pagamento foi confirmado e a sua assinatura está ativa. Você será
          levado ao dashboard em instantes.
        </p>
      </ResultCard>
    )
  }

  if (status === 'waiting_payment') {
    return (
      <ResultCard
        tone="ok"
        icon={<IconClock className="size-6" />}
        title="Processando pagamento…"
        actions={
          <div className="flex w-full flex-col gap-3">
            <Button
              onClick={checkPaymentStatus}
              disabled={isChecking}
              variant="neutralOutline"
              className="w-full"
            >
              {isChecking ? 'Verificando…' : 'Verificar novamente'}
            </Button>
            {goToDashboard}
          </div>
        }
      >
        <p>{errorMessage}</p>
        <p className="text-[11px] text-gray-400">
          Indo para o dashboard em{' '}
          <span className="font-semibold text-gray-600">{countdown}s</span>
        </p>
      </ResultCard>
    )
  }

  if (status === 'error') {
    return (
      <ResultCard
        tone="warning"
        icon={<IconAlertCircle className="size-6" />}
        title="Não foi possível confirmar agora"
        actions={goToDashboard}
      >
        <p>
          {errorMessage ||
            'Ocorreu um erro ao verificar sua assinatura. Tente novamente em instantes.'}
        </p>
      </ResultCard>
    )
  }

  return null
}

/**
 * O desfecho da contratação, no cartão de confirmação do protótipo: o
 * cabeçalho da contratação e, abaixo, o resultado com a ação seguinte.
 */
function ResultCard({
  tone,
  icon,
  title,
  actions,
  children,
}: {
  tone?: 'ok' | 'warning'
  icon?: React.ReactNode
  title: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <CheckoutShell title="Plano" backHref="/dashboard">
      <div className="mx-auto flex w-full max-w-[464px] flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-10 text-center">
        {icon && (
          <div
            className={cn(
              'grid size-12 place-items-center rounded-full',
              tone === 'warning'
                ? 'bg-warning-50 text-warning-700'
                : 'bg-brand-50 text-brand-700',
            )}
          >
            {icon}
          </div>
        )}
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <div className="flex flex-col gap-3 text-[13px] text-gray-600">
          {children}
        </div>
        {actions && <div className="mt-2 w-full">{actions}</div>}
      </div>
    </CheckoutShell>
  )
}
