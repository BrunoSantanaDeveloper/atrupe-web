'use client'

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
import { Button } from '@/components/ui/button'
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
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  getComposition,
  applySuggestedPrice,
  removeCompositionStep,
} from '@/actions/compositions'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconTrash } from '@tabler/icons-react'

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

  const { mutate: removeStep } = useMutation({
    mutationFn: (stepId: string) =>
      removeCompositionStep({ productId: id, stepId }),
    onSuccess: () => {
      toast.success('Etapa removida')
      invalidate()
    },
    onError: () => toast.error('Erro ao remover a etapa'),
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

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title={product.name}
          previousPage="/configuracoes/produtos/composicoes"
          supportText={`${product.code} · vendido por ${product.unit}`}
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
          <CardContent>
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
                          {step.name}
                        </TableCell>
                        <TableCell>{step.sector}</TableCell>
                        <TableCell>
                          <Badge variant="neutralLight">
                            {step.processId ? 'Processo' : 'Composição própria'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray">
                          {step.estimatedMinutes} min
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyToBrl(step.cost)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <PermissionGate
                              permissions={['product_settings:products:edit']}
                            >
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
                  Tempo total previsto: {totalMinutes} min
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
            <CardContent>
              <p className="text-sm text-gray">
                Este produto ainda não tem composição. Ele continua sendo
                vendido normalmente pelo preço cadastrado; sem composição, o
                custo não é calculado e a margem não aparece.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
