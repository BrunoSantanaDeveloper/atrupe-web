'use client'

// React / Next
import Link from 'next/link'

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ProductAreaTabs } from '../../components/ProductAreaTabs'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getCompositions } from '@/actions/compositions'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconEye, IconBoxSeam } from '@tabler/icons-react'

const statusTabs = [
  { tab: 'todos', label: 'Todos' },
  { tab: 'com-composicao', label: 'Com composição' },
  { tab: 'sem-composicao', label: 'Sem composição' },
  { tab: 'abaixo-do-custo', label: 'Abaixo do custo' },
]

export function Compositions({ searchParams }: SearchParamsType) {
  const status = (searchParams?.status as string) || 'todos'

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['compositions', searchParams],
    queryFn: () => getCompositions({ filters: searchParams }),
  })

  const products = data?.data || []

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <ProductAreaTabs />
        <Topbar
          title="Composições"
          supportText="Os produtos que a empresa já vende, agora com custo e margem"
        />
        <Card>
          <div className="px-6 pt-6">
            <Tabs value={status} className="overflow-x-auto">
              <TabsList>
                {statusTabs.map((tab) => (
                  <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                    <Link href={`?status=${tab.tab}`}>{tab.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          {isLoading ? (
            <TableSkeleton cols={6} rows={6} />
          ) : !products.length ? (
            status === 'todos' ? (
              <ListDataTotalEmpty
                icon={IconBoxSeam}
                title="Nenhum produto cadastrado"
                description="Os produtos vêm do cadastro que a empresa já usa."
              />
            ) : (
              <FilteredDataEmpty description="Nenhum produto nesta situação." />
            )
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[940px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[28%] min-w-[200px]">
                        Produto
                      </TableHead>
                      <TableHead className="w-[12%]">Etapas</TableHead>
                      <TableHead className="w-[14%] text-right">
                        Custo
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Preço praticado
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Preço sugerido
                      </TableHead>
                      <TableHead className="w-[12%] text-right">
                        Margem
                      </TableHead>
                      <TableHead className="w-[6%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray">
                            {product.code} · {product.unit}
                          </p>
                        </TableCell>
                        <TableCell>
                          {product.steps.length ? (
                            <Badge variant="neutralLight">
                              {product.steps.length}{' '}
                              {product.steps.length === 1 ? 'etapa' : 'etapas'}
                            </Badge>
                          ) : (
                            <Badge variant="warningLight">sem composição</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.cost === null ? (
                            <span className="text-sm text-gray">
                              custo não calculado
                            </span>
                          ) : (
                            formatCurrencyToBrl(product.cost)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.price === null
                            ? '-'
                            : formatCurrencyToBrl(product.price)}
                        </TableCell>
                        <TableCell className="text-right text-gray">
                          {product.suggestedPrice === null
                            ? '-'
                            : formatCurrencyToBrl(product.suggestedPrice)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            product.margin !== null &&
                              product.margin < 0 &&
                              'text-error-700',
                          )}
                        >
                          {product.margin === null
                            ? '-'
                            : `${product.margin.toString().replace('.', ',')}%`}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              Icon={IconEye}
                              tooltip={`Abrir composição de ${product.name}`}
                              link={`/configuracoes/produtos/composicoes/${product.id}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                O preço praticado é preservado na virada de plano. A composição
                é montada aos poucos, e a cada produto composto a empresa passa
                a ver custo e margem reais.
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
