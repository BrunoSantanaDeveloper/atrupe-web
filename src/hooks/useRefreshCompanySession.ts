'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { fetchCompanySession } from '@/actions/checkout'
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

  const refresh = useCallback(async () => {
    const res = await fetchCompanySession()
    if (!res.success || !res.data) return null
    await apply(res.data)
    return res.data
  }, [apply])

  return { refresh, apply }
}
