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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
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
import { AddStepModal } from './AddStepModal'
import { ProductFields } from './ProductFields'
import { VariationTabs } from './VariationTabs'
import { ActionButton } from '@/components/common/ActionButton'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  getComposition,
  setReleasedForSale,
  moveCompositionStep,
  applySuggestedPrice,
  removeCompositionStep,
  updateCompositionStep,
} from '@/actions/compositions'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconTrash,
  IconPencil,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react'

interface Props {
  id: string
}

export function CompositionDetail({ id }: Props) {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['composition', id],
    queryFn: () => getComposition({ id }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['composition', id] })
    queryClient.invalidateQueries({ queryKey: ['compositions'] })
  }

  const [editingStep, setEditingStep] = useState('')

  const { mutate: updateStep } = useMutation({
    mutationFn: (values: {
      stepId: string
      name: string
      estimatedMinutes: number
      setupMinutes: number
      cost: number
    }) => updateCompositionStep({ productId: id, ...values }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Etapa atualizada')
      setEditingStep('')
      invalidate()
    },
    onError: () => toast.error('Erro ao atualizar a etapa'),
  })

  const { mutate: moveStep } = useMutation({
    mutationFn: (values: { stepId: string; direction: 'UP' | 'DOWN' }) =>
      moveCompositionStep({ productId: id, ...values }),
    onSuccess: invalidate,
    onError: () => toast.error('Erro ao mover a etapa'),
  })

  const { mutate: removeStep } = useMutation({
    mutationFn: (stepId: string) =>
      removeCompositionStep({ productId: id, stepId }),
    onSuccess: () => {
      toast.success('Etapa removida')
      invalidate()
    },
    onError: () => toast.error('Erro ao remover a etapa'),
  })

  const { mutate: toggleRelease } = useMutation({
    mutationFn: (released: boolean) =>
      setReleasedForSale({ productId: id, released }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(
        response.data?.releasedForSale
          ? 'Produto liberado para venda'
          : 'Produto marcado como parte',
      )
      invalidate()
    },
    onError: () => toast.error('Erro ao alterar a liberação'),
  })

  const { mutate: applyPrice, isPending: isApplying } = useMutation({
    mutationFn: () => applySuggestedPrice({ id }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Preço sugerido aplicado')
      invalidate()
    },
    onError: () => toast.error('Erro ao aplicar o preço'),
  })

  const product = data?.data

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  if (!product) return <div className="p-4">Produto não encontrado.</div>

  const totalMinutes = product.steps.reduce(
    (sum, step) => sum + step.estimatedMinutes,
    0,
  )

  // O preparo entra uma vez por pedido e por isso é contado à parte (CP-15)
  const setupMinutes = product.steps.reduce(
    (sum, step) => sum + step.setupMinutes,
    0,
  )

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title={product.name}
          previousPage="/configuracoes/produtos"
          supportText={[product.code, `vendido por ${product.unit}`]
            .filter(Boolean)
            .join(' · ')}
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <AddStepModal productId={product.id} />
            </PermissionGate>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Custo e preço</CardTitle>
            <CardDescription>
              O custo vem da composição; o preço praticado continua livre. A
              margem mostra o resultado do preço sobre o custo.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray">Custo da composição</p>
                <p className="text-lg font-semibold text-gray-900">
                  {product.cost === null
                    ? 'Custo não calculado'
                    : formatCurrencyToBrl(product.cost)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray">Preço praticado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {product.price === null
                    ? '-'
                    : formatCurrencyToBrl(product.price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray">
                  Preço sugerido pelo markup de referência
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {product.suggestedPrice === null
                    ? '-'
                    : formatCurrencyToBrl(product.suggestedPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray">Margem atual</p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    product.margin !== null && product.margin < 0
                      ? 'text-error-700'
                      : 'text-gray-900',
                  )}
                >
                  {product.margin === null
                    ? '-'
                    : `${product.margin.toString().replace('.', ',')}%`}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between flex-wrap gap-3">
            <p className="text-sm text-gray">
              {product.margin !== null && product.margin < 0
                ? 'Este produto está sendo vendido abaixo do custo.'
                : 'A empresa decide produto a produto: manter o preço que já praticava ou adotar o sugerido.'}
            </p>
            <PermissionGate permissions={['product_settings:products:edit']}>
              <Button
                variant="neutralOutline"
                isLoading={isApplying}
                disabled={product.suggestedPrice === null}
                onClick={() => applyPrice()}
              >
                Adotar preço sugerido
              </Button>
            </PermissionGate>
          </CardFooter>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="font-medium">
                {product.releasedForSale
                  ? 'Produto liberado para venda'
                  : 'Parte: não aparece no orçamento'}
              </p>
              <p className="text-sm text-gray">
                A parte existe para compor outros produtos — a base, a estrutura
                e o letreiro de um totem. O vendedor só encontra no orçamento o
                que está liberado para venda.
              </p>
            </div>
            <PermissionGate permissions={['product_settings:products:edit']}>
              <Switch
                checked={product.releasedForSale}
                aria-label="Liberado para venda"
                onCheckedChange={(checked) => toggleRelease(checked)}
              />
            </PermissionGate>
          </CardContent>
        </Card>

        <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
          <ProductFields productId={product.id} fields={product.fields} />
        </FeatureGate>

        <Card>
          <CardHeader>
            <CardTitle>Variações</CardTitle>
            <CardDescription>
              O mesmo produto em tamanhos ou modelos diferentes. A variação
              nasce igual à base e só o que for alterado nela passa a ser dela.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <VariationTabs product={product} />
          </CardContent>
        </Card>

        <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
          <Card>
            <CardHeader>
              <CardTitle>Etapas de produção</CardTitle>
              <CardDescription>
                Cada etapa pertence a um setor e usa um processo pronto ou
                composição própria. O tempo previsto alimenta a produção.
              </CardDescription>
            </CardHeader>
            {product.steps.length ? (
              <>
                <CardContent>
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[34%] min-w-[200px]">
                          Etapa
                        </TableHead>
                        <TableHead className="w-[18%]">Setor</TableHead>
                        <TableHead className="w-[18%]">Origem</TableHead>
                        <TableHead className="w-[12%] text-right">
                          Tempo previsto
                        </TableHead>
                        <TableHead className="w-[12%] text-right">
                          Custo
                        </TableHead>
                        <TableHead className="w-[6%]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.steps.map((step) => (
                        <TableRow key={step.id}>
                          <TableCell className="font-medium">
                            {editingStep === step.id ? (
                              <Input
                                autoFocus
                                defaultValue={step.name}
                                aria-label={`Nome da etapa ${step.name}`}
                                onBlur={(event) =>
                                  updateStep({
                                    stepId: step.id,
                                    name: event.target.value,
                                    estimatedMinutes: step.estimatedMinutes,
                                    setupMinutes: step.setupMinutes,
                                    cost: step.cost,
                                  })
                                }
                              />
                            ) : (
                              step.name
                            )}
                          </TableCell>
                          <TableCell>{step.sector}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                step.kind === 'PART'
                                  ? 'blueLight'
                                  : 'neutralLight'
                              }
                            >
                              {step.kind === 'PART'
                                ? 'Parte'
                                : step.processId
                                  ? 'Processo'
                                  : 'Composição própria'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray">
                            {editingStep === step.id ? (
                              <Input
                                type="number"
                                min={0}
                                className="w-[90px]"
                                defaultValue={step.estimatedMinutes}
                                aria-label={`Tempo de ${step.name}`}
                                onBlur={(event) =>
                                  updateStep({
                                    stepId: step.id,
                                    name: step.name,
                                    estimatedMinutes:
                                      Number(event.target.value) || 0,
                                    setupMinutes: step.setupMinutes,
                                    cost: step.cost,
                                  })
                                }
                              />
                            ) : (
                              <>
                                {step.estimatedMinutes} min
                                {step.setupMinutes ? (
                                  <span className="block text-sm text-gray">
                                    + {step.setupMinutes} min de preparo
                                  </span>
                                ) : null}
                              </>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingStep === step.id ? (
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                className="w-[120px]"
                                defaultValue={step.cost / 100}
                                aria-label={`Custo de ${step.name}`}
                                onBlur={(event) =>
                                  updateStep({
                                    stepId: step.id,
                                    name: step.name,
                                    estimatedMinutes: step.estimatedMinutes,
                                    setupMinutes: step.setupMinutes,
                                    cost: Math.round(
                                      Number(event.target.value || 0) * 100,
                                    ),
                                  })
                                }
                              />
                            ) : (
                              formatCurrencyToBrl(step.cost)
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <PermissionGate
                                permissions={['product_settings:products:edit']}
                              >
                                <ActionButton
                                  Icon={IconArrowUp}
                                  tooltip={`Subir ${step.name}`}
                                  onClick={() =>
                                    moveStep({
                                      stepId: step.id,
                                      direction: 'UP',
                                    })
                                  }
                                />
                                <ActionButton
                                  Icon={IconArrowDown}
                                  tooltip={`Descer ${step.name}`}
                                  onClick={() =>
                                    moveStep({
                                      stepId: step.id,
                                      direction: 'DOWN',
                                    })
                                  }
                                />
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip={`Editar ${step.name}`}
                                  onClick={() => setEditingStep(step.id)}
                                />
                                <ActionButton
                                  Icon={IconTrash}
                                  variant="errorGhost"
                                  tooltip={`Remover ${step.name}`}
                                  onClick={() => removeStep(step.id)}
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
                    Tempo total previsto: {totalMinutes} min de produção
                    {setupMinutes ? ` + ${setupMinutes} min de preparo` : ''}
                  </p>
                  <p className="text-sm">
                    Custo técnico:{' '}
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrencyToBrl(product.cost || 0)}
                    </span>
                  </p>
                </CardFooter>
              </>
            ) : (
              <CardContent className="px-6 pb-6">
                <p className="text-sm text-gray">
                  Este produto ainda não tem composição. Ele continua sendo
                  vendido normalmente pelo preço cadastrado; sem composição, o
                  custo não é calculado e a margem não aparece.
                </p>
              </CardContent>
            )}
          </Card>
        </FeatureGate>
      </div>
    </TooltipProvider>
  )
}
