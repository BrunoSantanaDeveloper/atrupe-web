'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { useSession } from 'next-auth/react'
import { useForm, useWatch } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconCoin } from '@tabler/icons-react'

import { Form } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrencyToBrl } from '@/lib/utils'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/plans/methodTrail'
import { generateIdempotencyKey } from '@/lib/idempotency'
import {
  fetchContractTerms,
  fetchRegularization,
  submitRegularization,
} from '@/actions/checkout'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import type { CheckoutBillingType, RegularizationView } from '@/types/checkout'

import {
  ArrivalNotice,
  CheckLine,
  CheckoutColumns,
  CheckoutShell,
  ConfirmCard,
  ProceedButton,
  SecureNote,
  TermsCheckbox,
} from '../../components/checkout/CheckoutLayout'
import { ContractorReadOnly } from './ContractorReadOnly'
import { PaymentStep } from './PaymentStep'
import { TermsDialog } from './TermsDialog'

/** Por que a pessoa está na tela de pagamento. */
function reasonOf(view: RegularizationView) {
  if (view.situation === 'INATIVA') {
    return {
      tone: 'error' as const,
      title: 'Conta inativa por falta de pagamento',
      text: 'A mensalidade está em atraso há mais de 7 dias, e o acesso ao sistema foi suspenso. Seus dados continuam guardados: regularize o pagamento para voltar a usá-los.',
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
  const { data: session } = useSession()
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
  const methodLabel = PAYMENT_METHOD_OPTIONS.find(
    (m) => m.value === billingType,
  )?.label

  return (
    <CheckoutShell title="Regularizar cobrança" backHref="/dashboard">
      <ArrivalNotice
        tone={reason.tone}
        title={reason.title}
        text={reason.text}
      />

      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <CheckoutColumns
            aside={
              <>
                <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6">
                  <p className="text-lg font-semibold leading-7 text-gray-700">
                    Cobrança em aberto
                  </p>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between gap-2.5">
                    <CheckLine className="text-gray-500">
                      {view.subscription?.planName}
                    </CheckLine>
                  </div>
                  {charge && (
                    <>
                      <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                        <span>Vencimento</span>
                        <span className="font-semibold">
                          {new Date(charge.dueDate).toLocaleDateString(
                            'pt-BR',
                            {
                              timeZone: 'UTC',
                            },
                          )}
                        </span>
                      </div>
                      <div className="h-px bg-gray-200" />
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-700">
                        <span>Total</span>
                        <span className="flex items-center gap-1 text-xl font-semibold text-gray-700">
                          <Icon
                            icon={IconCoin}
                            size="lg"
                            className="flex-none text-brand-500"
                          />
                          {formatCurrencyToBrl(Math.round(charge.value * 100))}
                        </span>
                      </div>
                    </>
                  )}
                  {methodLabel && (
                    <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3 text-sm text-gray-700">
                      <span>Forma de pagamento</span>
                      <strong className="font-semibold text-gray-900">
                        {methodLabel}
                      </strong>
                    </div>
                  )}
                </div>
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
                  <ProceedButton
                    onClick={pay}
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    Realizar pagamento
                  </ProceedButton>
                  <SecureNote />
                </ConfirmCard>
              </>
            }
          >
            {contractor && (
              <ContractorReadOnly
                contractor={contractor}
                account={{
                  name: session?.user?.name ?? '',
                  email: session?.user?.email ?? '',
                }}
              />
            )}
            <PaymentStep allowedMethods={view.allowedBillingTypes} />
          </CheckoutColumns>
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
