'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrencyToBrl } from '@/lib/utils'
import { generateIdempotencyKey } from '@/lib/idempotency'
import {
  fetchComplementsQuote,
  fetchContractingCurrent,
  fetchContractTerms,
  submitComplements,
} from '@/actions/checkout'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'

import { CheckoutHeader } from '../../components/checkout/CheckoutHeader'
import { ContractorReadOnly } from './ContractorReadOnly'
import { TermsDialog } from './TermsDialog'

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' })

/** O que manda de volta à escolha dos complementos, com o aviso do motivo. */
const BACK_TO_CHOICE = new Set([
  'NOTHING_TO_CHANGE',
  'MODULE_ALREADY_CONTRACTED',
  'MODULE_INCLUDED_IN_PLAN',
  'MODULE_NOT_AVAILABLE',
  'USERS_REDUCTION_NOT_AVAILABLE',
  'COMPLEMENTS_NOT_AVAILABLE',
  'NO_ACTIVE_SUBSCRIPTION',
])

/**
 * Complementos do plano atual: o contrato muda de objeto, então o aceite dos
 * Termos é pedido de novo. Não há etapa de pagamento: o complemento é
 * liberado na hora e cobrado a partir da próxima mensalidade.
 */
export function ComplementsFlow() {
  const router = useRouter()
  const { selection, clear } = useCheckoutStore()
  const { apply } = useRefreshCompanySession()

  const [accepted, setAccepted] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const ready = selection.mode === 'COMPLEMENTS'
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

  // O resultado inteiro, com o código do erro: é ele que diz o que fazer.
  const quoteQuery = useQuery({
    queryKey: ['complements-checkout-quote', selection],
    queryFn: () =>
      fetchComplementsQuote({
        modules: selection.modules,
        additionalUsers: selection.additionalUsers,
      }),
    enabled: ready,
    refetchOnWindowFocus: false,
  })
  const quote = quoteQuery.data?.success ? quoteQuery.data.data : null

  useEffect(() => {
    const res = quoteQuery.data
    if (!res || res.success) return
    if (res.code === 'REGULARIZATION_REQUIRED') {
      router.replace('/assinatura/contratacao?modo=regularizacao')
      return
    }
    toast.warning(res.message)
    router.replace('/assinatura')
  }, [quoteQuery.data, router])

  const submit = async () => {
    if (!accepted) {
      setTermsError('Leia e aceite os Termos de Contratação para continuar.')
      return
    }
    if (!quote || !terms) return
    setSubmitting(true)

    const res = await submitComplements(
      {
        modules: selection.modules,
        additionalUsers: selection.additionalUsers,
        expectedRecurringCents: quote.recurringCents,
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
      toast.success(
        `Complementos incluídos e já liberados. Entram na mensalidade de ${formatDay(res.data.nextChargeDate)}.`,
      )
      router.replace('/configuracoes/empresa-e-sistema/assinatura')
      return
    }

    setSubmitting(false)
    if (res.code === 'PRICE_CHANGED') {
      toast.warning(
        'O valor mudou desde que o resumo foi exibido. Confira o novo total.',
      )
      quoteQuery.refetch()
    } else if (res.code === 'TERMS_OUTDATED') {
      toast.warning(res.message)
      setAccepted(false)
      refetchTerms()
    } else if (res.code === 'REGULARIZATION_REQUIRED') {
      router.replace('/assinatura/contratacao?modo=regularizacao')
    } else if (res.code && BACK_TO_CHOICE.has(res.code)) {
      toast.warning(res.message)
      router.replace('/assinatura')
    } else {
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

  return (
    <div className="w-full min-h-screen bg-gray-100">
      <CheckoutHeader title="Complementos" backHref="/assinatura" />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {contractor ? (
              <ContractorReadOnly contractor={contractor} />
            ) : (
              <Skeleton className="h-40 w-full" />
            )}
          </div>

          <div>
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {!quote ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-8 w-1/2" />
                  </div>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {quote.lines.map((line) => (
                        <li
                          key={`${line.kind}-${line.label}`}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-gray-700">
                            {line.label}
                            {line.quantity ? ` (${line.quantity})` : ''}
                          </span>
                          <span className="text-gray-900 whitespace-nowrap">
                            {formatCurrencyToBrl(line.monthlyCents)}/mês
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Separator />

                    <div className="flex items-end justify-between">
                      <span className="text-gray-700 font-medium">
                        Cobrado agora
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrencyToBrl(quote.chargedNowCents)}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      A partir da mensalidade de{' '}
                      <strong>{formatDay(quote.nextChargeDate)}</strong>, o
                      valor passa de{' '}
                      {formatCurrencyToBrl(quote.currentRecurringCents)} para{' '}
                      <strong>
                        {formatCurrencyToBrl(quote.recurringCents)}/mês
                      </strong>
                      .
                    </p>
                  </>
                )}

                <label className="flex items-start gap-2 text-gray-700">
                  <Checkbox
                    checked={accepted}
                    onCheckedChange={(checked) => {
                      setAccepted(!!checked)
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
                {termsError && (
                  <p className="text-error-600" role="alert">
                    {termsError}
                  </p>
                )}

                <Button
                  type="button"
                  className="w-full"
                  onClick={submit}
                  isLoading={submitting}
                  disabled={submitting || !quote}
                >
                  Contratar complementos
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Os complementos ficam disponíveis assim que a contratação é
                  registrada.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
