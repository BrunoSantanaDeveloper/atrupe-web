'use client'
// React
import { Fragment, useState } from 'react'

// Component Imports
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { useAlertDialog } from '@/store/useAlertDialog'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'

// Icons
import {
  IconPencil,
  IconAlertSquareRoundedOff,
  IconTrash,
} from '@tabler/icons-react'

// Actions
import { deleteItemNew, getData } from '@/actions/_cruds'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface CategoryType {
  id: string
  name: string
  kind: 'CLIENT' | 'SUPPLIER'
}

interface Props {
  context: 'client' | 'supplier'
}

export function Categories({ context }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<CategoryType>()

  const alertDialog = useAlertDialog()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: [`categories-${context}`],
    queryFn: () =>
      getData({
        route: '/category',
        filters: { kind: context === 'client' ? 'CLIENT' : 'SUPPLIER' },
      }),
  })

  const categories: CategoryType[] = data?.data || []
  const hasData = categories.length > 0

  const categoryLabel = context === 'client' ? 'clientes' : 'fornecedores'
  const previousPage =
    context === 'client' ? '/cadastros/clientes' : '/cadastros/fornecedores'

  const handleDelete = async (id: string) => {
    await alertDialog.open({
      title: `Deseja excluir o grupo?`,
      description: '',
      cancelLabel: 'Voltar',
      confirmVariant: 'error',
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        const res = await deleteItemNew({ route: `/category/${id}` })

        if (!res.success) {
          throw new Error(res.message)
        }

        queryClient.invalidateQueries()
      },
      toastMsg: {
        success: 'Grupo excluído com sucesso.',
        error: 'Erro ao excluir grupo',
      },
    })
  }

  return (
    <div className="space-y-5">
      <Topbar
        title={`Grupos de ${categoryLabel}`}
        previousPage={previousPage}
        primaryCta={<NewItemDialog context={context} />}
      />
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <TableSkeleton cols={2} />
          ) : !hasData ? (
            <ListDataTotalEmpty
              icon={IconAlertSquareRoundedOff}
              title="Nenhuma categoria cadastrada"
              description="Crie a primeira categoria"
              cta={<NewItemDialog context={context} />}
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Nome da categoria</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((item) => (
                      <Fragment key={item.id}>
                        <TableRow key={item?.id}>
                          <TableCell className="font-medium">
                            {item?.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <PermissionGate
                                  permissions={[
                                    context === 'client'
                                      ? 'clients:categories:edit'
                                      : 'suppliers:categories:edit',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconPencil}
                                    tooltip="Editar grupo"
                                    onClick={() => {
                                      setOpenDialog('edit')
                                      setRowData(item)
                                    }}
                                  />
                                  <ActionButton
                                    Icon={IconTrash}
                                    tooltip="Excluir grupo"
                                    onClick={() => handleDelete(item.id)}
                                  />
                                </PermissionGate>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <NewItemDialog
                editMode
                open={openDialog === 'edit'}
                setOpen={setOpenDialog}
                rowData={rowData}
                context={context}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
