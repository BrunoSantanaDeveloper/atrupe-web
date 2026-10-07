import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconFileInvoice } from '@tabler/icons-react'

interface ServiceItem {
  id: string
  description: string
  finalValue: number
  product: {
    quantity: number
  }
}

interface NfseServicosSectionProps {
  items: ServiceItem[]
  formatCurrency: (value: number) => string
}

export function NfseServicosSection({
  items,
  formatCurrency,
}: NfseServicosSectionProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="servicos">
        <AccordionItem value="servicos" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
              <CardTitle>Serviços ({items.length})</CardTitle>
            </div>
            <AccordionTrigger
              className={cn(
                buttonVariants({
                  variant: 'neutralLight',
                  size: 'icon',
                }),
                'mr-0 [&>svg]:text-gray [&>svg]:size-5',
              )}
            />
          </CardHeader>
          <AccordionContent>
            <CardContent className="p-0">
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm text-gray-900">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 text-right">
                          {item.product?.quantity || 1}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 text-right">
                          {formatCurrency((item.finalValue || 0) / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Nenhum serviço encontrado nesta ordem.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
