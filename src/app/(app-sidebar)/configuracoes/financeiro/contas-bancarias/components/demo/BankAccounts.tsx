'use client'

// PROVISÓRIO nos dados: a tela lê `src/actions/cash-accounts.ts`. A API já tem
// o cadastro de contas, mas não o tipo da conta nem a conta padrão por forma.
//
// Contas bancárias — regras CX-0 a CX-2 (área 12). A pergunta que a tela
// responde primeiro: onde está o dinheiro da empresa, e quais contas têm
// controle de caixa.

// React
import { useState } from 'react'

// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { AccountDialog } from './AccountDialog'
import { AccountIcon } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/components/demo/AccountIcon'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import {
  accountKindLabel,
  type BankAccount,
} from '@/app/(app-sidebar)/financeiro/controle-de-caixa/types'

// Actions
import {
  getBankAccounts,
  getPaymentMethods,
  removeBankAccount,
  reactivateBankAccount,
} from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import {
  IconEye,
  IconTrash,
  IconEyeOff,
  IconPencil,
  IconRestore,
  IconArrowRight,
} from '@tabler/icons-react'

// Consts
import { bankAccountStatusObj } from '@/consts/cashAccounts'

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Utils
import { cn } from '@/lib/utils'

export function BankAccounts(_: SearchParamsType) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  const [editing, setEditing] = useState<BankAccount>()
  const [dialogOpen, setDialogOpen] = useState(false)
  // Os saldos ficam escondidos até alguém pedir, como no Fluxo financeiro:
  // valor grande à vista na tela é informação para quem passa por ela
  const [showTotals, setShowTotals] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => getBankAccounts(),
  })
  const { data: methodsRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['payment-methods'],
    queryFn: () => getPaymentMethods(),
  })

  const accounts = data?.data || []
  const methods = methodsRes?.data || []
  const active = accounts.filter((account) => account.isActive)
  const inactive = accounts.filter((account) => !account.isActive)
  const total = active.reduce((sum, account) => sum + account.balance, 0)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }),
      queryClient.invalidateQueries({ queryKey: ['cash-control'] }),
    ])

  const openDialog = (account?: BankAccount) => {
    setEditing(account)
    setDialogOpen(true)
  }

  // Um botão só: o sistema decide se exclui ou inativa (CX-2)
  const remove = (account: BankAccount) =>
    alertDialog.open({
      title: account.hasHistory
        ? `Inativar ${account.name}?`
        : `Excluir ${account.name}?`,
      description: account.hasHistory
        ? 'A conta tem lançamentos, então ela não é apagada: fica inativa, com o histórico guardado, e deixa de aparecer para receber e pagar. Dá para reativar depois.'
        : 'A conta não tem nenhum lançamento e será excluída.',
      confirmLabel: account.hasHistory ? 'Inativar' : 'Excluir',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await removeBankAccount(account.id)
        if (!res.success) throw new Error(res.message)
        await refresh()
      },
      toastMsg: {
        success: account.hasHistory ? 'Conta inativada' : 'Conta excluída',
        error: 'Não foi possível remover a conta',
      },
    })

  const reactivate = async (account: BankAccount) => {
    await reactivateBankAccount(account.id)
    await refresh()
    toast.success('Conta reativada')
  }

  const row = (account: BankAccount) => {
    const receives = account.rules.filter((rule) => rule.acceptIncomes)
    const status =
      bankAccountStatusObj[
        !account.isActive
          ? 'INACTIVE'
          : account.cashControl
            ? 'CONTROLLED'
            : 'FREE'
      ]

    return (
      <div
        key={account.id}
        className={cn(
          'flex flex-col gap-4 border-b border-gray-200 px-6 py-5 last:border-0 md:flex-row md:items-center',
          !account.isActive && 'opacity-60',
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <AccountIcon icon={account.bankIcon} />
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-gray-800">{account.name}</p>
              <Badge variant="neutralLight">
                {accountKindLabel[account.kind]}
              </Badge>
              <Badge variant={status.variant}>{status.text}</Badge>
            </div>
            <p className="text-sm text-gray">
              {account.kind === 'BANK'
                ? account.bankName
                : account.kind === 'CARD'
                  ? `${account.bankName} · o que a operadora ainda deve, pelo valor cheio`
                  : 'Dinheiro em espécie'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {receives.length ? (
                receives.map((rule) => (
                  <span
                    key={rule.methodId}
                    className={cn(
                      'rounded-md border px-2 py-0.5 text-xs',
                      rule.isDefault
                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600',
                    )}
                    title={
                      rule.isDefault
                        ? 'Conta padrão para receber nesta forma'
                        : undefined
                    }
                  >
                    {rule.methodName}
                    {rule.isDefault ? ' · padrão' : ''}
                    {rule.incomeType === 'PROVISION' ? ' · provisiona' : ''}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray">
                  Não recebe em nenhuma forma
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          {showTotals && (
            <div className="md:text-right">
              <p className="text-xs text-gray">Saldo</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  account.balance < 0 ? 'text-error-600' : 'text-gray-900',
                )}
              >
                {money(account.balance)}
              </p>
            </div>
          )}
          <div className="flex gap-1">
            {account.isActive ? (
              <>
                <PermissionGate
                  permissions={['financial_settings:bank_accounts:edit']}
                >
                  <ActionButton
                    Icon={IconPencil}
                    variant="neutralGhost"
                    tooltip="Editar"
                    onClick={() => openDialog(account)}
                  />
                </PermissionGate>
                <PermissionGate
                  permissions={['financial_settings:bank_accounts:delete']}
                >
                  <ActionButton
                    Icon={IconTrash}
                    variant="errorGhost"
                    tooltip={
                      account.hasHistory ? 'Inativar conta' : 'Excluir conta'
                    }
                    onClick={() => remove(account)}
                  />
                </PermissionGate>
              </>
            ) : (
              <PermissionGate
                permissions={['financial_settings:bank_accounts:edit']}
              >
                <ActionButton
                  Icon={IconRestore}
                  variant="neutralGhost"
                  tooltip="Reativar"
                  onClick={() => reactivate(account)}
                />
              </PermissionGate>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate permissions={['financial_settings:bank_accounts:view']}>
      <TooltipProvider>
        <div className="space-y-5" data-demo="true">
          <Topbar
            review="new"
            title="Contas bancárias"
            supportText="Onde o dinheiro da empresa fica"
            previousPage="/configuracoes/financeiro"
            primaryCta={
              <PermissionGate
                permissions={['financial_settings:bank_accounts:create']}
              >
                <Button type="button" onClick={() => openDialog()}>
                  Nova conta
                </Button>
              </PermissionGate>
            }
            secondaryCta={
              <PermissionGate permissions={['values:values:view']}>
                <ActionButton
                  size="iconMd"
                  variant="neutralOutline"
                  tooltip={showTotals ? 'Ocultar totais' : 'Mostrar totais'}
                  Icon={showTotals ? IconEyeOff : IconEye}
                  onClick={() => setShowTotals((current) => !current)}
                />
              </PermissionGate>
            }
          />

          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <>
              <Card>
                <CardContent className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
                  {/* Sem totais grandes à vista: o saldo aparece compacto,
                      atrás do "Mostrar totais" (padrão de 30/09/2026) */}
                  {showTotals && (
                    <p className="text-sm">
                      <span className="text-gray">
                        Saldo em todas as contas{' '}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {money(total)}
                      </span>
                    </p>
                  )}
                  {/* O princípio da tela em uma frase (CX-0) */}
                  <p className="max-w-xl text-sm text-gray">
                    Contas <strong>com controle de caixa</strong> abrem e fecham
                    todo dia. Contas <strong>livres</strong> recebem e pagam sem
                    abrir nem fechar — o saldo e o histórico são registrados do
                    mesmo jeito.{' '}
                    <Link
                      href="/financeiro/controle-de-caixa"
                      className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
                    >
                      Controle de caixa <IconArrowRight size={14} />
                    </Link>
                  </p>
                </CardContent>
              </Card>

              <Card>{active.map(row)}</Card>

              {inactive.length > 0 && (
                <div className="space-y-2">
                  <p className="px-1 text-sm font-medium text-gray">
                    Inativas · guardadas pelo histórico
                  </p>
                  <Card>{inactive.map(row)}</Card>
                </div>
              )}
            </>
          )}

          <AccountDialog
            open={dialogOpen}
            account={editing}
            accounts={accounts}
            methods={methods}
            onOpenChange={setDialogOpen}
            onSaved={refresh}
          />
        </div>
      </TooltipProvider>
    </PermissionGate>
  )
}
