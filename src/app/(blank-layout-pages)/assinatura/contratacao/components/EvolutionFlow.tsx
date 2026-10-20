'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { useSession } from 'next-auth/react'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { generateIdempotencyKey } from '@/lib/idempotency'
import {
  fetchContractingCurrent,
  fetchContractTerms,
  fetchQuote,
  submitEvolution,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import type { CheckoutBillingType } from '@/types/checkout'

import {
  CheckoutColumns,
  CheckoutShell,
  ConfirmCard,
  ProceedButton,
  SecureNote,
  TermsCheckbox,
} from '../../components/checkout/CheckoutLayout'
import { CouponCard } from '../../components/checkout/CouponCard'
import { OrderSummary } from '../../components/checkout/OrderSummary'
import { ContractorReadOnly } from './ContractorReadOnly'
import { PaymentStep } from './PaymentStep'
import { TermsDialog } from './TermsDialog'

type Step = 'contrato' | 'pagamento'

/**
 * Evolução para o próximo plano: contrato e pagamento.
 *
 * O contratante é o da assinatura em curso, em leitura. O resumo mostra o
 * crédito dos dias não usados do plano atual, abatido da primeira cobrança; a
 * renovação é o valor cheio do plano novo.
 */
export function EvolutionFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selection, setSelection, clear } = useCheckoutStore()
  const { apply } = useRefreshCompanySession()

  const [step, setStep] = useState<Step>('contrato')
  const [accepted, setAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  // Começa à vista: parcelar é decisão de quem contrata.
  const [installmentCount, setInstallmentCount] = useState(1)
  const cycle = selection.cycle ?? 'MONTHLY'
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<{ billingType: CheckoutBillingType }>({
    defaultValues: { billingType: 'CREDIT_CARD' },
  })
  const billingType = useWatch({ control: form.control, name: 'billingType' })

  // Sem evolução escolhida, a evolução começa pela página de planos.
  const ready = selection.mode === 'EVOLUTION' && !!selection.planId
  useEffect(() => {
    if (!ready) router.replace('/assinatura')
  }, [ready, router])

  const { data: current } = useQuery({
    queryKey: ['contracting-current'],
    queryFn: async () => {
      const res = await fetchContractingCurrent()
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    enabled: ready,
    refetchOnWindowFocus: false,
  })
  const { data: terms, refetch: refetchTerms } = useQuery({
    queryKey: ['contract-terms'],
    queryFn: async () => {
      const res = await fetchContractTerms()
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const quoteQuery = useQuery({
    queryKey: [
      'evolution-checkout-quote',
      selection,
      billingType,
      installmentCount,
      appliedCoupon,
    ],
    queryFn: async () => {
      const res = await fetchQuote({
        planId: selection.planId!,
        modules: selection.modules,
        additionalUsers: selection.additionalUsers,
        cycle,
        billingType,
        installmentCount,
        couponCode: appliedCoupon ?? undefined,
      })
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    enabled: ready,
    placeholderData: (previous) => previous,
  })
  const quoteResponse = quoteQuery.data
  const quote = quoteResponse?.quote ?? null

  // Do anual só se evolui para o anual; do mensal, para qualquer um dos dois
  // — se o anual estiver disponível.
  const currentCycle = current?.subscription?.cycle
  const cycleOptions: ('MONTHLY' | 'YEARLY')[] | undefined =
    currentCycle === 'YEARLY'
      ? ['YEARLY']
      : quoteResponse?.annualCycleAvailable
        ? ['MONTHLY', 'YEARLY']
        : undefined

  // Numa evolução, a forma de pagamento da assinatura em curso chega
  // selecionada, e continua trocável.
  const currentBillingType = current?.subscription?.billingType
  useEffect(() => {
    if (
      currentBillingType === 'CREDIT_CARD' ||
      currentBillingType === 'PIX' ||
      currentBillingType === 'BOLETO'
    ) {
      form.setValue('billingType', currentBillingType)
    }
  }, [currentBillingType, form])

  // A situação mudou: cobrança em aberto, ou a evolução deixou de valer.
  useEffect(() => {
    if (!quoteResponse) return
    if (quoteResponse.intent === 'REGULARIZATION') {
      router.replace('/assinatura/contratacao?modo=regularizacao')
    } else if (
      quoteResponse.intent !== 'EVOLUTION' ||
      !quoteResponse.eligible
    ) {
      toast.warning('Esta evolução não está disponível agora.')
      router.replace('/assinatura')
    }
  }, [quoteResponse, router])

  const goToPayment = () => {
    if (!accepted) {
      setTermsError('Leia e aceite os Termos de Contratação para continuar.')
      return
    }
    setStep('pagamento')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    if (!quote || !terms || !selection.planId) return
    setSubmitting(true)

    // Chave nova a cada tentativa: reenviar a mesma chave depois de um erro
    // devolveria o erro guardado, não uma nova tentativa.
    const res = await submitEvolution(
      {
        planId: selection.planId,
        modules: selection.modules,
        additionalUsers: selection.additionalUsers,
        billingType,
        cycle,
        installmentCount: quote.installments.allowed
          ? quote.installments.selected
          : undefined,
        couponCode: appliedCoupon ?? undefined,
        expectedTotalCents: quote.totalCents,
        termsAcceptance: {
          contractId: terms.contractId,
          version: terms.version,
          accepted: true,
        },
      },
      generateIdempotencyKey(),
    )

    if (res.success && res.data) {
      if (res.data.session) await apply(res.data.session)
      clear()
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
        return
      }
      toast.success(
        'Evolução concluída. O crédito do plano anterior cobriu a primeira mensalidade.',
      )
      router.replace('/dashboard')
      return
    }

    setSubmitting(false)
    switch (res.code) {
      case 'PRICE_CHANGED':
        toast.warning(
          'O valor mudou desde que o resumo foi exibido. Confira o novo total.',
        )
        quoteQuery.refetch()
        break
      case 'TERMS_OUTDATED':
        toast.warning(res.message)
        setAccepted(false)
        refetchTerms()
        setStep('contrato')
        break
      case 'REGULARIZATION_REQUIRED':
        router.replace('/assinatura/contratacao?modo=regularizacao')
        break
      case 'COUPON_NOT_APPLIED':
        toast.error(res.message)
        setAppliedCoupon(null)
        break
      case 'SUBSCRIPTION_CHANGED':
      case 'PLAN_NOT_AVAILABLE':
        toast.warning(res.message)
        router.replace('/assinatura')
        break
      default:
        toast.error(res.message)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  const contractor = current?.contractor ?? null
  const nothingToPay = !!quote && quote.totalCents === 0

  return (
    <CheckoutShell
      title="Plano"
      backHref="/assinatura"
      onBack={step === 'pagamento' ? () => setStep('contrato') : undefined}
    >
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          {step === 'contrato' ? (
            <CheckoutColumns
              aside={
                <>
                  <OrderSummary
                    quote={quote}
                    isLoading={quoteQuery.isLoading}
                    billingType={billingType}
                  />
                  <ConfirmCard>
                    <TermsCheckbox
                      checked={accepted}
                      onCheckedChange={(checked) => {
                        setAccepted(checked)
                        if (checked) setTermsError(null)
                      }}
                      onOpenTerms={() => setTermsOpen(true)}
                      error={termsError}
                    />
                    <ProceedButton onClick={goToPayment}>
                      Contratar
                    </ProceedButton>
                  </ConfirmCard>
                </>
              }
            >
              {contractor ? (
                <ContractorReadOnly
                  contractor={contractor}
                  account={{
                    name: session?.user?.name ?? '',
                    email: session?.user?.email ?? '',
                  }}
                />
              ) : (
                <Skeleton className="h-64 w-full rounded-xl" />
              )}
            </CheckoutColumns>
          ) : (
            <CheckoutColumns
              aside={
                <>
                  <OrderSummary
                    quote={quote}
                    isLoading={quoteQuery.isLoading}
                    billingType={billingType}
                  />
                  <CouponCard
                    appliedCoupon={appliedCoupon}
                    couponStatus={quote?.coupon}
                    onApply={setAppliedCoupon}
                  />
                  <ConfirmCard>
                    <ProceedButton
                      onClick={submit}
                      isLoading={submitting}
                      disabled={submitting || !quote}
                    >
                      {nothingToPay
                        ? 'Concluir evolução'
                        : 'Realizar pagamento'}
                    </ProceedButton>
                    <Button
                      type="button"
                      variant="neutralOutline"
                      className="w-full"
                      disabled={submitting}
                      onClick={() => setStep('contrato')}
                    >
                      Voltar
                    </Button>
                    <SecureNote />
                  </ConfirmCard>
                </>
              }
            >
              <PaymentStep
                cycle={cycle}
                cycleOptions={cycleOptions}
                onCycleChange={(next) => setSelection({ cycle: next })}
                installments={quote?.installments}
                installmentCount={quote?.installments.selected ?? 1}
                onInstallmentCountChange={setInstallmentCount}
              />
            </CheckoutColumns>
          )}
        </form>
      </Form>

      <TermsDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        html={terms?.html}
        version={terms?.version}
        name={terms?.name}
        parties={{
          contractorType: contractor?.type ?? 'PJ',
          contractorName: contractor?.name ?? '',
          contractorDocument: contractor?.document ?? '',
          representativeName: contractor?.representativeName,
        }}
        onAccept={() => {
          setAccepted(true)
          setTermsError(null)
        }}
      />
    </CheckoutShell>
  )
}
