'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconArrowRight, IconLock } from '@tabler/icons-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { HandleValidateCnpj, HandleValidateCpf } from '@/lib/validateDocs'
import { generateIdempotencyKey } from '@/lib/idempotency'
import {
  checkRepresentative,
  fetchContractTerms,
  fetchQuote,
  lookupCompany,
  submitCheckout,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import type { CheckoutRequest } from '@/types/checkout'

import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { OrderSummary } from '../../components/checkout/OrderSummary'
import {
  ContractorStep,
  type RegistryState,
  type RepresentativeState,
} from './ContractorStep'
import { PaymentStep } from './PaymentStep'
import { TermsDialog } from './TermsDialog'
import {
  CONTRACT_STEP_FIELDS,
  contractingSchema,
  type ContractingForm,
} from './schema'

type Step = 'contrato' | 'pagamento'

/**
 * Etapas 2 e 3 da contratação, num formulário só: voltar do pagamento ao
 * contrato preserva o que foi preenchido e o aceite marcado.
 *
 * O botão de avançar nunca fica desabilitado: ao clicar, os erros aparecem
 * junto dos campos. O preço é sempre o orçamento do servidor.
 */
export function ContractingFlow() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selection, clear } = useCheckoutStore()
  const { apply } = useRefreshCompanySession()

  const [step, setStep] = useState<Step>('contrato')
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [registry, setRegistry] = useState<RegistryState>({ status: 'idle' })
  const [representative, setRepresentative] = useState<RepresentativeState>({
    status: 'idle',
  })
  const [submitting, setSubmitting] = useState(false)
  // Consultas antigas que chegam depois de o valor ter mudado são descartadas.
  const lookupSeq = useRef(0)
  const representativeSeq = useRef(0)

  const form = useForm<ContractingForm>({
    resolver: zodResolver(contractingSchema),
    mode: 'onTouched',
    defaultValues: {
      personType: 'PJ',
      email: '',
      representativeIsSelf: false,
      termsAccepted: false,
      billingType: 'CREDIT_CARD',
    },
  })

  // Os dados da conta preenchem o que a contratação pede (reaproveitamento).
  useEffect(() => {
    if (!session?.user) return
    if (!form.getValues('email'))
      form.setValue('email', session.user.email ?? '')
    if (!form.getValues('name')) form.setValue('name', session.user.name ?? '')
  }, [session?.user, form])

  // Sem plano escolhido, a contratação começa pela etapa do plano.
  useEffect(() => {
    if (!selection.planId) router.replace('/assinatura')
  }, [selection.planId, router])

  const billingType = useWatch({ control: form.control, name: 'billingType' })
  const values = useWatch({ control: form.control })

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
    queryKey: ['checkout-quote', selection, billingType, appliedCoupon],
    queryFn: async () => {
      const res = await fetchQuote({
        planId: selection.planId!,
        modules: selection.modules,
        additionalUsers: selection.additionalUsers,
        billingType,
        couponCode: appliedCoupon ?? undefined,
      })
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    enabled: !!selection.planId,
    placeholderData: (previous) => previous,
  })
  const quoteResponse = quoteQuery.data
  const quote = quoteResponse?.quote ?? null

  // A situação mudou (cobrança em aberto, plano já contratado) ou o plano
  // deixou de ser elegível.
  useEffect(() => {
    if (!quoteResponse) return
    if (quoteResponse.intent === 'REGULARIZATION') {
      router.replace('/assinatura/contratacao?modo=regularizacao')
    } else if (quoteResponse.intent === 'EVOLUTION') {
      // Quem já tem plano evolui ou inclui complementos pela página de planos.
      router.replace('/assinatura')
    } else if (!quoteResponse.eligible) {
      toast.warning('Este plano não está disponível para contratação agora.')
      router.replace('/assinatura')
    }
  }, [quoteResponse, router])

  const handleRepresentativeCpfChange = (masked: string) => {
    const cnpj = (form.getValues('cnpj') ?? '').replace(/\D/g, '')
    const cpf = masked.replace(/\D/g, '')
    if (cnpj.length !== 14 || cpf.length !== 11 || !HandleValidateCpf(cpf)) {
      representativeSeq.current++
      setRepresentative({ status: 'idle' })
      return
    }
    const seq = ++representativeSeq.current
    setRepresentative({ status: 'checking' })
    checkRepresentative(cnpj, cpf).then((res) => {
      if (seq !== representativeSeq.current) return
      if (res.success && res.data?.verified) {
        form.clearErrors('representativeCpf')
        setRepresentative({
          status: 'verified',
          name: res.data.representativeName ?? '',
          qualification: res.data.qualification,
        })
      } else if (res.code === 'REPRESENTATIVE_NOT_IN_REGISTRY') {
        setRepresentative({ status: 'rejected', message: res.message ?? '' })
      } else {
        // Sem quadro para conferir, ou consulta indisponível: segue sem
        // conferência, com o nome informado.
        setRepresentative({ status: 'unverifiable' })
      }
    })
  }

  const handleCnpjChange = (masked: string) => {
    const digits = masked.replace(/\D/g, '')
    if (digits.length !== 14 || !HandleValidateCnpj(digits)) {
      lookupSeq.current++
      setRegistry({ status: 'idle' })
      setRepresentative({ status: 'idle' })
      return
    }
    const seq = ++lookupSeq.current
    setRegistry({ status: 'loading' })
    lookupCompany(digits).then((res) => {
      if (seq !== lookupSeq.current) return
      if (res.success && res.data?.found) {
        setRegistry({ status: 'found', data: res.data })
      } else if (res.success) {
        setRegistry({
          status: 'manual',
          message:
            'Não encontramos esse CNPJ na base pública. Confira o número ou preencha os dados da empresa.',
        })
      } else {
        setRegistry({
          status: 'manual',
          message:
            'Não foi possível consultar o CNPJ agora. Preencha os dados da empresa.',
        })
      }
      const cpf = form.getValues('representativeCpf')
      if (cpf) handleRepresentativeCpfChange(cpf)
    })
  }

  const parties = useMemo(() => {
    const isPJ = values.personType === 'PJ'
    return {
      contractorType: (values.personType ?? 'PJ') as 'PJ' | 'PF',
      contractorName: isPJ
        ? registry.status === 'found'
          ? (registry.data.legalName ?? '')
          : (values.legalName ?? '')
        : (values.name ?? ''),
      contractorDocument: ((isPJ ? values.cnpj : values.cpf) ?? '').replace(
        /\D/g,
        '',
      ),
      representativeName: isPJ
        ? representative.status === 'verified'
          ? representative.name
          : (values.representativeName ?? null)
        : null,
      representativeCpf: isPJ ? (values.representativeCpf ?? null) : null,
    }
  }, [values, registry, representative])

  const goToPayment = async () => {
    setTermsError(null)
    const valid = await form.trigger(CONTRACT_STEP_FIELDS, {
      shouldFocus: true,
    })
    const v = form.getValues()
    let extraValid = true

    if (v.personType === 'PJ') {
      if (
        registry.status === 'loading' ||
        representative.status === 'checking'
      ) {
        toast.info('Aguarde a consulta terminar.')
        return
      }
      if (registry.status === 'manual' && !v.legalName?.trim()) {
        form.setError('legalName', { message: 'Informe a razão social.' })
        extraValid = false
      }
      if (representative.status === 'rejected') {
        form.setError('representativeCpf', { message: representative.message })
        extraValid = false
      }
      if (
        representative.status === 'unverifiable' &&
        (v.representativeName?.trim().length ?? 0) < 2
      ) {
        form.setError('representativeName', {
          message: 'Informe o nome do representante legal.',
        })
        extraValid = false
      }
    }

    if (!valid || !extraValid) {
      toast.error('Revise os dados informados.')
      return
    }
    if (!v.termsAccepted) {
      setTermsError('Leia e aceite os Termos de Contratação para continuar.')
      return
    }
    setStep('pagamento')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = async () => {
    if (!quote || !terms || !selection.planId) return
    const v = form.getValues()
    setSubmitting(true)

    const payload: CheckoutRequest = {
      planId: selection.planId,
      modules: selection.modules,
      additionalUsers: selection.additionalUsers,
      billingType: v.billingType,
      couponCode: appliedCoupon ?? undefined,
      expectedTotalCents: quote.totalCents,
      contractor:
        v.personType === 'PJ'
          ? {
              type: 'PJ',
              cnpj: v.cnpj,
              email: v.email,
              legalName: v.legalName?.trim() || undefined,
              tradeName: v.tradeName?.trim() || undefined,
            }
          : { type: 'PF', cpf: v.cpf, name: v.name, email: v.email },
      representative:
        v.personType === 'PJ'
          ? {
              cpf: v.representativeCpf ?? '',
              name:
                representative.status === 'unverifiable'
                  ? v.representativeName?.trim()
                  : undefined,
              isSelf: !!v.representativeIsSelf,
            }
          : undefined,
      termsAcceptance: {
        contractId: terms.contractId,
        version: terms.version,
        accepted: true,
      },
    }

    // Chave nova a cada tentativa: reenviar a mesma chave depois de um erro
    // devolveria o erro guardado, não uma nova tentativa.
    const res = await submitCheckout(payload, generateIdempotencyKey())

    if (res.success && res.data) {
      if (res.data.session) await apply(res.data.session)
      clear()
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        router.replace('/assinatura/concluir')
      }
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
        form.setValue('termsAccepted', false)
        refetchTerms()
        setStep('contrato')
        break
      case 'REPRESENTATIVE_NOT_IN_REGISTRY':
      case 'REPRESENTATIVE_REQUIRED':
        setStep('contrato')
        form.setError('representativeCpf', { message: res.message })
        break
      case 'REPRESENTATIVE_NAME_REQUIRED':
        setStep('contrato')
        setRepresentative({ status: 'unverifiable' })
        form.setError('representativeName', { message: res.message })
        break
      case 'LEGAL_NAME_REQUIRED':
        setStep('contrato')
        setRegistry({ status: 'manual', message: res.message ?? '' })
        form.setError('legalName', { message: res.message })
        break
      case 'REGULARIZATION_REQUIRED':
        router.replace('/assinatura/contratacao?modo=regularizacao')
        break
      case 'COUPON_NOT_APPLIED':
        toast.error(res.message)
        setAppliedCoupon(null)
        break
      default:
        toast.error(res.message)
    }
  }

  const trialEndsAt = session?.company?.plan?.trialEndsAt
  const trialExpired =
    session?.company?.plan?.name === 'TRIAL' &&
    !!trialEndsAt &&
    new Date(trialEndsAt) < new Date()

  if (!selection.planId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <CheckoutHeader
        title="Contratação"
        backHref="/assinatura"
        onBack={step === 'pagamento' ? () => setStep('contrato') : undefined}
      />

      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="container mx-auto px-4 py-8"
          noValidate
        >
          {trialExpired && (
            <Alert
              variant="warning"
              className="mb-6 border-warning-200 bg-warning-50"
            >
              <AlertTitle className="text-warning-800 font-semibold">
                Seu teste gratuito terminou
              </AlertTitle>
              <AlertDescription className="text-warning-700">
                Contrate para voltar a usar a Atrupe. O que você cadastrou
                durante o teste continua guardado.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div hidden={step !== 'contrato'}>
                <ContractorStep
                  signedInAs={session?.user?.name ?? ''}
                  registry={registry}
                  representative={representative}
                  onCnpjChange={handleCnpjChange}
                  onRepresentativeCpfChange={handleRepresentativeCpfChange}
                />
              </div>
              <div hidden={step !== 'pagamento'}>
                <PaymentStep
                  appliedCoupon={appliedCoupon}
                  couponStatus={quote?.coupon}
                  onApplyCoupon={setAppliedCoupon}
                />
              </div>
            </div>

            <div>
              <OrderSummary
                quote={quote}
                isLoading={quoteQuery.isLoading}
                billingType={step === 'pagamento' ? billingType : undefined}
              >
                {step === 'contrato' ? (
                  <div className="space-y-4 pt-2">
                    <Controller
                      control={form.control}
                      name="termsAccepted"
                      render={({ field }) => (
                        <label className="flex items-start gap-2 text-sm text-gray-700">
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(!!checked)
                              if (checked) setTermsError(null)
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
                      )}
                    />
                    {termsError && (
                      <p className="text-sm text-error-600" role="alert">
                        {termsError}
                      </p>
                    )}
                    <Button
                      type="button"
                      className="w-full"
                      onClick={goToPayment}
                      RightIcon={IconArrowRight}
                    >
                      Contratar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={submit}
                      isLoading={submitting}
                      disabled={submitting || !quote}
                    >
                      Realizar pagamento
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={submitting}
                      onClick={() => setStep('contrato')}
                    >
                      Voltar
                    </Button>
                    <p className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <IconLock size={14} /> Pagamento processado com segurança
                    </p>
                  </div>
                )}
              </OrderSummary>
            </div>
          </div>
        </form>
      </Form>

      <TermsDialog
        open={termsOpen}
        onOpenChange={setTermsOpen}
        html={terms?.html}
        version={terms?.version}
        parties={parties}
        onAccept={() => {
          form.setValue('termsAccepted', true)
          setTermsError(null)
        }}
      />
    </div>
  )
}
