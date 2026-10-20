'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { IconAlertTriangle } from '@tabler/icons-react'

import { SUBSCRIPTION_PAGE } from '@/config/routes'
import { planErrorFromResult } from '@/lib/api-error-message'
import { ASK_PRINCIPAL_ADMIN } from '@/lib/plans/planAccess'
import { useAlertDialog } from '@/store/useAlertDialog'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import type { PlanError } from '@/types/planError'

/** O retorno de erro de uma ação: helpers de `_cruds` ou `domainCall`. */
interface ActionErrorResult {
  message?: string
  planError?: PlanError
  code?: unknown
  details?: Record<string, unknown>
}

/**
 * Aviso para quando a API recusa uma ação por plano (contrato da camada de
 * planos, §3 e §8).
 *
 * - FEATURE_NOT_AVAILABLE: toast de erro com a mensagem do servidor, que já
 *   diz a partir de qual plano o recurso existe, e "Ver planos" (a trilha de
 *   contratação) só para o titular — só ele contrata.
 * - PLAN_LIMIT_REACHED: diálogo com a mensagem do servidor (plano e máximo)
 *   e "Ver planos" para o titular.
 *
 * Nos dois casos a sessão é buscada na hora: se a API recusou, o plano da
 * sessão está velho, e o menu e as paredes passam a refletir o do servidor.
 */
export function usePlanErrorToast() {
  const router = useRouter()
  const { data: session } = useSession()
  const { refresh } = useRefreshCompanySession()
  const { open: openAlertDialog } = useAlertDialog()

  const isOwner = !!session?.company?.isOwner

  /** Trata o erro de plano; devolve `false` quando não há erro de plano. */
  const notifyPlanError = useCallback(
    (planError?: PlanError | null) => {
      if (!planError) return false

      refresh({ force: true }).catch(() => null)

      if (planError.code === 'PLAN_LIMIT_REACHED') {
        openAlertDialog({
          title:
            planError.limit === 'max_users'
              ? 'Limite de usuários atingido'
              : 'Limite do plano atingido',
          description: isOwner
            ? planError.message
            : `${planError.message} ${ASK_PRINCIPAL_ADMIN}`,
          Icon: IconAlertTriangle,
          iconTone: 'warning',
          confirmLabel: isOwner ? 'Ver planos' : '',
          confirmVariant: 'default',
          cancelLabel: 'Entendi',
          onConfirm: isOwner ? () => router.push(SUBSCRIPTION_PAGE) : undefined,
          // Sem aviso de "carregando" nem de sucesso ao sair para os planos.
          toastMsg: undefined,
        }).catch(() => undefined)
        return true
      }

      // Como na parede: sem plano que tenha o recurso, ou com ele ainda fora
      // de contratação, não há o que contratar na trilha.
      const purchasable =
        !!planError.module || !!planError.availableFrom?.isActive
      toast.error(planError.message, {
        description: !isOwner && purchasable ? ASK_PRINCIPAL_ADMIN : undefined,
        action:
          isOwner && purchasable
            ? {
                label: 'Ver planos',
                onClick: () => router.push(SUBSCRIPTION_PAGE),
              }
            : undefined,
      })
      return true
    },
    [isOwner, openAlertDialog, refresh, router],
  )

  /**
   * Avisa a falha de uma ação: erro de plano como acima; qualquer outro, o
   * toast com a mensagem do servidor (ou o texto padrão de quem chama).
   */
  const notifyActionError = useCallback(
    (result: ActionErrorResult | null | undefined, fallback?: string) => {
      if (notifyPlanError(planErrorFromResult(result))) return
      toast.error(
        result?.message ||
          fallback ||
          'Não foi possível concluir agora. Tente novamente.',
      )
    },
    [notifyPlanError],
  )

  return { notifyActionError, notifyPlanError }
}

/**
 * Avisa o erro de plano de uma leitura (lista ou item), uma vez por
 * resposta. Com a sessão velha, a tela abre e a API recusa a leitura; o
 * aviso busca a sessão de novo e a parede da tela passa a valer.
 *
 * Uma vez por resposta, e não a cada render: o refresh muda a sessão, o
 * que recriaria o aviso e buscaria a sessão de novo, em ciclo.
 */
export function useNotifyPlanErrorOnce(
  result: ActionErrorResult | null | undefined,
) {
  const { notifyPlanError } = usePlanErrorToast()
  const notifiedRef = useRef<unknown>(null)

  useEffect(() => {
    if (!result || notifiedRef.current === result) return
    notifiedRef.current = result
    notifyPlanError(planErrorFromResult(result))
  }, [result, notifyPlanError])
}
