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
import { createItemNew, updateItemNew } from '@/actions/_cruds'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'

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

  // Ativar ou inativar cadastro
  const handleActiveToggle = async (type: 'active' | 'inactive') => {
    await alertDialog.open({
      title: `Deseja ${type === 'active' ? 'ativar' : 'inativar'} o cadastro?`,
      description: '',
      cancelLabel: 'Cancelar',
      confirmVariant: type === 'active' ? 'success' : 'error',
      confirmLabel: type === 'active' ? 'Ativar' : 'Inativar',
      onConfirm: async () => {
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
                isClient && hasFinancialModule('credit_limit')
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
        />
      )}
    </PermissionGate>
  )
}
