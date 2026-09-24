'use client'

// React / Next
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewGroupModal } from './NewGroup'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Hooks / Store
import { useAlertDialog } from '@/store/useAlertDialog'

// Actions
import {
  getAssetGroups,
  renameAssetGroup,
  deleteAssetGroup,
} from '@/actions/assets'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCheck, IconPencil, IconTrash } from '@tabler/icons-react'

// Grupo de bens equivalentes: custo pela média, capacidade pela soma (P-28).
// Os de veículo vêm pré-cadastrados e são editáveis (P-13).
export function AssetGroups() {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [editing, setEditing] = useState<string>()
  const [name, setName] = useState('')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['asset-groups'],
    queryFn: () => getAssetGroups(),
  })

  // O grupo só agrupa: não tem histórico próprio, então pode ser excluído —
  // desde que nenhum bem esteja nele
  const remove = (group: { id: string; name: string }) =>
    alertDialog.open({
      title: `Excluir o grupo ${group.name}?`,
      description:
        'O grupo só reúne bens equivalentes e não guarda histórico. Os bens não são afetados.',
      confirmLabel: 'Excluir',
      confirmVariant: 'destructive',
      onConfirm: async () => {
        const response = await deleteAssetGroup({ id: group.id })

        if (!response.success) {
          toast.error(response.message)

          return
        }

        toast.success('Grupo excluído')
        queryClient.invalidateQueries({ queryKey: ['asset-groups'] })
      },
    })

  const { mutate: rename } = useMutation({
    mutationFn: () => renameAssetGroup({ id: editing || '', name }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Grupo renomeado')
      queryClient.invalidateQueries({ queryKey: ['asset-groups'] })
      setEditing(undefined)
    },
    onError: () => toast.error('Erro ao renomear o grupo'),
  })

  const groups = data?.data || []

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Grupos de bens equivalentes"
          previousPage="/configuracoes/empresa-e-sistema/patrimonios"
          supportText="Usados na composição quando não se sabe qual exemplar fará o serviço"
          primaryCta={
            <PermissionGate permissions={['cost:base:edit']}>
              <NewGroupModal />
            </PermissionGate>
          }
        />
        <Card>
          <CardHeader>
            <CardTitle>Grupos</CardTitle>
            <CardDescription>
              O grupo responde pela média do custo dos bens e pela soma da
              produtividade. Máquinas diferentes continuam sendo escolhidas uma
              a uma: o grupo é opcional.
            </CardDescription>
          </CardHeader>
          {isLoading ? (
            <TableSkeleton cols={5} rows={3} />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[32%] min-w-[200px]">
                        Grupo
                      </TableHead>
                      <TableHead className="w-[14%]">Setor</TableHead>
                      <TableHead className="w-[12%]">Unidade</TableHead>
                      <TableHead className="w-[12%] text-right">Bens</TableHead>
                      <TableHead className="w-[16%] text-right">
                        Custo médio
                      </TableHead>
                      <TableHead className="w-[16%] text-right">
                        Produtividade somada
                      </TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          {editing === group.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={name}
                                aria-label={`Novo nome de ${group.name}`}
                                onChange={(event) =>
                                  setName(event.target.value)
                                }
                              />
                              <Button
                                size="sm"
                                LeftIcon={IconCheck}
                                onClick={() => rename()}
                              >
                                Salvar
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium">{group.name}</span>
                          )}
                        </TableCell>
                        <TableCell>{group.sector}</TableCell>
                        <TableCell>{assetUnitShort[group.unit]}</TableCell>
                        <TableCell className="text-right">
                          {group.assetCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {group.averageCost === null
                            ? '-'
                            : formatCurrencyToBrl(group.averageCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {group.totalProductivity
                            ? `${group.totalProductivity} ${assetUnitShort[group.unit]}/mês`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <PermissionGate permissions={['cost:base:edit']}>
                              <ActionButton
                                Icon={IconPencil}
                                tooltip={`Renomear ${group.name}`}
                                onClick={() => {
                                  setEditing(group.id)
                                  setName(group.name)
                                }}
                              />
                              <ActionButton
                                Icon={IconTrash}
                                tooltip={`Excluir ${group.name}`}
                                onClick={() => remove(group)}
                              />
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                Grupo sem nenhum bem não gera custo: as composições que
                dependerem dele ficam sem o custo da máquina.
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
