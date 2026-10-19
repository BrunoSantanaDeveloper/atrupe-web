'use client'

// React
import { useState } from 'react'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { ClientHistoryDialog } from '../../components/ClientHistoryDialog'
import { SyncAsaasDialog } from '../../components/SyncAsaasDialog'
import { ResetDataDialog } from '../../components/ResetDataDialog'
import { DataResets } from './DataResets'

// UI
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Types
import type {
  AccountDetails as AccountDetailsData,
  AccountUsers,
} from '../../components/types'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { cn, formatCurrencyToBrl, maskCpfCnpj } from '@/lib/utils'
import { formatToCalendarDate, formatToLocaleDate } from '@/lib/formatDate'
import {
  ACCOUNT_STATUS,
  PAYMENT_STATUS,
  additionalUsersLabel,
  billingLabel,
  cycleLabel,
  isOverUserLimit,
  usersInUseLabel,
  valueSuffix,
} from '../../components/billing'
import { planVariants } from '../../components/Table/Data'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconEraser,
  IconExternalLink,
  IconHistory,
  IconRefresh,
  IconReportOff,
} from '@tabler/icons-react'

const CHANGE_LABELS: Record<string, string> = {
  CONTRACTED: 'Contratação',
  EVOLUTION_CONTRACTED: 'Evolução de plano',
  COMPLEMENTS_ADDED: 'Complementos',
  MODULE_REMOVED: 'Módulo retirado',
  PLAN_CHANGED_BY_ADMIN: 'Troca de plano pelo suporte',
  TRANSFER_RECEIVED: 'Transferência de titularidade',
}

/** O dia de hoje no fuso de Brasília, como AAAA-MM-DD. */
const todayInBrazil = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })

/** "3 do plano + 2 adicionais (R$ 15,00 cada/mês)". */
function usersComposition(users: AccountUsers) {
  const additional =
    users.additional > 0
      ? `${additionalUsersLabel(users.additional)} (${formatCurrencyToBrl(users.additionalUserPriceCents)} cada/mês)`
      : null
  if (users.included === null) {
    return ['Plano sem limite de usuários', additional]
      .filter(Boolean)
      .join(' · ')
  }
  return additional
    ? `${users.included} do plano + ${additional}`
    : `${users.included} do plano, sem adicionais`
}

/**
 * Detalhe de uma conta para a equipe de cobrança: o que a conta contratou
 * (plano, módulos e usuários adicionais), o que usa e o que já foi cobrado.
 */
export function AccountDetails({ companyId }: { companyId: string }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSyncOpen, setIsSyncOpen] = useState(false)
  const [isResetOpen, setIsResetOpen] = useState(false)

  // Mesmo prefixo da lista: "Verificar Asaas" atualiza a lista e o detalhe.
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['active-clients-list', 'details', companyId],
    queryFn: () =>
      getData({ route: `/subscriptions/active-clients/${companyId}/details` }),
  })

  const details = data?.success ? (data.data as AccountDetailsData) : null
  const account = details?.account
  const rowData = account
    ? { id: account.id, companyName: account.companyName }
    : null
  const today = todayInBrazil()

  return (
    <div className="space-y-5">
      <Topbar
        title={account?.companyName ?? (isLoading ? '' : 'Conta')}
        previousPage="/admin/clientes/gerenciar-contas"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
        primaryCta={
          account ? (
            <TooltipProvider>
              <div className="flex gap-1">
                <ActionButton
                  Icon={IconRefresh}
                  tooltip="Verificar Asaas"
                  variant="neutralLight"
                  onClick={() => setIsSyncOpen(true)}
                />
                <ActionButton
                  Icon={IconHistory}
                  tooltip="Histórico"
                  variant="neutralLight"
                  onClick={() => setIsHistoryOpen(true)}
                />
                <ActionButton
                  Icon={IconEraser}
                  tooltip="Zerar dados"
                  variant="errorLight"
                  onClick={() => setIsResetOpen(true)}
                />
              </div>
            </TooltipProvider>
          ) : undefined
        }
      />

      {isLoading ? (
        <Skeleton className="h-[calc(100vh-150px)]" />
      ) : !details || !account ? (
        <Card>
          <ListDataTotalEmpty
            icon={IconReportOff}
            title="Conta não encontrada"
            description={
              data?.message || 'Não foi possível carregar os dados da conta.'
            }
          />
        </Card>
      ) : (
        <>
          {/* Resumo da cobrança */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="Plano">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={planVariants[account.planType] ?? 'neutralLight'}
                  className="text-xs font-medium capitalize"
                >
                  {account.planType.toLowerCase()}
                </Badge>
                <Badge
                  variant={ACCOUNT_STATUS[account.status]?.variant}
                  className="text-xs"
                >
                  {ACCOUNT_STATUS[account.status]?.label ?? account.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {cycleLabel(account.cycle)} · contratado em{' '}
                {formatToLocaleDate(details.subscription.contractedAt)}
              </p>
            </SummaryCard>

            <SummaryCard title="Valor da renovação">
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrencyToBrl(account.valueCents)}
                <span className="text-sm font-normal text-gray-500">
                  {valueSuffix(account.cycle)}
                </span>
              </p>
              <p
                className={cn(
                  'text-sm',
                  account.billingMode === 'MANUAL'
                    ? 'font-medium text-warning-700'
                    : 'text-gray-600',
                )}
              >
                {billingLabel(account)}
              </p>
              {details.subscription.couponCode ? (
                <p className="text-xs text-gray-500">
                  Cupom {details.subscription.couponCode}
                </p>
              ) : null}
            </SummaryCard>

            <SummaryCard title="Usuários">
              <p
                className={cn(
                  'text-lg font-semibold',
                  isOverUserLimit(account.users)
                    ? 'text-error-700'
                    : 'text-gray-800',
                )}
              >
                {usersInUseLabel(account.users)}
              </p>
              <p className="text-sm text-gray-600">
                {usersComposition(account.users)}
              </p>
              {isOverUserLimit(account.users) ? (
                <p className="text-xs font-medium text-error-700">
                  Há mais usuários em uso do que o contratado.
                </p>
              ) : null}
            </SummaryCard>

            <SummaryCard title="Próxima cobrança">
              {account.billingMode === 'MANUAL' ? (
                <>
                  <p className="text-lg font-semibold text-warning-700">
                    Sem cobrança automática
                  </p>
                  <p className="text-sm text-gray-600">
                    Plano atribuído manualmente: o Asaas não cobra esta conta.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-800">
                    {account.nextChargeDate
                      ? formatToCalendarDate(account.nextChargeDate)
                      : '-'}
                  </p>
                  <Badge
                    variant={
                      account.hasOverdueCharge ? 'errorLight' : 'successLight'
                    }
                    className="text-xs"
                  >
                    {account.hasOverdueCharge ? 'Cobrança vencida' : 'Em dia'}
                  </Badge>
                </>
              )}
            </SummaryCard>
          </div>

          {/* Empresa */}
          <Section title="Empresa">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-6 pb-5 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Razão social">
                {details.company.legalName || '-'}
              </Field>
              <Field label="Nome fantasia">{details.company.name}</Field>
              <Field label="CNPJ">
                {account.document ? maskCpfCnpj(account.document) : '-'}
              </Field>
              <Field label="Titular (Usuário nº 1)">
                {account.owner ? (
                  <>
                    <span className="block">{account.owner.name}</span>
                    <span className="block text-gray-600">
                      {account.owner.email}
                    </span>
                    {account.owner.phone ? (
                      <span className="block text-gray-600">
                        {account.owner.phone}
                      </span>
                    ) : null}
                  </>
                ) : (
                  '-'
                )}
              </Field>
              <Field label="Contato da empresa">
                <span className="block">{details.company.email || '-'}</span>
                {details.company.phone ? (
                  <span className="block text-gray-600">
                    {details.company.phone}
                  </span>
                ) : null}
              </Field>
              <Field label="Cidade / UF">
                {[account.city?.name, account.state?.name]
                  .filter(Boolean)
                  .join(' / ') || '-'}
              </Field>
              <Field label="Conta criada em">
                {formatToLocaleDate(details.company.createdAt)}
              </Field>
              {details.company.blockedAt ? (
                <Field label="Bloqueada em">
                  {formatToLocaleDate(details.company.blockedAt)}
                  {details.company.blockReason
                    ? ` · ${details.company.blockReason}`
                    : ''}
                </Field>
              ) : null}
            </dl>
          </Section>

          {/* Módulos */}
          <Section
            title="Módulos contratados"
            description={
              account.modules.length
                ? `Total: ${formatCurrencyToBrl(account.modules.reduce((sum, module) => sum + module.priceCents, 0))}/mês, no preço travado na contratação.`
                : undefined
            }
          >
            {account.modules.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Módulo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Na assinatura desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.modules.map((module) => (
                    <TableRow key={module.key}>
                      <TableCell className="font-medium text-gray-800">
                        {module.name}
                      </TableCell>
                      <TableCell>
                        {formatCurrencyToBrl(module.priceCents)}/mês
                      </TableCell>
                      <TableCell>{formatToLocaleDate(module.since)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-5 text-sm text-gray-600">
                Nenhum módulo contratado.
              </p>
            )}
          </Section>

          {/* Usuários */}
          <Section
            title={`Usuários em uso (${details.users.length})`}
            description={usersComposition(account.users)}
          >
            {details.users.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Último acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {user.name}
                          </span>
                          {user.isOwner ? (
                            <Badge variant="orangeLight" className="text-xs">
                              Titular
                            </Badge>
                          ) : null}
                          {user.isAdmin ? (
                            <Badge variant="neutralLight" className="text-xs">
                              Administrador
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role || '-'}</TableCell>
                      <TableCell>
                        {user.lastAccessAt
                          ? formatToLocaleDate(user.lastAccessAt)
                          : 'Nunca acessou'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-5 text-sm text-gray-600">
                Nenhum usuário com acesso ativo.
              </p>
            )}
          </Section>

          {/* Cobranças */}
          <Section
            title="Últimas cobranças"
            description="As 12 mais recentes registradas no sistema. Para conferir com o Asaas, use Verificar Asaas."
          >
            {details.payments.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Pago em</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.payments.map((payment) => {
                    const overdue =
                      payment.status === 'OVERDUE' ||
                      (payment.status === 'PENDING' &&
                        payment.dueDate.slice(0, 10) < today)
                    const status = overdue
                      ? PAYMENT_STATUS.OVERDUE
                      : PAYMENT_STATUS[payment.status]
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatToCalendarDate(payment.dueDate)}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {payment.description || '-'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatCurrencyToBrl(payment.valueCents)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status?.variant ?? 'neutralLight'}
                            className="text-xs"
                          >
                            {status?.label ?? payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.paidAt
                            ? formatToCalendarDate(payment.paidAt)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.invoiceUrl ? (
                            <a
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
                            >
                              Fatura
                              <IconExternalLink size={14} />
                            </a>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-5 text-sm text-gray-600">
                Nenhuma cobrança registrada.
              </p>
            )}
          </Section>

          {/* Mudanças de plano e complementos */}
          <Section
            title="Mudanças de plano e complementos"
            description="O que mudou no que a conta paga. O histórico completo fica em Histórico."
          >
            {details.changes.length ? (
              <ul className="divide-y divide-gray-100 px-6 pb-5">
                {details.changes.map((change) => (
                  <li key={change.id} className="py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutralLight" className="text-xs">
                        {CHANGE_LABELS[change.action] ?? change.action}
                      </Badge>
                      <span className="text-gray-500">
                        {formatToLocaleDate(change.createdAt)}
                        {change.createdByName
                          ? ` · ${change.createdByName}`
                          : ''}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700">{change.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 pb-5 text-sm text-gray-600">
                Nenhuma mudança registrada.
              </p>
            )}
          </Section>

          <DataResets companyId={companyId} />
        </>
      )}

      <SyncAsaasDialog
        open={isSyncOpen}
        setOpen={setIsSyncOpen}
        rowData={rowData}
      />
      <ClientHistoryDialog
        open={isHistoryOpen}
        setOpen={setIsHistoryOpen}
        rowData={rowData}
      />
      <ResetDataDialog
        open={isResetOpen}
        setOpen={setIsResetOpen}
        rowData={rowData}
      />
    </div>
  )
}

function SummaryCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-sm text-gray-500">{title}</p>
        {children}
      </CardContent>
    </Card>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-700">{title}</CardTitle>
        {description ? (
          <p className="text-sm text-gray-600">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1 text-gray-800">{children}</dd>
    </div>
  )
}
