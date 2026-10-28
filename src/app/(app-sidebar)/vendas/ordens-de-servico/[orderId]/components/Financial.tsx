// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconCalculator, IconSearch } from '@tabler/icons-react'

// Types
import { OrderType } from '@/types/sales/order'

// Lib
import { cn, formatCurrencyToBrl } from '@/lib/utils'

import { financialFlowStatusObj } from '@/consts/financial'

interface Props {
  data: OrderType
}

export function OrderFinancial({ data }: Props) {
  const financialData = data?.quotation?.financial

  // Componente só é exibido se o usuário tem permissão de visualizar valores
  return (
    <PermissionGate permissions={['values:values:view']}>
      <OrderFinancialContent financialData={financialData} />
    </PermissionGate>
  )
}

function OrderFinancialContent({
  financialData,
}: {
  financialData: OrderType['quotation']['financial'] | undefined
}) {
  if (!financialData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex gap-3 items-center">
            <FeaturedIcon variant="neutralOutline" Icon={IconCalculator} />
            <CardTitle className="text-gray-700 font-semibold text-base">
              Financeiro
            </CardTitle>
            <Badge status variant="neutralLight">
              Sem dados financeiros
            </Badge>
          </div>
        </CardHeader>
      </Card>
    )
  }

  const hasPayments = financialData.payment?.length > 0
  const hasCommissions = financialData.commission?.length > 0
  const hasDeliveries = financialData.delivery?.length > 0

  return (
    <Card className="w-full">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="p-0 m-0 border-0">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconCalculator} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Financeiro
                </CardTitle>
                {financialData?.status && (
                  <Badge
                    status
                    variant={
                      financialFlowStatusObj[financialData?.status]?.variant ||
                      'neutralLight'
                    }
                  >
                    {financialFlowStatusObj[financialData?.status]?.text || '-'}
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <AccordionTrigger
                  className={cn(
                    buttonVariants({
                      variant: 'neutralLight',
                      size: 'icon',
                    }),
                    'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                  )}
                ></AccordionTrigger>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <AccordionContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="min-w-[390px]">
                      Forma de pagamento
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Realizado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={5}
                      className="text-gray font-medium text-xs py-3"
                    >
                      Pagamento
                    </TableCell>
                  </TableRow>
                  {!hasPayments ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        Nenhum pagamento registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.payment.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p>{item.company}</p>
                          <p className="text-gray">{item.method}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            status
                            variant={
                              financialFlowStatusObj[item.status]?.variant ||
                              'neutralLight'
                            }
                          >
                            {financialFlowStatusObj[item.status]?.text || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-success-700">
                            {formatCurrencyToBrl(item.dueAmount)}
                          </p>
                          <p className="text-gray">{item.dueDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-success-700">
                            {formatCurrencyToBrl(item.paidAmount)}
                          </p>
                          <p className="text-gray">{item.paidDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0">
                            <TooltipProvider>
                              <ActionButton
                                Icon={IconSearch}
                                tooltip="Visualizar"
                              />
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={5}
                      className="text-gray font-medium text-xs py-3"
                    >
                      Comissão
                    </TableCell>
                  </TableRow>
                  {!hasCommissions ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        Nenhuma comissão registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.commission.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p>{item.company}</p>
                          <p className="text-gray">{item.method}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            status
                            variant={
                              financialFlowStatusObj[item.status]?.variant ||
                              'neutralLight'
                            }
                          >
                            {financialFlowStatusObj[item.status]?.text || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-error-700">
                            {formatCurrencyToBrl(item.dueAmount)}
                          </p>
                          <p className="text-gray">{item.dueDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-error-700">
                            {formatCurrencyToBrl(item.paidAmount)}
                          </p>
                          <p className="text-gray">{item.paidDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0">
                            <TooltipProvider>
                              <ActionButton
                                Icon={IconSearch}
                                tooltip="Visualizar"
                              />
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  <TableRow className="bg-gray-100">
                    <TableCell
                      colSpan={5}
                      className="text-gray font-medium text-xs py-3"
                    >
                      Entrega
                    </TableCell>
                  </TableRow>
                  {!hasDeliveries ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        Nenhuma despesa de entrega registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    financialData.delivery.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p>{item.company}</p>
                          <p className="text-gray">{item.method}</p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            status
                            variant={
                              financialFlowStatusObj[item.status]?.variant ||
                              'neutralLight'
                            }
                          >
                            {financialFlowStatusObj[item.status]?.text || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-error-700">
                            {formatCurrencyToBrl(item.dueAmount)}
                          </p>
                          <p className="text-gray">{item.dueDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-error-700">
                            {formatCurrencyToBrl(item.paidAmount)}
                          </p>
                          <p className="text-gray">{item.paidDate || '-'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0">
                            <TooltipProvider>
                              <ActionButton
                                Icon={IconSearch}
                                tooltip="Visualizar"
                              />
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
