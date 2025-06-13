'use client'

// Components
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'
// import { TooltipProvider } from '@/components/ui/tooltip'
// import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconCirclePlus, IconCircleMinus } from '@tabler/icons-react'
import { updateItem } from '@/actions/_cruds'
import { ClientInfoType } from '@/types/cadastros/client'

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

  const isProspect = data?.addresses?.length === 0 && entityType === 'client'

  const mutation = useMutation({
    mutationFn: () =>
      updateItem(
        entityType === 'client' ? 'clientRoute' : 'supplierRoute',
        params.id,
        {
          status:
            status === 'ACTIVE' || status === 'PROSPECT'
              ? 'INACTIVE'
              : isProspect
                ? 'PROSPECT'
                : 'ACTIVE',
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          entityType === 'client'
            ? ['client-data', params.id]
            : ['supplier-data', params.id],
      })
      queryClient.invalidateQueries({
        queryKey:
          entityType === 'client' ? ['client-list', {}] : ['supplier-list', {}],
      })
    },
  })

  // Ativar ou inativar cadastro
  const handleActiveToggle = async (type: 'active' | 'inactive') => {
    await alertDialog.open({
      title: `Deseja ${type === 'active' ? 'ativar' : 'inativar'} o cadastro?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: type === 'active' ? 'success' : 'error',
      confirmLabel: type === 'active' ? 'Ativar' : 'Inativar',
      onConfirm: () => {
        mutation.mutate()
      },
      toastMsg: {
        loading: `Aguarde...`,
        success: `Cadastro ${type === 'active' ? 'ativado' : 'inativado'} com sucesso.`,
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
