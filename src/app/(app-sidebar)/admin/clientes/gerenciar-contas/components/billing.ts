// Types
import type { BadgeProps } from '@/components/ui/badge'
import type { ExportColumn } from '@/lib/export-excel'
import type { AccountBillingMode, AccountItem, AccountUsers } from './types'

// Libs
import { formatToCalendarDate, formatToLocaleDate } from '@/lib/formatDate'
import { maskCpfCnpj } from '@/lib/utils'

const CYCLE_LABELS: Record<string, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUALLY: 'Semestral',
  YEARLY: 'Anual',
}

export const cycleLabel = (cycle: string) => CYCLE_LABELS[cycle] ?? cycle

/** Cada renovação cobra o ciclo inteiro: o anual mostra o valor do ano. */
export function valueSuffix(cycle: string) {
  if (cycle === 'MONTHLY') return '/mês'
  if (cycle === 'YEARLY') return '/ano'
  return ` (${cycleLabel(cycle).toLowerCase()})`
}

const BILLING_MODE_LABELS: Record<AccountBillingMode, string> = {
  ASAAS_SUBSCRIPTION: 'Asaas',
  ASAAS_INSTALLMENT: 'Asaas, anual parcelado',
  MANUAL: 'Manual, sem cobrança automática',
  TRIAL: 'Teste',
}

export function billingLabel(
  account: Pick<AccountItem, 'billingMode' | 'installmentCount'>,
) {
  if (account.billingMode === 'ASAAS_INSTALLMENT' && account.installmentCount) {
    return `Asaas, anual em ${account.installmentCount}x`
  }
  return BILLING_MODE_LABELS[account.billingMode] ?? account.billingMode
}

export function isOverUserLimit(users: AccountUsers) {
  return users.limit !== null && users.inUse > users.limit
}

/** "4 de 5 usuários" ou, sem limite, "4 usuários · sem limite". */
export function usersInUseLabel(users: AccountUsers) {
  if (users.limit === null) {
    return `${users.inUse} ${users.inUse === 1 ? 'usuário' : 'usuários'} · sem limite`
  }
  return `${users.inUse} de ${users.limit} ${users.limit === 1 ? 'usuário' : 'usuários'}`
}

export function additionalUsersLabel(additional: number) {
  return additional === 1 ? '1 adicional' : `${additional} adicionais`
}

export const ACCOUNT_STATUS: Record<
  AccountItem['status'],
  { label: string; variant: BadgeProps['variant'] }
> = {
  ACTIVE: { label: 'Ativa', variant: 'successLight' },
  BLOCKED: { label: 'Bloqueada', variant: 'warningLight' },
  INACTIVE: { label: 'Inativa', variant: 'neutralLight' },
  CANCELED: { label: 'Cancelada', variant: 'errorLight' },
}

export const PAYMENT_STATUS: Record<
  string,
  { label: string; variant: BadgeProps['variant'] }
> = {
  PENDING: { label: 'Em aberto', variant: 'blueLight' },
  OVERDUE: { label: 'Vencida', variant: 'errorLight' },
  CONFIRMED: { label: 'Paga', variant: 'successLight' },
  RECEIVED: { label: 'Paga', variant: 'successLight' },
  REFUNDED: { label: 'Estornada', variant: 'warningLight' },
  CANCELED: { label: 'Cancelada', variant: 'neutralLight' },
  FAILED: { label: 'Falhou', variant: 'errorLight' },
}

const reais = (cents: number) => Math.round(cents) / 100

/**
 * A planilha da equipe de cobrança: uma linha por conta, com os valores em
 * número para somar na planilha.
 */
export const ACCOUNT_EXPORT_COLUMNS: ExportColumn<AccountItem>[] = [
  { header: 'Conta', key: 'companyName' },
  { header: 'Código', key: 'code' },
  { header: 'CNPJ', getValue: (account) => maskCpfCnpj(account.document) },
  {
    header: 'Situação',
    getValue: (account) =>
      ACCOUNT_STATUS[account.status]?.label ?? account.status,
  },
  {
    header: 'Titular',
    getValue: (account) => account.owner?.name ?? account.userName,
  },
  {
    header: 'E-mail do titular',
    getValue: (account) => account.owner?.email ?? account.email,
  },
  {
    header: 'Telefone',
    getValue: (account) => account.owner?.phone || account.phone,
  },
  { header: 'UF', getValue: (account) => account.state?.name },
  { header: 'Cidade', getValue: (account) => account.city?.name },
  { header: 'Plano', key: 'plan' },
  { header: 'Ciclo', getValue: (account) => cycleLabel(account.cycle) },
  { header: 'Cobrança', getValue: (account) => billingLabel(account) },
  {
    header: 'Valor da renovação (R$)',
    type: 'number',
    getValue: (account) => reais(account.valueCents),
  },
  {
    header: 'Módulos',
    getValue: (account) =>
      account.modules.map((module) => module.name).join(', '),
  },
  {
    header: 'Módulos (R$/mês)',
    type: 'number',
    getValue: (account) =>
      reais(
        account.modules.reduce((sum, module) => sum + module.priceCents, 0),
      ),
  },
  {
    header: 'Usuários do plano',
    getValue: (account) => account.users.included ?? 'Sem limite',
  },
  {
    header: 'Usuários adicionais',
    type: 'number',
    getValue: (account) => account.users.additional,
  },
  {
    header: 'Usuário adicional (R$/mês, preço atual do plano)',
    type: 'number',
    getValue: (account) => reais(account.users.additionalUserPriceCents),
  },
  {
    header: 'Usuários em uso',
    type: 'number',
    getValue: (account) => account.users.inUse,
  },
  {
    header: 'Acima do contratado',
    type: 'boolean',
    getValue: (account) => isOverUserLimit(account.users),
  },
  {
    header: 'Próximo vencimento',
    getValue: (account) =>
      account.nextChargeDate
        ? formatToCalendarDate(account.nextChargeDate)
        : '',
  },
  {
    header: 'Cobrança vencida',
    type: 'boolean',
    getValue: (account) => account.hasOverdueCharge,
  },
  {
    header: 'Assinatura desde',
    getValue: (account) => formatToLocaleDate(account.createdAt),
  },
]
