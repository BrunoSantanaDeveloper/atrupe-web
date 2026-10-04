'use client'

// React
import { useState } from 'react'

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
import { ActionButton } from '@/components/common/ActionButton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { DeleteAlertDialog } from './Actions/Delete'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Icons
import { IconTrash, IconPencil, IconPlus } from '@tabler/icons-react'

// Hooks
import {
  useContactSources,
  type IContactSource,
} from '@/hooks/queries/useContactSources'

export function Main() {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<IContactSource>()

  const { data: contactSources, isLoading } = useContactSources()

  const companyOwned = contactSources?.filter((s) => s.companyId) ?? []
  const global = contactSources?.filter((s) => !s.companyId) ?? []

  const ActionButtons = ({ item }: { item: IContactSource }) => (
    <div className="flex justify-end gap-1">
      <TooltipProvider>
        <ActionButton
          Icon={IconPencil}
          tooltip="Editar"
          onClick={() => {
            setOpenDialog('edit')
            setRowData(item)
          }}
        />
        <ActionButton
          Icon={IconTrash}
          tooltip="Excluir"
          onClick={() => {
            setOpenDialog('delete')
            setRowData(item)
          }}
        />
      </TooltipProvider>
    </div>
  )

  return (
    <div className="space-y-5">
      <Topbar
        title="Origens de contato"
        previousPage="/configuracoes/vendas"
        primaryCta={
          <Button onClick={() => setOpenDialog('new')} LeftIcon={IconPlus}>
            Nova origem
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton cols={2} />
        ) : (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nome</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {global.length > 0 && (
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={2}
                      className="text-gray font-medium text-xs py-1"
                    >
                      Padrões do sistema
                    </TableCell>
                  </TableRow>
                )}
                {global.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-muted-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <ActionButtons item={item} />
                    </TableCell>
                  </TableRow>
                ))}

                {companyOwned.length > 0 && (
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={2}
                      className="text-gray font-medium text-xs py-1"
                    >
                      Personalizadas
                    </TableCell>
                  </TableRow>
                )}
                {companyOwned.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <ActionButtons item={item} />
                    </TableCell>
                  </TableRow>
                ))}

                {companyOwned.length === 0 && global.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-gray text-center">
                      Nenhuma origem cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      <NewItemDialog open={openDialog === 'new'} setOpen={setOpenDialog} />
      <NewItemDialog
        editMode
        open={openDialog === 'edit'}
        setOpen={setOpenDialog}
        rowData={rowData}
      />
      <DeleteAlertDialog
        open={openDialog === 'delete'}
        setOpen={setOpenDialog}
        rowData={rowData}
      />
    </div>
  )
}
