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

// Types
import type { AccountItem } from './Table/Data'

// Icons
import { IconRefresh, IconAlertTriangle, IconCheck } from '@tabler/icons-react'

interface AsaasCheckResult {
  found: boolean
  hasAsaasLink?: boolean
  hasPendingSync?: boolean
  message: string
  localStatus?: string
  asaasPaymentStatus?: string
  asaasPaymentId?: string
  asaasSubscriptionId?: string
  subscription?: {
    id: string
    plan: string
  }
}

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

// Tradução de status local
const translateLocalStatus = (status?: string): string => {
  const translations: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    BLOCKED: 'Bloqueado',
    PENDING: 'Pendente',
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

      if (!res.success) {
        toast.error(res.message)
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

      if (!res.success) {
        toast.error(res.message)
        return
      }

      if (res.data?.status === 'activated') {
        toast.success('Subscription ativada com sucesso!')
        queryClient.invalidateQueries({ queryKey: ['active-clients-list'] })
        handleOpenChange(false)
      } else {
        toast.info(`Resultado: ${res.data?.status || 'desconhecido'}`)
      }
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
