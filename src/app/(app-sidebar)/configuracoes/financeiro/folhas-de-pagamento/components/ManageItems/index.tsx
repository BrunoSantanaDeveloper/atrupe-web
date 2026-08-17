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

// Icons
import { IconPencil, IconSettings, IconTrash } from '@tabler/icons-react'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Actions
import { deleteItemNew, getData } from '@/actions/_cruds'

// Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Types
import type { PayrollTemplateType } from '@/types/settings/payroll'

export function ManageItemsDialog() {
  const [open, setOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [rowData, setRowData] = useState<PayrollTemplateType>()

  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['payroll-templates-list'],
    queryFn: () => getData({ route: '/financial/payroll-templates' }),
  })

  const templates: PayrollTemplateType[] = data?.data || []

  const handleDelete = async (item: PayrollTemplateType) => {
    await alertDialog.open({
      title: 'Excluir item de custo',
      description: `O item "${item.name}" deixará de existir na folha de todos os colaboradores. Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Voltar',
      confirmVariant: 'error',
      toastMsg: {
        loading: 'Excluindo item de custo...',
        success: 'Item de custo excluído!',
        error: 'Erro ao excluir item de custo',
      },
      onConfirm: async () => {
        const result = await deleteItemNew({
          route: `/financial/payroll-templates/${item.id}`,
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
            Renomeie ou exclua os itens de custo da folha. Um item só pode ser
            excluído quando não estiver lançado em nenhum colaborador.
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
                  <TableHead>Operação</TableHead>
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
                        {item.isBase ? (
                          <Badge variant="neutralLight">Base</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.type === 'DISCOUNT'
                            ? 'errorLight'
                            : 'successLight'
                        }
                      >
                        {item.type === 'DISCOUNT' ? 'Desconto' : 'Acréscimo'}
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
                          <ActionButton
                            tooltip={
                              item.isBase
                                ? 'Item base da folha, não pode ser excluído'
                                : item.linkedEmployees
                                  ? 'Remova o item de todos os colaboradores para excluir'
                                  : 'Excluir'
                            }
                            variant="errorGhost"
                            Icon={IconTrash}
                            disabled={!item.canDelete}
                            onClick={() => handleDelete(item)}
                          />
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
