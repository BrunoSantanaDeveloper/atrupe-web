'use client'

// A lista de processos (MS-11): cada processo é uma etapa produtiva de um
// setor, no mesmo formato da etapa da composição do produto. A categoria
// (acabamento, serviço de máquina, primário) sai do que o processo tem.

// React / Next
import { Fragment, useState } from 'react'

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
import { Topbar, type TabNavType } from '@/components/common/Topbar'
import { ProcessDialog, NewProcessTriggerButton } from './NewProcess'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getProcessList } from '@/actions/product-assembly'

// Hooks / Store / Consts
import { resourceKindObj } from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'
import { quantityModeObj } from '../../[id]/composicao/assembly'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconStack2, IconListCheck } from '@tabler/icons-react'

// Utils

export function Processes({ searchParams }: SearchParamsType) {
  // Os mesmos diálogos do produto: criar, editar e, depois de criar, reabrir
  // na Composição
  const [openDialog, setOpenDialog] = useState('')
  const [selectedId, setSelectedId] = useState('')
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

  // As abas no Topbar, como em Produtos
  const tabs: TabNavType[] = [
    {
      value: 'ativos',
      tab: 'ativos',
      label: 'Ativos',
      count: all.filter((item) => item.active).length,
    },
    {
      value: 'inativos',
      tab: 'inativos',
      label: 'Inativos',
      count: all.filter((item) => !item.active).length,
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Processos"
          tabs={tabs}
          activeTab={status}
          paramName="status"
          supportText="Etapas produtivas de cada setor, com os recursos e o tempo que usam"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewProcessTriggerButton
                onOpenChange={() => setOpenDialog('new-process')}
              />
            </PermissionGate>
          }
        />

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
                                        <ResourceKindLabel
                                          kind={kind}
                                          label={resourceKindObj[kind]}
                                        />
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
                                  {/* Como na linha do produto: a página
                                      da composição e o lápis do diálogo */}
                                  <ActionButton
                                    Icon={IconStack2}
                                    tooltip={`Composição de ${process.name}`}
                                    link={`/configuracoes/produtos/processos/${process.id}`}
                                  />
                                  <PermissionGate
                                    permissions={[
                                      'product_settings:products:edit',
                                    ]}
                                  >
                                    <NewProcessTriggerButton
                                      editMode
                                      onOpenChange={() => {
                                        setSelectedId(process.id)
                                        setOpenDialog('edit-process')
                                      }}
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
                acompanha o processo e pode ajustar só para ele
              </CardFooter>
            </>
          )}
        </Card>
      </div>

      <ProcessDialog
        open={openDialog === 'new-process'}
        onOpenChange={() => setOpenDialog('')}
        onCreated={(id) => {
          // Criou, reabre na Composição para montar as linhas (CP-16)
          setTimeout(() => {
            setSelectedId(id)
            setOpenDialog('compose-process')
          }, 300)
        }}
      />
      <ProcessDialog
        open={openDialog === 'edit-process' || openDialog === 'compose-process'}
        editMode
        processId={selectedId}
        initialTab={
          openDialog === 'compose-process' ? 'composition' : 'general'
        }
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog('')
            setSelectedId('')
          }
        }}
      />
    </TooltipProvider>
  )
}
