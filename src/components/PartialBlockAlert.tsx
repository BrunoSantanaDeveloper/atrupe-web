// Next
import Link from 'next/link'

// Components
import { Button } from '@/components/ui/button'

// Icons
import { IconCashBanknote, IconArrowNarrowRight } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Libs
import { auth } from '@/lib/auth'

// Actions
import { getPendingPaymentUrl } from '@/actions/subscription'

export async function PartialBlockAlert() {
  const session = await auth()

  if (!session) return null

  const blockLevel = session.company?.blockLevel

  // Only show for PARTIAL block
  if (blockLevel !== 'PARTIAL') return null

  // Get dynamic payment URL
  const { paymentUrl } = await getPendingPaymentUrl()

  return (
    <div className="border-b bg-warning-50 border-warning-200 z-50">
      <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4">
        <Icon icon={IconCashBanknote} size="lg" className="text-warning-600" />
        <div className="flex flex-col flex-shrink-0">
          <span className="text-sm font-semibold text-warning-600">
            Mensalidade atrasada
          </span>
          <span className="text-sm text-gray">
            Regularize o pagamento para manter sua conta ativa.
          </span>
        </div>
        <Button
          asChild
          size="md"
          RightIcon={IconArrowNarrowRight}
          disabled={!paymentUrl}
        >
          <Link href={paymentUrl || '#'} target="_blank">
            Pagar agora
          </Link>
        </Button>
      </div>
    </div>
  )
}
