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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { AddResourceModal } from './AddResourceModal'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { ProcessSimulation } from '../../types'

// Actions
import {
  getProcess,
  updateProcess,
  removeProcessResource,
} from '@/actions/processes'

// Hooks / Store / Consts
import { resourceCost } from '@/lib/process-calc'

import {
  formulaObj,
  resourceKindObj,
  dimensionRuleObj,
} from '@/consts/processes'

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconTrash } from '@tabler/icons-react'

interface Props {
  id: string
}

export function ProcessDetail({ id }: Props) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const [instructions, setInstructions] = useState<string | null>(null)
  const [simulation, setSimulation] = useState<ProcessSimulation>({
    width: 1,
    height: 1,
    quantity: 1,
    extras: {},
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['process', id],
    queryFn: () => getProcess({ id }),
  })

  const { mutate: removeResource } = useMutation({
    mutationFn: (resourceId: string) =>
      removeProcessResource({ processId: id, resourceId }),
    onSuccess: () => {
      toast.success('Recurso removido')
      queryClient.invalidateQueries({ queryKey: ['process', id] })
    },
    onError: () => toast.error('Erro ao remover o recurso'),
  })

  const process = data?.data

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  if (!process) return <div className="p-4">Processo não encontrado.</div>

  const extras = {
    ...Object.fromEntries(
      process.extraFields.map((field) => [field.id, field.defaultValue]),
    ),
    ...simulation.extras,
  }

  const costOf = (resourceId: string) => {
    const resource = process.resources.find((item) => item.id === resourceId)

    return resource ? resourceCost(resource, simulation, extras) : null
  }

  const production = process.resources.reduce(
    (sum, resource) => sum + (resourceCost(resource, simulation, extras) || 0),
    0,
  )

  // O preparo entra UMA vez por pedido, custeado pelo custo-hora do setor, e
  // não multiplica pela quantidade (CP-15)
  const setupCost =
    process.sectorHourCost === null
      ? 0
      : Math.round((process.sectorHourCost * process.setupMinutes) / 60)

  const total = setupCost + production

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={process.name}
          previousPage="/configuracoes/produtos/processos"
          supportText={`${process.sector} · ${dimensionRuleObj[process.dimensionRule]}${
            process.setupMinutes
              ? ` · preparo de ${process.setupMinutes} min`
              : ' · sem preparo'
          }`}
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <AddResourceModal processId={process.id} />
            </PermissionGate>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Simulação</CardTitle>
            <CardDescription>
              Informe uma medida para conferir o custo do processo antes de
              usá-lo num produto. A simulação não altera nada.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="sim-width" className="text-sm font-medium">
                  Largura
                </label>
                <Input
                  id="sim-width"
                  type="number"
                  min={0}
                  step="0.01"
                  endAdornment={<span className="text-sm">m</span>}
                  value={String(simulation.width)}
                  onChange={(event) =>
                    setSimulation((current) => ({
                      ...current,
                      width: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sim-height" className="text-sm font-medium">
                  Altura
                </label>
                <Input
                  id="sim-height"
                  type="number"
                  min={0}
                  step="0.01"
                  endAdornment={<span className="text-sm">m</span>}
                  value={String(simulation.height)}
                  onChange={(event) =>
                    setSimulation((current) => ({
                      ...current,
                      height: Number(event.target.value || 0),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="sim-quantity" className="text-sm font-medium">
                  Quantidade
                </label>
                <Input
                  id="sim-quantity"
                  type="number"
                  min={1}
                  value={String(simulation.quantity)}
                  onChange={(event) =>
                    setSimulation((current) => ({
                      ...current,
                      quantity: Number(event.target.value || 1),
                    }))
                  }
                />
              </div>
              {process.extraFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label
                    htmlFor={`extra-${field.id}`}
                    className="text-sm font-medium"
                  >
                    {field.name}
                  </label>
                  <Input
                    id={`extra-${field.id}`}
                    type="number"
                    min={0}
                    value={String(extras[field.id] ?? field.defaultValue)}
                    onChange={(event) =>
                      setSimulation((current) => ({
                        ...current,
                        extras: {
                          ...current.extras,
                          [field.id]: Number(event.target.value || 0),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recursos do processo</CardTitle>
            <CardDescription>
              Cada recurso traz o custo do seu cadastro — patrimônio, material,
              setor ou terceirizado — e a fórmula diz como ele é consumido.
            </CardDescription>
          </CardHeader>
          {process.resources.length ? (
            <>
              <CardContent>
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[28%] min-w-[200px]">
                        Recurso
                      </TableHead>
                      <TableHead className="w-[14%]">Tipo</TableHead>
                      <TableHead className="w-[22%]">Fórmula</TableHead>
                      <TableHead className="w-[12%] text-right">
                        Custo unitário
                      </TableHead>
                      <TableHead className="w-[10%] text-right">
                        Consumo
                      </TableHead>
                      <TableHead className="w-[12%] text-right">
                        Custo na simulação
                      </TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {process.resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <p className="font-medium">{resource.name}</p>
                          <p className="text-sm text-gray">{resource.origin}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="neutralLight">
                            {resourceKindObj[resource.kind]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {formulaObj[resource.formula].label}
                          </p>
                          <p className="text-sm text-gray">
                            {formulaObj[resource.formula].help}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          {resource.unitCost === null
                            ? '-'
                            : `${money(resource.unitCost)}/${resource.unit}`}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray">
                          {resource.quantity} {resource.unit}
                          {(!!resource.lossPercent || !!resource.minimum) && (
                            <span className="block text-xs">
                              {[
                                resource.lossPercent
                                  ? `+${resource.lossPercent}% de perda`
                                  : null,
                                resource.minimum
                                  ? `mínimo ${resource.minimum.toLocaleString('pt-BR')} ${resource.unit}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {costOf(resource.id) === null
                            ? '-'
                            : money(costOf(resource.id) || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <PermissionGate
                              permissions={['product_settings:products:edit']}
                            >
                              <ActionButton
                                Icon={IconTrash}
                                variant="errorGhost"
                                tooltip={`Remover ${resource.name}`}
                                onClick={() => removeResource(resource.id)}
                              />
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-between">
                <p className="text-sm text-gray">
                  Custo técnico do processo, sem rateio administrativo — o
                  método do custo puro.
                </p>
                <div className="text-sm text-right">
                  <p className="text-gray">
                    Preparo {money(setupCost)} ( {process.setupMinutes} min ) +
                    produção {money(production)}
                  </p>
                  <p>
                    Custo na simulação:{' '}
                    <span className="text-lg font-semibold text-gray-900">
                      {money(total)}
                    </span>
                  </p>
                </div>
              </CardFooter>
            </>
          ) : (
            <CardContent className="px-6 pb-6">
              <p className="text-sm text-gray">
                Nenhum recurso no processo. Acrescente máquina, material, mão de
                obra ou terceirizado para o custo ser calculado.
              </p>
            </CardContent>
          )}
        </Card>

        {/* O que o vendedor vê ao vender (CP-13) */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções para o vendedor</CardTitle>
            <CardDescription>
              Aparecem na hora da venda, junto com este processo: o que
              perguntar ao cliente, o que conferir antes de fechar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <Textarea
              aria-label="Instruções para o vendedor"
              placeholder="Ex.: confirmar se o banner vai para área externa — nesse caso, usar lona 440."
              value={instructions ?? process.sellerInstructions ?? ''}
              onChange={(event) => setInstructions(event.target.value)}
            />
            <PermissionGate permissions={['product_settings:products:edit']}>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={
                  instructions === null ||
                  instructions === (process.sellerInstructions ?? '')
                }
                onClick={async () => {
                  const res = await updateProcess({
                    id: process.id,
                    sellerInstructions: instructions ?? '',
                  })
                  if (!res.success) return toast.error(res.message)
                  toast.success('Instruções salvas')
                  setInstructions(null)
                  queryClient.invalidateQueries({ queryKey: ['process', id] })
                }}
              >
                Salvar instruções
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
