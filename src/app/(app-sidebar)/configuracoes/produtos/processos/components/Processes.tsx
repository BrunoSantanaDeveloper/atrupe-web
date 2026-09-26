'use client'

// A lista de processos (MS-11): cada processo é uma etapa produtiva de um
// setor, no mesmo formato da etapa da composição do produto. A categoria
// (acabamento, serviço de máquina, primário) sai do que o processo tem.

// React / Next
import { Fragment } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
import { getProcessList, updateProcessMeta } from '@/actions/product-assembly'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { resourceKindObj } from '@/consts/processes'
import { updateFilterParam } from '@/lib/filter-utils'
import { quantityModeObj } from '../../[id]/composicao/assembly'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconSearch,
  IconRestore,
  IconBan,
  IconListCheck,
} from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

type ProcessRow = NonNullable<
  Awaited<ReturnType<typeof getProcessList>>['data']
>[number]

const tabs = [
  { value: 'ativos', label: 'Ativos' },
  { value: 'inativos', label: 'Inativos' },
]

export function Processes({ searchParams }: SearchParamsType) {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  const { data, isLoading } = useQuery({
    queryKey: ['process-list'],
    queryFn: () => getProcessList(),
  })

  const status = searchParams?.status === 'inativos' ? 'inativos' : 'ativos'
  const all = data?.data || []
  const processes = all.filter((item) =>
    status === 'ativos' ? item.active : !item.active,
  )
  const sectors = Array.from(new Set(processes.map((item) => item.sector)))

  // Processo usado em produto é inativado, não excluído (regra geral)
  const toggleActive = (process: ProcessRow) =>
    alertDialog.open({
      title: process.active
        ? `Inativar ${process.name}?`
        : `Reativar ${process.name}?`,
      description: process.active
        ? `Ele deixa de aparecer para escolher nas composições.${
            process.usedIn
              ? ` Os ${process.usedIn} produtos que já o usam continuam como estão.`
              : ''
          }`
        : 'Ele volta a aparecer nas listas de escolha.',
      confirmLabel: process.active ? 'Inativar' : 'Reativar',
      cancelLabel: 'Cancelar',
      confirmVariant: process.active ? 'error' : 'primary',
      onConfirm: async () => {
        const res = await updateProcessMeta({
          processId: process.id,
          values: { active: !process.active },
        })
        if (!res.success) throw new Error(res.message)
        await queryClient.invalidateQueries({ queryKey: ['process-list'] })
      },
      toastMsg: {
        success: process.active ? 'Processo inativado' : 'Processo reativado',
        error: 'Não foi possível alterar o processo',
      },
    })

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Processos"
          supportText="Etapas produtivas de cada setor, com os recursos e o tempo que usam"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewProcessModal
                onCreated={(id) =>
                  router.push(`/configuracoes/produtos/processos/${id}`)
                }
              />
            </PermissionGate>
          }
        />

        <div className="flex gap-2">
          {tabs.map((tab) => {
            const count = all.filter((item) =>
              tab.value === 'ativos' ? item.active : !item.active,
            ).length
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  updateFilterParam(
                    'status',
                    tab.value === 'ativos' ? 'all' : tab.value,
                    { router, params },
                  )
                }
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium',
                  status === tab.value
                    ? 'border-brand-600 text-gray-900'
                    : 'border-transparent text-gray hover:text-gray-700',
                )}
              >
                {tab.label}
                <Badge
                  variant={
                    status === tab.value ? 'successLight' : 'neutralLight'
                  }
                >
                  {count}
                </Badge>
              </button>
            )
          })}
        </div>

        <Card>
          {isLoading ? (
            <TableSkeleton cols={6} rows={6} />
          ) : !processes.length ? (
            <ListDataTotalEmpty
              icon={IconListCheck}
              title={
                status === 'ativos'
                  ? 'Nenhum processo ativo'
                  : 'Nenhum processo inativo'
              }
              description="O processo é a etapa de um setor que se repete em vários produtos: a impressão, a bainha, o ilhós."
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[960px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[28%] min-w-[220px]">
                        Processo
                      </TableHead>
                      <TableHead className="w-[24%]">Na venda</TableHead>
                      <TableHead className="w-[22%]">Recursos</TableHead>
                      <TableHead className="w-[10%]">Tarefa</TableHead>
                      <TableHead className="w-[10%] text-right">
                        Usado em
                      </TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectors.map((sector) => (
                      <Fragment key={sector}>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={6}>
                            <span className="font-medium">{sector}</span>
                          </TableCell>
                        </TableRow>
                        {processes
                          .filter((item) => item.sector === sector)
                          .map((process) => (
                            <TableRow key={process.id}>
                              <TableCell>
                                <p className="font-medium">{process.name}</p>
                                <p className="text-sm text-gray">
                                  {process.category}
                                </p>
                                {process.incomplete && (
                                  <Badge
                                    variant="warningLight"
                                    className="mt-1"
                                  >
                                    Há linhas sem recurso
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-gray-700">
                                {quantityModeObj[process.rules.quantityMode]}
                                <span className="block text-gray">
                                  {process.rules.followsBase
                                    ? 'acompanha a quantidade da base'
                                    : 'uma vez por pedido'}
                                  {process.rules.extraField !== 'NONE'
                                    ? ` · ${process.rules.extraFieldName}`
                                    : ''}
                                </span>
                              </TableCell>
                              <TableCell>
                                {process.kinds.length ? (
                                  <div className="flex flex-wrap gap-1">
                                    {process.kinds.map((kind) => (
                                      <Badge key={kind} variant="neutralLight">
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
                              <TableCell className="text-sm text-gray-700">
                                {process.taskType}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-right text-sm text-gray-700">
                                {process.usedIn
                                  ? `${process.usedIn} ${process.usedIn === 1 ? 'produto' : 'produtos'}`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <ActionButton
                                    Icon={IconSearch}
                                    tooltip={`Abrir ${process.name}`}
                                    link={`/configuracoes/produtos/processos/${process.id}`}
                                  />
                                  <PermissionGate
                                    permissions={[
                                      'product_settings:products:edit',
                                    ]}
                                  >
                                    <ActionButton
                                      Icon={
                                        process.active ? IconBan : IconRestore
                                      }
                                      variant={
                                        process.active
                                          ? 'errorGhost'
                                          : 'neutralGhost'
                                      }
                                      tooltip={
                                        process.active
                                          ? `Inativar ${process.name}`
                                          : `Reativar ${process.name}`
                                      }
                                      onClick={() => toggleActive(process)}
                                    />
                                  </PermissionGate>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                {processes.length}{' '}
                {processes.length === 1 ? 'processo' : 'processos'} · o produto
                copia o processo ao incluí-lo, e pode ajustar a cópia
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
