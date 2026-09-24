'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconCoin } from '@tabler/icons-react'

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

import {
  CheckLine,
  CheckoutColumns,
  CheckoutShell,
  ConfirmCard,
  ProceedButton,
  TermsCheckbox,
} from '../../components/checkout/CheckoutLayout'
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
  const { data: session } = useSession()
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
    <CheckoutShell title="Complementos" backHref="/assinatura">
      <CheckoutColumns
        aside={
          <>
            <div className="flex flex-col gap-6 rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-lg font-semibold leading-7 text-gray-700">
                Resumo da assinatura
              </p>
              <div className="h-px bg-gray-200" />
              {!quote ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-6">
                    {quote.lines.map((line) => (
                      <div
                        key={`${line.kind}-${line.label}`}
                        className="flex items-center justify-between gap-2.5"
                      >
                        <CheckLine className="text-gray-500">
                          {line.label}
                          {line.quantity ? ` (${line.quantity})` : ''}
                        </CheckLine>
                        <span className="flex-none whitespace-nowrap text-sm font-semibold text-gray-600">
                          {formatCurrencyToBrl(line.monthlyCents)}
                          <small className="ml-0.5 font-normal text-gray-500">
                            /mês
                          </small>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-700">
                    <span>Cobrado agora</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-gray-700">
                      <IconCoin className="size-6 flex-none text-brand-500" />
                      {formatCurrencyToBrl(quote.chargedNowCents)}
                    </span>
                  </div>
                  <p className="-mt-2 text-xs text-gray-500">
                    A partir da mensalidade de{' '}
                    <strong className="font-semibold text-gray-700">
                      {formatDay(quote.nextChargeDate)}
                    </strong>
                    , o valor passa de{' '}
                    {formatCurrencyToBrl(quote.currentRecurringCents)} para{' '}
                    <strong className="font-semibold text-brand-600">
                      {formatCurrencyToBrl(quote.recurringCents)}/mês
                    </strong>
                    .
                  </p>
                </>
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
                onClick={submit}
                isLoading={submitting}
                disabled={submitting || !quote}
              >
                Contratar complementos
              </ProceedButton>
              <p className="text-[11px] text-gray-500">
                Os complementos ficam disponíveis assim que a contratação é
                registrada.
              </p>
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
    </CheckoutShell>
  )
}
