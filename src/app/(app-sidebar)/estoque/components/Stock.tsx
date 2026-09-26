'use client'

// React / Next
import Link from 'next/link'
import { useMoney } from '@/hooks/useMoney'

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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getStockItems, getStockMovements } from '@/actions/stock'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'
import { stockMovementObj } from '@/consts/stock'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconBoxSeam, IconFileInvoice } from '@tabler/icons-react'

const statusTabs = [
  { tab: 'todos', label: 'Todos' },
  { tab: 'abaixo-do-minimo', label: 'Abaixo do mínimo' },
  { tab: 'zerados', label: 'Zerados' },
]

const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-'

export function Stock({ searchParams }: SearchParamsType) {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const status = (searchParams?.status as string) || 'todos'

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['stock-items', searchParams],
    queryFn: () => getStockItems({ filters: searchParams }),
  })

  const { data: movementsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['stock-movements'],
    queryFn: () => getStockMovements(),
  })

  const items = data?.data || []
  const movements = movementsData?.data || []

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Estoque"
          supportText="Saldo por material, com entrada pela nota e baixa pela produção"
          primaryCta={
            <Button variant="neutralOutline" LeftIcon={IconFileInvoice} asChild>
              <Link href="/estoque/entrada-de-nota">Entrada de nota</Link>
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Saldo dos materiais</CardTitle>
            <CardDescription>
              A entrada vem da nota conciliada e a baixa vem do gerenciador de
              produção, pelo consumo real das etapas.
            </CardDescription>
            <Tabs value={status} className="overflow-x-auto pt-4">
              <TabsList>
                {statusTabs.map((tab) => (
                  <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                    <Link href={`/estoque?status=${tab.tab}`}>{tab.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          {isLoading ? (
            <TableSkeleton cols={6} rows={5} />
          ) : !items.length ? (
            <ListDataTotalEmpty
              icon={IconBoxSeam}
              title="Nenhum material em estoque"
              description="O saldo aparece aqui depois da primeira entrada de nota."
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[880px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[30%] min-w-[200px]">
                        Material
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Saldo
                      </TableHead>
                      <TableHead className="w-[12%] text-right">
                        Mínimo
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Custo médio
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Última entrada
                      </TableHead>
                      <TableHead className="w-[16%]">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const below = item.quantity < item.minimum

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <p className="font-medium">{item.name}</p>
                            {item.variation && (
                              <p className="text-sm text-gray">
                                {item.variation}
                              </p>
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-medium',
                              below && 'text-error-700',
                            )}
                          >
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-gray">
                            {item.minimum} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(item.averageCost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.lastEntryCost === null ? (
                              <span className="text-sm text-gray">
                                sem entrada
                              </span>
                            ) : (
                              <>
                                {money(item.lastEntryCost)}
                                <span className="block text-xs text-gray">
                                  {formatDate(item.lastEntryDate)}
                                </span>
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.quantity === 0 ? (
                              <Badge status variant="errorLight">
                                Zerado
                              </Badge>
                            ) : below ? (
                              <Badge status variant="warningLight">
                                Abaixo do mínimo
                              </Badge>
                            ) : (
                              <Badge status variant="successLight">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                O custo médio alimenta a composição; quando a última entrada
                fica acima dele, o custo dos produtos ainda não reflete a
                compra.
              </CardFooter>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas movimentações</CardTitle>
            <CardDescription>
              Entrada pela nota, consumo pela produção e ajustes de inventário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[14%]">Data</TableHead>
                  <TableHead className="w-[16%]">Tipo</TableHead>
                  <TableHead className="w-[30%]">Material</TableHead>
                  <TableHead className="w-[14%] text-right">
                    Quantidade
                  </TableHead>
                  <TableHead className="w-[26%]">Origem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm">
                      {formatDate(movement.date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockMovementObj[movement.kind].variant}>
                        {stockMovementObj[movement.kind].text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{movement.name}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        movement.quantity < 0 && 'text-gray-900',
                      )}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity} {movement.unit}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {movement.origin}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
