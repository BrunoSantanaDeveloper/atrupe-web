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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { NewOutsourcedModal } from './NewOutsourced'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ProductAreaTabs } from '../../components/ProductAreaTabs'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getOutsourcedServices } from '@/actions/outsourced'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconTruckDelivery } from '@tabler/icons-react'

export function Outsourced({ searchParams }: SearchParamsType) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['outsourced', searchParams],
    queryFn: () => getOutsourcedServices({ filters: searchParams }),
  })

  const services = data?.data || []

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <ProductAreaTabs />
        <Topbar
          title="Terceirizados"
          supportText="Serviços contratados que entram na composição e no orçamento"
          primaryCta={
            <PermissionGate permissions={['product_settings:products:edit']}>
              <NewOutsourcedModal />
            </PermissionGate>
          }
        />
        <Card>
          {isLoading ? (
            <TableSkeleton cols={5} rows={5} />
          ) : !services.length ? (
            <ListDataTotalEmpty
              icon={IconTruckDelivery}
              title="Nenhum serviço terceirizado cadastrado"
              description="Cadastre os serviços que a empresa contrata de terceiros"
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[820px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[30%] min-w-[200px]">
                        Serviço
                      </TableHead>
                      <TableHead className="w-[26%]">Fornecedor</TableHead>
                      <TableHead className="w-[10%]">Unidade</TableHead>
                      <TableHead className="w-[12%] text-right">
                        Custo
                      </TableHead>
                      <TableHead className="w-[12%] text-right">
                        Preço de venda
                      </TableHead>
                      <TableHead className="w-[10%] text-right">
                        Margem
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>{service.supplier}</TableCell>
                        <TableCell>{service.unit}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyToBrl(service.cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {service.price === null
                            ? '-'
                            : formatCurrencyToBrl(service.price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {service.margin === null
                            ? '-'
                            : `${service.margin.toString().replace('.', ',')}%`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray">
                O terceirizado é custo variável da venda: não entra na Base de
                custos e, quando a venda é aprovada, vira previsão de despesa no
                financeiro.
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
