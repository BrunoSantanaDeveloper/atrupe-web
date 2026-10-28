'use client'

// Components
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { ActivateClientDialog } from './ActivateClientDialog'
import { useAlertDialog } from '@/store/useAlertDialog'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconRestore, IconBan, IconArrowsExchange } from '@tabler/icons-react'

// Types
import type { ClientInfoType } from '@/types/cadastros/client'

// Lib
import { createItemNew, getItem, updateItemNew } from '@/actions/_cruds'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'
import { extractConditions } from '@/app/(app-sidebar)/cadastros/clientes/components/NewClient/utils/ExtractConditions'

interface Props {
  params: {
    id: string
    tab: string
  }
  data: ClientInfoType
  entityType: 'client' | 'supplier'
}

export function ClientActions({ params, data, entityType }: Props) {
  const alertDialog = useAlertDialog()

  const queryClient = useQueryClient()
  const { hasFinancialModule } = usePlanFeatures()
  const [activateOpen, setActivateOpen] = useState(false)

  const status = data?.status

  const isClient = entityType === 'client'
  const targetLabel = isClient ? 'fornecedor' : 'cliente'

  // Criar cadastro espelho (cliente → fornecedor ou vice-versa)
  const handleExchange = async () => {
    await alertDialog.open({
      title: `Cadastrar como ${targetLabel}?`,
      description: `Os dados deste ${isClient ? 'cliente' : 'fornecedor'} serão usados para criar um novo ${targetLabel}.`,
      cancelLabel: 'Cancelar',
      confirmLabel: `Criar ${targetLabel}`,
      onConfirm: async () => {
        const route = isClient
          ? `/client/${params.id}/convert-to-supplier`
          : `/supplier/${params.id}/convert-to-client`

        const res = await createItemNew({
          route,
          data: {},
        })

        if (!res.success) {
          throw new Error(res.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: 'Criando cadastro...',
        success: `${targetLabel.charAt(0).toUpperCase() + targetLabel.slice(1)} criado`,
        error: `Erro ao criar ${targetLabel}`,
      },
    })
  }

  // Cliente, com limite de crédito no plano: inativar desliga todas as formas
  // de pagamento dele, e ativar pede para escolhê-las de novo (27/10/2026)
  const turnsOffPayment = isClient && hasFinancialModule('credit_limit')

  const turnOffPaymentMethods = async () => {
    const client = await getItem({ route: `/client/${params.id}` })
    if (!client.success) throw new Error(client.message)
    const current = client.data?.creditLimit
    const conditions = extractConditions(current?.paymentMethods ?? []).map(
      (condition) => ({ ...condition, isActive: false }),
    )
    if (!conditions.length) return
    const res = await updateItemNew({
      route: `/client/${params.id}`,
      data: {
        creditLimit: {
          minValue: current?.minValue ?? 0,
          maxValue: current?.maxValue ?? 0,
          blockClient: current?.blockClient ?? false,
          conditions,
        },
      },
    })
    if (!res.success) throw new Error(res.message)
  }

  // Ativar ou inativar cadastro
  const handleActiveToggle = async (type: 'active' | 'inactive') => {
    await alertDialog.open({
      title: `Deseja ${type === 'active' ? 'ativar' : 'inativar'} o cadastro?`,
      description:
        type === 'inactive' && turnsOffPayment
          ? 'Todas as formas de pagamento deste cliente serão desligadas. Ao ativar de novo, você escolhe entre o padrão da empresa e a edição manual.'
          : '',
      cancelLabel: 'Cancelar',
      confirmVariant: type === 'active' ? 'success' : 'error',
      confirmLabel: type === 'active' ? 'Ativar' : 'Inativar',
      onConfirm: async () => {
        if (type === 'inactive' && turnsOffPayment) {
          await turnOffPaymentMethods()
        }
        const res = await updateItemNew({
          route: `/${entityType}/${params.id}/status`,
          data: {},
        })

        if (!res.success) {
          throw new Error(res.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        loading: `Aguarde...`,
        success: `Cadastro ${type === 'active' ? 'ativado' : 'inativado'}.`,
        error: `Erro ao ${type === 'active' ? 'ativar' : 'inativar'} cadastro`,
      },
    })
  }

  if (!params?.id) {
    return null
  }

  return (
    <PermissionGate permissions={[`register:${entityType}:edit`]}>
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <ActionButton
            tooltip={`Tornar ${isClient ? 'cliente' : 'fornecedor'} em ${targetLabel}`}
            size="iconMd"
            variant="neutralOutline"
            Icon={IconArrowsExchange}
            onClick={handleExchange}
          />
        </TooltipProvider>

        <PermissionGate permissions={[`register:${entityType}:delete`]}>
          {(status === 'ACTIVE' || status === 'PROSPECT') && (
            <Button
              variant="error"
              LeftIcon={IconBan}
              onClick={() => handleActiveToggle('inactive')}
            >
              Inativar cadastro
            </Button>
          )}

          {status === 'INACTIVE' && (
            <Button
              variant="success"
              LeftIcon={IconRestore}
              onClick={() =>
                // Cliente, com limite de crédito no plano: ativar exige
                // definir as formas de pagamento permitidas (24/10/2026)
                turnsOffPayment
                  ? setActivateOpen(true)
                  : handleActiveToggle('active')
              }
            >
              Ativar cadastro
            </Button>
          )}
        </PermissionGate>
      </div>
      {isClient && (
        <ActivateClientDialog
          open={activateOpen}
          onOpenChange={setActivateOpen}
          clientId={params.id}
          clientType={data?.type}
        />
      )}
    </PermissionGate>
  )
}
