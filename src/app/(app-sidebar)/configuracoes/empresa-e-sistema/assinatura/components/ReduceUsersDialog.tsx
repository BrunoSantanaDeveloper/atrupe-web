'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconMinus, IconPlus, IconUserMinus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchContractingCurrent,
  removeAdditionalUsers,
} from '@/actions/checkout'
import { useRefreshCompanySession } from '@/hooks/useRefreshCompanySession'
import { formatCurrencyToBrl } from '@/lib/utils'

interface ReduceUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const USERS_PAGE = '/configuracoes/empresa-e-sistema/colaboradores-e-usuarios'

const plural = (n: number, one: string, many: string) =>
  n === 1 ? `1 ${one}` : `${n} ${many}`

/**
 * Retirar usuários adicionais. A quantidade nova vale na hora; o valor sai
 * das mensalidades ainda não pagas, inclusive a que já foi gerada e não
 * venceu. Os usuários ativos precisam caber no plano com a quantidade nova.
 */
export function ReduceUsersDialog({
  open,
  onOpenChange,
}: ReduceUsersDialogProps) {
  const queryClient = useQueryClient()
  const { refresh } = useRefreshCompanySession()
  const [target, setTarget] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const currentQuery = useQuery({
    queryKey: ['contracting-current'],
    queryFn: async () => {
      const res = await fetchContractingCurrent()
      if (!res.success || !res.data) throw new Error(res.message)
      return res.data
    },
    enabled: open,
    refetchOnWindowFocus: false,
  })
  const current = currentQuery.data
  const sub = current?.subscription ?? null

  const contracted = sub?.additionalUsers ?? 0
  const included = sub?.includedUsers ?? null
  const inUse = sub?.usersInUse ?? 0
  // O mínimo de adicionais que comporta os usuários ativos de hoje.
  const minimum =
    included == null ? 0 : Math.min(contracted, Math.max(0, inUse - included))
  const canReduce = minimum < contracted
  const blockedByCycle =
    current?.restriction === 'ANNUAL_CYCLE' ||
    current?.restriction === 'NOT_BILLED_BY_GATEWAY'

  // Ao abrir, sugere o menor número possível: o pedido mais comum é voltar
  // aos usuários do plano.
  useEffect(() => {
    if (open && sub) setTarget(minimum)
  }, [open, sub, minimum])

  const priceCents = sub?.additionalUserPriceCents ?? 0
  const removed = contracted - target
  const newRecurringCents = (sub?.recurringCents ?? 0) - removed * priceCents

  const submit = async () => {
    if (!sub) return
    setSubmitting(true)
    const res = await removeAdditionalUsers(sub.id, target)
    setSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      currentQuery.refetch()
      return
    }

    await refresh()
    queryClient.invalidateQueries({ queryKey: ['subscription-active'] })
    queryClient.invalidateQueries({ queryKey: ['subscription-payments'] })
    queryClient.invalidateQueries({ queryKey: ['contracting-current'] })
    toast.success(
      `${plural(removed, 'usuário adicional retirado', 'usuários adicionais retirados')}. A mensalidade passa a ${formatCurrencyToBrl(newRecurringCents)}.`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="orangeBorderedLight"
                Icon={IconUserMinus}
                rounded
              />
              <span>Reduzir usuários adicionais</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Escolha quantos usuários adicionais a assinatura passa a ter.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {currentQuery.isLoading || !sub ? (
            currentQuery.isError ? (
              <p className="text-sm text-error-600">
                Não foi possível carregar a assinatura. Feche e tente de novo.
              </p>
            ) : (
              <Skeleton className="h-32 w-full rounded-lg" />
            )
          ) : blockedByCycle ? (
            <p className="text-sm text-gray-600">
              {current?.restriction === 'ANNUAL_CYCLE'
                ? 'No plano anual, a redução de usuários ainda não é feita por aqui. Fale com a Atrupe.'
                : 'Esta assinatura não é cobrada pelo gateway de pagamento. Fale com a Atrupe para reduzir os usuários.'}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4">
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-gray-900">
                    Usuários adicionais
                  </p>
                  <p className="text-gray-500">
                    Hoje: {contracted} · {formatCurrencyToBrl(priceCents)}/mês
                    cada
                  </p>
                </div>
                <div className="flex flex-none items-center gap-1.5">
                  <Button
                    type="button"
                    size="icon"
                    className="size-9 rounded-md"
                    aria-label="Diminuir"
                    disabled={!canReduce || target <= minimum}
                    onClick={() => setTarget((t) => Math.max(minimum, t - 1))}
                  >
                    <IconMinus size={16} />
                  </Button>
                  <input
                    type="number"
                    readOnly
                    value={target}
                    aria-label="Usuários adicionais que ficam"
                    className="h-9 w-14 rounded-md border border-gray-300 bg-white p-0 text-center text-sm text-gray-900"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="size-9 rounded-md"
                    aria-label="Aumentar"
                    disabled={!canReduce || target >= contracted - 1}
                    onClick={() =>
                      setTarget((t) => Math.min(contracted - 1, t + 1))
                    }
                  >
                    <IconPlus size={16} />
                  </Button>
                </div>
              </div>

              {included != null && (
                <p className="text-sm text-gray-600">
                  O plano inclui {plural(included, 'usuário', 'usuários')} e a
                  empresa tem{' '}
                  {plural(inUse, 'usuário ativo', 'usuários ativos')}.
                  {minimum > 0 && canReduce && (
                    <>
                      {' '}
                      Para ficar com menos de {minimum}{' '}
                      {minimum === 1 ? 'adicional' : 'adicionais'}, desative
                      usuários antes em{' '}
                      <Link
                        href={USERS_PAGE}
                        className="font-medium text-brand-600 underline"
                      >
                        Colaboradores e usuários
                      </Link>
                      .
                    </>
                  )}
                </p>
              )}

              {canReduce ? (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                  <p>
                    A mensalidade passa de{' '}
                    <strong>{formatCurrencyToBrl(sub.recurringCents)}</strong>{' '}
                    para{' '}
                    <strong>{formatCurrencyToBrl(newRecurringCents)}</strong>.
                  </p>
                  <p className="mt-1">
                    O novo valor vale para as mensalidades ainda não pagas,
                    inclusive a que já foi gerada e ainda não venceu. Cobrança
                    vencida ou já paga não muda.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                  Todos os usuários adicionais estão em uso. Desative usuários
                  em{' '}
                  <Link href={USERS_PAGE} className="font-medium underline">
                    Colaboradores e usuários
                  </Link>{' '}
                  e volte aqui para reduzir.
                </div>
              )}
            </>
          )}
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div />
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="error"
              onClick={submit}
              isLoading={submitting}
              disabled={
                submitting ||
                !sub ||
                blockedByCycle ||
                !canReduce ||
                removed <= 0
              }
            >
              Reduzir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
