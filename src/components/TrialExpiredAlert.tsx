// Next
import Link from 'next/link'

// Components
import { Button } from '@/components/ui/button'

// Icons
import {
  IconClock,
  IconClockX,
  IconArrowNarrowRight,
  IconClockExclamation,
} from '@tabler/icons-react'

// Libs
import { cn } from '@/lib/utils'
import { auth } from '@/lib/auth'

export async function TrialExpiredAlert() {
  const session = await auth()

  if (!session) return null

  const { trialEndsAt, name: planName } = session.company.plan

  if (planName !== 'TRIAL') return null

  const isExpired = new Date(trialEndsAt) < new Date()

  const trialOneDayLeft =
    new Date(trialEndsAt).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24

  const Icon = isExpired
    ? IconClockX
    : trialOneDayLeft
      ? IconClockExclamation
      : IconClock

  const trialDaysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  )

  return (
    <div
      className={cn(
        'border-b',
        isExpired || trialOneDayLeft
          ? 'bg-error-50 border-error-200'
          : 'bg-warning-50 border-warning-200',
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-4">
        <Icon
          className={cn(
            'size-8 stroke-1 flex-shrink-0',
            isExpired || trialOneDayLeft
              ? 'text-error-600'
              : 'text-warning-600',
          )}
        />
        <div className="flex flex-col flex-shrink-0">
          <span
            className={cn(
              'text-sm font-semibold',
              isExpired || trialOneDayLeft
                ? 'text-error-600'
                : 'text-warning-600',
            )}
          >
            {isExpired
              ? 'Seu teste expirou'
              : `Seu teste expira em ${trialDaysLeft} dia${
                  trialDaysLeft > 1 ? 's' : ''
                }`}
          </span>
          <span className="text-sm text-gray">
            Escolha o melhor plano para o seu negócio e contrate agora!
          </span>
        </div>
        <Button asChild size="md" RightIcon={IconArrowNarrowRight}>
          <Link href="/assinatura">Contratar</Link>
        </Button>
      </div>
    </div>
  )
}
