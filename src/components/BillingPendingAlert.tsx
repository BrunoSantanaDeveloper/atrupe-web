// Next
import Link from 'next/link'

// Components
import { Button } from '@/components/ui/button'

// Icons
import { IconArrowNarrowRight, IconClockHour4 } from '@tabler/icons-react'

// Libs
import { auth } from '@/lib/auth'

/**
 * Faixa da cobrança em aberto que ainda não bloqueia nada:
 * - contratação registrada com a primeira cobrança pendente — desde 20/10 o
 *   plano espera esse pagamento para ser liberado, e a pessoa segue no teste
 *   gratuito; antes disso, o acesso já está liberado e a faixa só lembra de
 *   concluir o pagamento;
 * - evolução esperando o pagamento — o plano atual segue valendo até lá;
 * - mensalidade com 1 ou 2 dias de atraso — antes do bloqueio parcial.
 *
 * Com a conta bloqueada, quem fala é a faixa de bloqueio (PartialBlockAlert),
 * que tem precedência.
 */
export async function BillingPendingAlert() {
  const session = await auth()
  const billing = session?.company?.billing
  if (!session || !billing) return null
  if (session.company.blockLevel !== 'NONE') return null

  const regularizeHref = '/assinatura/contratacao?modo=regularizacao'

  if (billing.paymentPending) {
    return (
      <div className="border-b bg-warning-50 border-warning-200 z-50">
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4">
          <IconClockHour4 className="size-8 stroke-1 flex-shrink-0 text-warning-600" />
          <div className="flex flex-col flex-shrink-0">
            <span className="text-sm font-semibold text-warning-600">
              {billing.evolutionPending
                ? 'Pagamento da evolução pendente'
                : 'Pagamento da contratação pendente'}
            </span>
            <span className="text-sm text-gray">
              {billing.evolutionPending
                ? 'O novo plano é liberado assim que o pagamento for confirmado. Até lá, seu plano atual continua valendo.'
                : billing.activationPending
                  ? 'O plano contratado é liberado assim que o pagamento for confirmado.'
                  : 'Seu acesso já está liberado. Conclua o pagamento para confirmar a assinatura.'}
            </span>
          </div>
          {billing.chargeInFocus?.invoiceUrl && (
            <Button asChild size="md" RightIcon={IconArrowNarrowRight}>
              <Link href={billing.chargeInFocus.invoiceUrl} target="_blank">
                Pagar agora
              </Link>
            </Button>
          )}
          <Button asChild size="md" variant="outline">
            <Link href={regularizeHref}>Trocar forma de pagamento</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (billing.situation === 'ATRASADA') {
    return (
      <div className="border-b bg-warning-50 border-warning-200 z-50">
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4">
          <IconClockHour4 className="size-8 stroke-1 flex-shrink-0 text-warning-600" />
          <div className="flex flex-col flex-shrink-0">
            <span className="text-sm font-semibold text-warning-600">
              Mensalidade atrasada
            </span>
            <span className="text-sm text-gray">
              Regularize o pagamento para manter sua conta ativa.
            </span>
          </div>
          <Button asChild size="md" RightIcon={IconArrowNarrowRight}>
            <Link href={regularizeHref}>Pagar agora</Link>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
