'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { fetchCompanySession } from '@/actions/checkout'
import { useCompanySessionContext } from '@/contexts/nextAuthProvider'
import type { CompanySessionBlock } from '@/types/checkout'

/**
 * Leva à sessão o estado da empresa no servidor — plano, bloqueio e situação
 * da cobrança — sem novo login.
 *
 * Antes, contratar ou pagar só refletia na sessão no login seguinte: quem
 * pagava continuava preso na tela de assinatura (o middleware lia o fim do
 * teste antigo) até sair e entrar de novo.
 */
export function useRefreshCompanySession() {
  const { update } = useSession()
  const companySession = useCompanySessionContext()

  const apply = useCallback(
    async (block: CompanySessionBlock) => {
      await update({
        company: {
          plan: block.plan,
          blockLevel: block.blockLevel,
          billing: block.billing,
          isOwner: block.isOwner,
        },
      })
    },
    [update],
  )

  /**
   * Busca na hora, sem o intervalo mínimo do provider (contratação,
   * pagamento, 403 de plano). Com `{ force: false }`, respeita o intervalo:
   * para quem pode chamar várias vezes seguidas.
   */
  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force ?? true
      if (companySession) {
        return companySession.refreshCompanyState({ force })
      }
      const res = await fetchCompanySession()
      if (!res.success || !res.data) return null
      await apply(res.data)
      return res.data
    },
    [apply, companySession],
  )

  return { refresh, apply }
}
