'use client'

// React
import { useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'

// Components
import { EditItemDialog } from './EditItem'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconPencil, IconSettings, IconTrash } from '@tabler/icons-react'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Actions
import { deleteItemNew, getData } from '@/actions/_cruds'

// Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Types
import {
  hasRate,
  isSystemItem,
  payrollBehaviorLabel,
  type PayrollBehavior,
  type PayrollTemplate,
} from '../../types'
import type { BadgeProps } from '@/components/ui/badge'

// Utils
import { floatToBrl } from '@/lib/utils'

const behaviorBadge: Record<PayrollBehavior, BadgeProps['variant']> = {
  ONLY_INCREASE: 'successLight',
  ONLY_DISCOUNT: 'errorLight',
  INCREASE_AND_DISCOUNT: 'blueLight',
  PROVISION: 'neutralLight',
  ADVANCE: 'warningLight',
}

// O salário base, com a marca do sistema ou reconhecido pelo nome
const isBaseItem = (item: PayrollTemplate) =>
  item.isBase || item.systemKey === 'BASE_SALARY'

// Por que o item não sai: a base e os encargos são do sistema, e o item em
// uso precisa sair dos colaboradores antes
const deleteTooltip = (item: PayrollTemplate) =>
  isBaseItem(item)
    ? 'Item base da folha, não pode ser excluído'
    : isSystemItem(item)
      ? 'Este item faz parte da folha CLT'
      : item.linkedEmployees
        ? 'Remova o item de todos os colaboradores para excluir'
        : 'Excluir'

export function ManageItemsDialog() {
  const [open, setOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [rowData, setRowData] = useState<PayrollTemplate>()

  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['payroll-templates-list'],
    queryFn: () => getData({ route: '/financial/payroll-templates' }),
  })

  const templates: PayrollTemplate[] = Array.isArray(data?.data)
    ? data.data
    : []

  const handleDelete = async (item: PayrollTemplate) => {
    await alertDialog.open({
      title: 'Excluir item de custo',
      description: `O item "${item.name}" deixará de existir na folha de todos os colaboradores. Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      toastMsg: {
        loading: 'Excluindo item de custo...',
        success: 'Item de custo excluído!',
        error: 'Erro ao excluir item de custo',
      },
      onConfirm: async () => {
        const result = await deleteItemNew({
          route: `/financial/payroll-templates/${encodeURIComponent(item.id)}`,
        })

        if (!result.success) throw new Error(result.message)

        queryClient.invalidateQueries()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="neutralOutline" LeftIcon={IconSettings}>
          Gerenciar itens de custo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Gerenciar itens de custo</DialogTitle>
          <DialogDescription>
            Renomeie, troque o comportamento ou exclua os itens de custo da
            folha. Um item só pode ser excluído quando não estiver lançado em
            nenhum colaborador.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <TableSkeleton cols={3} />
          ) : !templates.length ? (
            <p className="py-6 text-center text-gray-400">
              Nenhum item de custo cadastrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-full">Referência</TableHead>
                  <TableHead>Comportamento</TableHead>
                  <TableHead className="whitespace-nowrap">Em uso</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-600">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isBaseItem(item) ? (
                          <Badge variant="neutralLight">Base</Badge>
                        ) : isSystemItem(item) ? (
                          <Badge variant="neutralLight">CLT</Badge>
                        ) : null}
                      </div>
                      {/* O INSS e o FGTS saem do salário por esta alíquota */}
                      {hasRate(item) && typeof item.rate === 'number' ? (
                        <p className="text-xs text-gray">
                          Alíquota de {floatToBrl(item.rate)}%
                        </p>
                      ) : item.fixedByLaw ? (
                        <p className="text-xs text-gray">
                          Percentual definido em lei
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={behaviorBadge[item.behavior] || 'neutralLight'}
                        className="whitespace-nowrap"
                      >
                        {payrollBehaviorLabel[item.behavior] || item.behavior}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-gray-600">
                      {item.linkedEmployees
                        ? `${item.linkedEmployees} colaborador${item.linkedEmployees > 1 ? 'es' : ''}`
                        : 'Ninguém'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <ActionButton
                            tooltip="Editar"
                            Icon={IconPencil}
                            onClick={() => {
                              setRowData(item)
                              setOpenEdit(true)
                            }}
                          />
                          {/* EC-21: excluir exige :delete. O diálogo inteiro
                              é aberto com :edit, e sem isto quem só edita
                              também excluía item de custo */}
                          <PermissionGate
                            permissions={['financial_settings:payroll:delete']}
                          >
                            <ActionButton
                              tooltip={deleteTooltip(item)}
                              variant="errorGhost"
                              Icon={IconTrash}
                              disabled={!item.canDelete}
                              onClick={() => handleDelete(item)}
                            />
                          </PermissionGate>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogBody>
      </DialogContent>
      <EditItemDialog open={openEdit} setOpen={setOpenEdit} rowData={rowData} />
    </Dialog>
  )
}
