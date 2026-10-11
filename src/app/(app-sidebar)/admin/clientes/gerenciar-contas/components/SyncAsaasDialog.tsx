'use client'

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, getData } from '@/actions/_cruds'

// Libs
import { formatToCalendarDate } from '@/lib/formatDate'

// Types
import type { AccountItem } from './Table/Data'

// Icons
import { IconRefresh, IconAlertTriangle, IconCheck } from '@tabler/icons-react'

/** Uma cobrança em que o sistema e o Asaas discordam — o que a sincronização alinha. */
interface ChargeDivergence {
  asaasPaymentId: string
  /** YYYY-MM-DD */
  dueDate: string
  value: number
  /** Nulo quando a cobrança só existe no Asaas. */
  localStatus: string | null
  /** REMOVED quando foi removida (ou não existe) no Asaas. */
  asaasStatus: string
  action: 'create' | 'update' | 'cancel'
}

interface AsaasCheckResult {
  found: boolean
  hasAsaasLink?: boolean
  hasPendingSync?: boolean
  message: string
  localStatus?: string
  asaasPaymentStatus?: string
  asaasPaymentId?: string
  asaasSubscriptionId?: string
  daysOverdue?: number
  overdueDueDate?: string
  subscription?: {
    id: string
    plan: string
  }
  divergences?: ChargeDivergence[]
}

interface ChargeSyncCounts {
  created: number
  updated: number
  canceled: number
}

const formatValue = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Status da cobrança, no vocabulário do sistema
const translateChargeStatus = (status?: string | null): string => {
  const translations: Record<string, string> = {
    PENDING: 'pendente',
    OVERDUE: 'atrasada',
    CONFIRMED: 'confirmada',
    RECEIVED: 'recebida',
    REFUNDED: 'estornada',
    CANCELED: 'cancelada',
    FAILED: 'com falha',
  }
  return translations[status || ''] || status || '-'
}

const describeDivergence = (d: ChargeDivergence): string => {
  if (d.action === 'cancel') {
    return `Removida no Asaas, ${translateChargeStatus(d.localStatus)} aqui → será baixada`
  }
  if (d.action === 'create') {
    return `Só no Asaas (${translateChargeStatus(d.asaasStatus)}) → será criada aqui`
  }
  return `${translateChargeStatus(d.localStatus)} aqui, ${translateChargeStatus(d.asaasStatus)} no Asaas → será atualizada`
}

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`

// Resultado da reavaliação de ativação e bloqueio que vale avisar
const SYNC_STATUS_MESSAGES: Record<string, string> = {
  unblocked: 'Empresa desbloqueada.',
  overdue: 'Segue com cobrança vencida no Asaas.',
  manually_deactivated: 'Assinatura inativada manualmente: não foi reativada.',
}

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: Pick<AccountItem, 'id' | 'companyName'> | null
}

// Tradução de status local
const translateLocalStatus = (status?: string): string => {
  const translations: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    BLOCKED: 'Bloqueado',
    PENDING: 'Pendente',
    CANCELED: 'Cancelado',
    EXPIRED: 'Expirado',
  }
  return translations[status || ''] || status || '-'
}

// Tradução de status do Asaas
const translateAsaasStatus = (status?: string): string => {
  const translations: Record<string, string> = {
    PENDING: 'Aguardando pagamento',
    CONFIRMED: 'Confirmado',
    RECEIVED: 'Recebido',
    RECEIVED_IN_CASH: 'Recebido em dinheiro',
    OVERDUE: 'Vencido',
    REFUNDED: 'Reembolsado',
    REFUND_REQUESTED: 'Reembolso solicitado',
  }
  return translations[status || ''] || status || '-'
}

export function SyncAsaasDialog({ open, setOpen, rowData }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [checkResult, setCheckResult] = useState<AsaasCheckResult | null>(null)

  const queryClient = useQueryClient()

  // Buscar status quando o dialog abre
  useEffect(() => {
    if (open && rowData?.id) {
      fetchAsaasStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rowData?.id])

  const fetchAsaasStatus = async () => {
    if (!rowData?.id) return

    setIsLoading(true)
    try {
      const res = await getData({
        route: `/subscriptions/active-clients/${rowData.id}/check-asaas`,
      })

      if (!res?.success) {
        toast.error(
          res?.message ||
            'Senha gerencial incorreta ou sessão encerrada. Entre de novo e tente outra vez.',
        )
        return
      }

      setCheckResult(res.data as AsaasCheckResult)
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao verificar status no Asaas'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!rowData?.id) return

    setIsSyncing(true)
    try {
      const res = await createItemNew({
        route: `/subscriptions/active-clients/${rowData.id}/sync-asaas`,
        data: {},
      })

      if (!res?.success) {
        toast.error(
          res?.message ||
            'Senha gerencial incorreta ou sessão encerrada. Entre de novo e tente outra vez.',
        )
        return
      }

      const charges = res.data?.charges as ChargeSyncCounts | undefined
      const aligned = [
        charges?.canceled
          ? plural(charges.canceled, 'baixada', 'baixadas')
          : null,
        charges?.updated
          ? plural(charges.updated, 'atualizada', 'atualizadas')
          : null,
        charges?.created ? plural(charges.created, 'criada', 'criadas') : null,
      ].filter(Boolean)
      const chargesSummary = aligned.length
        ? `Cobranças alinhadas ao Asaas: ${aligned.join(', ')}.`
        : null

      queryClient.invalidateQueries({ queryKey: ['active-clients-list'] })

      if (res.data?.status === 'activated') {
        toast.success(
          ['Subscription ativada com sucesso!', chargesSummary]
            .filter(Boolean)
            .join(' '),
        )
        handleOpenChange(false)
        return
      }

      const summary = [chargesSummary, SYNC_STATUS_MESSAGES[res.data?.status]]
        .filter(Boolean)
        .join(' ')
      if (summary) {
        toast.success(summary)
      } else {
        toast.info('Nada a alinhar: o sistema já estava igual ao Asaas.')
      }
      // Mostra o estado já alinhado
      await fetchAsaasStatus()
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro ao sincronizar com Asaas'
      toast.error(message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setCheckResult(null)
    }
    setOpen(value)
  }

  const showSyncOption = checkResult?.hasPendingSync

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant={
                  showSyncOption
                    ? 'warningBorderedLight'
                    : checkResult?.message.includes('inadimplente')
                      ? 'warningBorderedLight'
                      : 'successBorderedLight'
                }
                Icon={
                  showSyncOption
                    ? IconAlertTriangle
                    : checkResult?.message.includes('inadimplente')
                      ? IconAlertTriangle
                      : IconCheck
                }
                size="lg"
                rounded
                isLoading={isLoading}
              />
              <span>Verificação Asaas</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            {rowData?.companyName}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="mx-auto h-4 w-3/4" />
              <div className="space-y-2 rounded-lg border p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
          ) : checkResult ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-700 text-center">
                {checkResult.message}
              </p>

              {checkResult.found && checkResult.hasAsaasLink && (
                <div className="space-y-2 rounded-lg border p-3 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status Local:</span>
                    <Badge
                      variant={
                        checkResult.localStatus === 'ACTIVE'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {translateLocalStatus(checkResult.localStatus)}
                    </Badge>
                  </div>
                  {checkResult.asaasPaymentStatus && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status Asaas:</span>
                      <Badge
                        variant={
                          [
                            'CONFIRMED',
                            'RECEIVED',
                            'RECEIVED_IN_CASH',
                          ].includes(checkResult.asaasPaymentStatus)
                            ? 'success'
                            : 'neutral'
                        }
                      >
                        {translateAsaasStatus(checkResult.asaasPaymentStatus)}
                      </Badge>
                    </div>
                  )}
                  {checkResult.subscription?.plan && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Plano:</span>
                      <span className="font-medium">
                        {checkResult.subscription.plan}
                      </span>
                    </div>
                  )}
                  {checkResult.daysOverdue !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dias em atraso:</span>
                      <Badge variant="error">
                        {checkResult.daysOverdue} dia
                        {checkResult.daysOverdue !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                  {checkResult.overdueDueDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vencimento:</span>
                      <span className="font-medium text-error-600">
                        {formatToCalendarDate(checkResult.overdueDueDate)}
                      </span>
                    </div>
                  )}
                  {checkResult.asaasSubscriptionId && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ID Asaas:</span>
                      <span className="font-mono text-xs text-gray-500">
                        {checkResult.asaasSubscriptionId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!!checkResult.divergences?.length && (
                <div className="space-y-2 rounded-lg border border-warning-200 bg-warning-50 p-3">
                  <p className="text-sm font-medium text-gray-700">
                    {`Cobranças fora de sincronia (${checkResult.divergences.length})`}
                  </p>
                  <ul className="space-y-2">
                    {checkResult.divergences.map((divergence) => (
                      <li key={divergence.asaasPaymentId} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">
                            {formatToCalendarDate(divergence.dueDate)}
                          </span>
                          <span className="text-gray-600">
                            {formatValue(divergence.value)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {describeDivergence(divergence)}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500">
                    Depois de sincronizar, o cliente vê a mudança em até 5
                    minutos ou ao recarregar a página.
                  </p>
                </div>
              )}

              {!checkResult.found && (
                <p className="text-sm text-warning-600 text-center">
                  Não foi encontrada uma subscription válida para esta empresa.
                </p>
              )}

              {checkResult.found && !checkResult.hasAsaasLink && (
                <p className="text-sm text-warning-600 text-center">
                  Esta subscription foi criada manualmente e não pode ser
                  sincronizada com o Asaas.
                </p>
              )}
            </div>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Fechar
          </Button>
          {showSyncOption && (
            <Button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              RightIcon={IconRefresh}
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
