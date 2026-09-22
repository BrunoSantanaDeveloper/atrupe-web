'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconLock } from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrencyToBrl } from '@/lib/utils'
import { generateIdempotencyKey } from '@/lib/idempotency'
import {
  fetchContractTerms,
  fetchRegularization,
  submitRegularization,
} from '@/actions/checkout'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import type { CheckoutBillingType, RegularizationView } from '@/types/checkout'

import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { ContractorReadOnly } from './ContractorReadOnly'
import { PaymentStep } from './PaymentStep'
import { TermsDialog } from './TermsDialog'

/** Por que a pessoa está na tela de pagamento. */
function reasonOf(view: RegularizationView) {
  if (view.situation === 'INATIVA') {
    return {
      tone: 'error' as const,
      title: 'Conta inativa por falta de pagamento',
      text: 'A mensalidade está em atraso há mais de 7 dias. Seus dados continuam guardados: regularize para voltar a usar a Atrupe.',
    }
  }
  if (view.reason === 'OVERDUE') {
    return {
      tone: 'warning' as const,
      title: 'Mensalidade em atraso',
      text: `A cobrança está vencida há ${view.daysOverdue ?? 0} dia(s). Regularize para manter sua conta ativa.`,
    }
  }
  return {
    tone: 'warning' as const,
    title: 'Pagamento da contratação pendente',
    text: 'Seu acesso já está liberado. Conclua o pagamento para confirmar a assinatura.',
  }
}

/**
 * Regularização de uma cobrança em aberto: o plano e o ciclo são os da
 * assinatura, o contratante aparece em leitura e não há crédito. Dá para
 * trocar a forma de pagamento, e o aceite dos Termos é pedido de novo.
 */
export function RegularizationFlow() {
  const router = useRouter()
  const { apply } = useRefreshCompanySession()
  const [termsOpen, setTermsOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<{ billingType: CheckoutBillingType }>({
    defaultValues: { billingType: 'PIX' },
  })
  const billingType = useWatch({ control: form.control, name: 'billingType' })

  const { data: view, isLoading } = useQuery({
    queryKey: ['regularization'],
    queryFn: async () => {
      const res = await fetchRegularization()
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    refetchOnWindowFocus: false,
  })
  const { data: terms } = useQuery({
    queryKey: ['contract-terms'],
    queryFn: async () => (await fetchContractTerms()).data ?? null,
    staleTime: 5 * 60 * 1000,
  })

  // A forma de pagamento atual vem pré-selecionada.
  useEffect(() => {
    const current = view?.chargeInFocus?.billingType
    if (
      current === 'CREDIT_CARD' ||
      current === 'PIX' ||
      current === 'BOLETO'
    ) {
      form.setValue('billingType', current)
    }
  }, [view?.chargeInFocus?.billingType, form])

  // Nada a regularizar: volta à assinatura.
  useEffect(() => {
    if (view && !view.required) router.replace('/assinatura')
  }, [view, router])

  const pay = async () => {
    if (!accepted) {
      setTermsError('Leia e aceite os Termos de Contratação para continuar.')
      return
    }
    if (!terms) return
    setSubmitting(true)
    const res = await submitRegularization(
      {
        billingType,
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
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
        return
      }
      router.replace('/assinatura/concluir')
      return
    }
    setSubmitting(false)
    if (res.code === 'TERMS_OUTDATED') setAccepted(false)
    toast.error(res.message)
  }

  if (isLoading || !view || !view.required) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  const reason = reasonOf(view)
  const contractor = view.contractor
  const charge = view.chargeInFocus

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <CheckoutHeader title="Regularizar cobrança" backHref="/dashboard" />

      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="container mx-auto px-4 py-8 space-y-6"
          noValidate
        >
          <Alert
            variant={reason.tone === 'error' ? 'destructive' : 'warning'}
            className={
              reason.tone === 'error'
                ? 'border-error-200 bg-error-50'
                : 'border-warning-200 bg-warning-50'
            }
          >
            <AlertTitle className="font-semibold">{reason.title}</AlertTitle>
            <AlertDescription>{reason.text}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {contractor && <ContractorReadOnly contractor={contractor} />}

              <PaymentStep
                appliedCoupon={null}
                couponStatus={null}
                onApplyCoupon={() => undefined}
                showCoupon={false}
              />
            </div>

            <div>
              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Cobrança em aberto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plano</span>
                    <span className="text-gray-900">
                      {view.subscription?.planName}
                    </span>
                  </div>
                  {charge && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vencimento</span>
                        <span className="text-gray-900">
                          {new Date(charge.dueDate).toLocaleDateString(
                            'pt-BR',
                            {
                              timeZone: 'UTC',
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-gray-700 font-medium">Total</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrencyToBrl(Math.round(charge.value * 100))}
                        </span>
                      </div>
                    </>
                  )}

                  <label className="flex items-start gap-2 text-gray-700">
                    <Checkbox
                      checked={accepted}
                      onCheckedChange={(c) => {
                        setAccepted(!!c)
                        if (c) setTermsError(null)
                      }}
                      className="mt-0.5"
                    />
                    <span>
                      Li e estou de acordo com os{' '}
                      <button
                        type="button"
                        className="text-brand-700 underline"
                        onClick={() => setTermsOpen(true)}
                      >
                        Termos de Contratação
                      </button>{' '}
                      da Atrupe.
                    </span>
                  </label>
                  {termsError && (
                    <p className="text-error-600" role="alert">
                      {termsError}
                    </p>
                  )}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={pay}
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    Pagar agora
                  </Button>
                  <p className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <IconLock size={14} /> Pagamento processado com segurança
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      <TermsDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        html={terms?.html}
        version={terms?.version}
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
    </div>
  )
}
