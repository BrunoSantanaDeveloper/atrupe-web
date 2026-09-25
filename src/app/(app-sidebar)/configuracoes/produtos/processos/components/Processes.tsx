'use client'

// React / Next
import { Fragment } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewProcessModal } from './NewProcess'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getProcesses, setProcessActive } from '@/actions/processes'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { dimensionRuleObj, resourceKindObj } from '@/consts/processes'

// Types
import type { Process } from '../types'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconBan,
  IconEye,
  IconListCheck,
  IconPlayerPlay,
} from '@tabler/icons-react'

export function Processes({ searchParams }: SearchParamsType) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['processes', searchParams],
    queryFn: () => getProcesses({ filters: searchParams }),
  })

  const processes = data?.data || []

  // Processo usado em composição é inativado, não excluído
  const toggleActive = (process: Process) =>
    alertDialog.open({
      title: process.active
        ? `Inativar ${process.name}?`
        : `Reativar ${process.name}?`,
      description: process.active
        ? 'Ele deixa de aparecer para escolher nas composições. Os produtos que já o usam continuam como estão.'
        : 'Ele volta a aparecer nas listas de escolha.',
      confirmLabel: process.active ? 'Inativar' : 'Reativar',
      onConfirm: async () => {
        const response = await setProcessActive({
          id: process.id,
          active: !process.active,
        })

        if (!response.success) {
          toast.error(response.message)

          return
        }

        toast.success(
          process.active ? 'Processo inativado' : 'Processo reativado',
        )
        queryClient.invalidateQueries({ queryKey: ['processes'] })
      },
    })
  const sectors = Array.from(
    new Set(processes.map((process) => process.sector)),
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Processos"
          supportText="Etapas produtivas com máquina, material, mão de obra e terceirizado"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewProcessModal />
            </PermissionGate>
          }
        />
        <Card>
          {isLoading ? (
            <TableSkeleton cols={5} rows={6} />
          ) : !processes.length ? (
            <ListDataTotalEmpty
              icon={IconListCheck}
              title="Nenhum processo criado"
              description="Crie o primeiro processo para compor seus produtos"
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[880px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[28%] min-w-[200px]">
                        Processo
                      </TableHead>
                      <TableHead className="w-[22%]">Dimensão</TableHead>
                      <TableHead className="w-[30%]">Recursos</TableHead>
                      <TableHead className="w-[14%]">Campos extras</TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <Fragment key={sector}>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={5}>
                            <span className="font-medium">{sector}</span>
                          </TableCell>
                        </TableRow>
                        {processes
                          .filter((process) => process.sector === sector)
                          .map((process) => {
                            const kinds = Array.from(
                              new Set(
                                process.resources.map(
                                  (resource) => resource.kind,
                                ),
                              ),
                            )

                            return (
                              <TableRow key={process.id}>
                                <TableCell>
                                  <p className="font-medium">{process.name}</p>
                                  <p className="text-sm text-gray">
                                    {process.multipliesParent
                                      ? 'Acompanha a quantidade da base'
                                      : 'Uma vez por pedido'}
                                  </p>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {dimensionRuleObj[process.dimensionRule]}
                                </TableCell>
                                <TableCell>
                                  {kinds.length ? (
                                    <div className="flex flex-wrap gap-1">
                                      {kinds.map((kind) => (
                                        <Badge
                                          key={kind}
                                          variant="neutralLight"
                                        >
                                          {resourceKindObj[kind]}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray">
                                      sem recursos
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-gray">
                                  {process.extraFields.length
                                    ? process.extraFields
                                        .map((field) => field.name)
                                        .join(', ')
                                    : '-'}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <ActionButton
                                      Icon={IconEye}
                                      tooltip={`Abrir ${process.name}`}
                                      link={`/configuracoes/produtos/processos/${process.id}`}
                                    />
                                    <NewProcessModal process={process} />
                                    <ActionButton
                                      Icon={
                                        process.active
                                          ? IconBan
                                          : IconPlayerPlay
                                      }
                                      tooltip={
                                        process.active
                                          ? `Inativar ${process.name}`
                                          : `Reativar ${process.name}`
                                      }
                                      onClick={() => toggleActive(process)}
                                    />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                {processes.length}{' '}
                {processes.length === 1 ? 'processo' : 'processos'} · o processo
                é usado nos produtos e pode ser acrescentado direto no orçamento
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
