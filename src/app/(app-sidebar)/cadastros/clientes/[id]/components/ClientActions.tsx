'use client'

// Components
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconCirclePlus, IconCircleMinus } from '@tabler/icons-react'

// Types
import type { ClientInfoType } from '@/types/cadastros/client'

// Lib
import { updateItemNew } from '@/actions/_cruds'

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

  const status = data?.status

  // Ativar ou inativar cadastro
  const handleActiveToggle = async (type: 'active' | 'inactive') => {
    await alertDialog.open({
      title: `Deseja ${type === 'active' ? 'ativar' : 'inativar'} o cadastro?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: type === 'active' ? 'success' : 'error',
      confirmLabel: type === 'active' ? 'Ativar' : 'Inativar',
      onConfirm: async () => {
        const res = await updateItemNew({
          route: `/${entityType}/${params.id}/toggle-status`,
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
    <PermissionGate permissions={['register:client:edit']}>
      <div className="flex items-center gap-4">
        {/* <TooltipProvider>
          <ActionButton
            tooltip="Atualizar cadastro automaticamente"
            size="iconMd"
            variant="neutralOutline"
            Icon={IconReload}
            // link={`#`}
            // onClick={() => {}}
          />
          <ActionButton
            tooltip="Editar cadastro"
            size="iconMd"
            variant="neutralOutline"
            Icon={IconPencil}
            // link={`#`}
            // onClick={() => {}}
          />
        </TooltipProvider> */}

        <PermissionGate permissions={[`register:${entityType}:delete`]}>
          {(status === 'ACTIVE' || status === 'PROSPECT') && (
            <Button
              variant="error"
              LeftIcon={IconCircleMinus}
              onClick={() => handleActiveToggle('inactive')}
            >
              Inativar cadastro
            </Button>
          )}

          {status === 'INACTIVE' && (
            <Button
              variant="success"
              LeftIcon={IconCirclePlus}
              onClick={() => handleActiveToggle('active')}
            >
              Ativar cadastro
            </Button>
          )}
        </PermissionGate>
        {/* <ToggleStatusModal
          id={params.id}
          open={isToggleModalOpen === 'active'}
          setOpen={setIsToggleModalOpen}
          entityType={entityType}
          type="active"
          onSuccess={() => {}}
        />
        <ToggleStatusModal
          id={params.id}
          open={isToggleModalOpen === 'inactive'}
          setOpen={setIsToggleModalOpen}
          entityType={entityType}
          type="inactive"
          onSuccess={() => {}}
        /> */}
      </div>
    </PermissionGate>
  )
}
