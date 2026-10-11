'use client'

// Next
import Link from 'next/link'
import { useSession } from 'next-auth/react'

// Icons
import { IconUsers } from '@tabler/icons-react'

// Lib
import { SUBSCRIPTION_PAGE } from '@/config/routes'
import { ASK_PRINCIPAL_ADMIN, isUsersQuotaFull } from '@/lib/plans/planAccess'
import { cn } from '@/lib/utils'

// Types
import type { UsersQuotaType } from '@/types/settings/employee'

/**
 * Quantos usuários têm acesso e quantos o plano permite, já com os usuários
 * adicionais (contrato da camada de planos, §5). Na cota, o aviso diz por
 * que "Novo usuário" está desabilitado e, para o titular, leva aos planos.
 */
export function UsersQuotaNotice({ quota }: { quota: UsersQuotaType }) {
  const { data: session } = useSession()
  const isOwner = !!session?.company?.isOwner
  const full = isUsersQuotaFull(quota)

  const limitLabel =
    quota.limit === -1
      ? ' (ilimitado)'
      : quota.limit === null
        ? ''
        : ` de ${quota.limit}`

  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 text-sm',
        full ? 'border-warning-200 bg-warning-50' : 'border-gray-200 bg-white',
      )}
    >
      <IconUsers
        className={cn('size-4', full ? 'text-warning-600' : 'text-gray-500')}
        aria-hidden="true"
      />
      <span className="text-gray-700">
        Usuários com acesso:{' '}
        <span className="font-semibold text-gray-900 tabular-nums">
          {quota.used}
          {limitLabel}
        </span>
      </span>
      {full ? (
        <span className="text-warning-700">
          Limite do plano atingido.{isOwner ? '' : ` ${ASK_PRINCIPAL_ADMIN}`}
        </span>
      ) : null}
      {full && isOwner ? (
        <Link
          href={SUBSCRIPTION_PAGE}
          className="font-semibold text-brand-700 hover:underline"
        >
          Ver planos
        </Link>
      ) : null}
    </div>
  )
}
