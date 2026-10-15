'use client'

// React / Next
import { useRef, useState } from 'react'

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
import { MatchItemModal } from './MatchItemModal'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { InvoiceItem } from '../../types'

// Actions
import {
  getInvoices,
  importInvoiceXml,
  confirmInvoiceEntry,
} from '@/actions/stock'

// Hooks / Store / Consts

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconLink, IconFileImport } from '@tabler/icons-react'

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')

export function InvoiceEntry() {
  // Custo e preço só para quem tem a permissão de valores (§9)
  const money = useMoney()
  const queryClient = useQueryClient()
  const [matching, setMatching] = useState<{
    invoiceId: string
    item: InvoiceItem
  }>()

  // A nota entra pelo XML da NF-e que o fornecedor mandou (Fase 7.5)
  const fileInput = useRef<HTMLInputElement>(null)
  const { mutate: importXml, isPending: importing } = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return importInvoiceXml(form)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Nota lançada: confira o vínculo dos itens')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Erro ao lançar a nota'),
  })

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['invoices'],
    queryFn: () => getInvoices(),
  })

  const { mutate: confirm, isPending } = useMutation({
    mutationFn: (invoiceId: string) => confirmInvoiceEntry({ invoiceId }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Entrada confirmada e estoque atualizado')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['stock-items'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
    },
    onError: () => toast.error('Erro ao confirmar a entrada'),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  const invoices = data?.data || []

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Entrada de nota"
          previousPage="/estoque"
          supportText="Cada item da nota vira material interno, com a conversão da unidade"
          primaryCta={
            <PermissionGate permissions={['stock:invoice_entry:create']}>
              <input
                ref={fileInput}
                type="file"
                accept=".xml,text/xml,application/xml"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) importXml(file)
                  event.target.value = ''
                }}
              />
              <Button
                LeftIcon={IconFileImport}
                isLoading={importing}
                onClick={() => fileInput.current?.click()}
              >
                Importar XML da NF-e
              </Button>
            </PermissionGate>
          }
        />

        {invoices.map((invoice) => {
          const pending = invoice.items.filter((item) => !item.materialId)

          return (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      NF {invoice.number} — {invoice.supplier}
                    </CardTitle>
                    <CardDescription>
                      Emitida em {formatDate(invoice.issueDate)} ·{' '}
                      {money(invoice.total)}
                    </CardDescription>
                  </div>
                  <Badge
                    status
                    variant={pending.length ? 'warningLight' : 'successLight'}
                  >
                    {pending.length
                      ? `${pending.length} item(ns) sem vínculo`
                      : 'Pronta para entrada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="min-w-[940px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[30%] min-w-[220px]">
                        Item na nota
                      </TableHead>
                      <TableHead className="w-[12%]">Unidade</TableHead>
                      <TableHead numeric className="w-[10%]">
                        Quantidade
                      </TableHead>
                      <TableHead numeric className="w-[12%]">
                        Valor unitário
                      </TableHead>
                      <TableHead className="w-[28%]">
                        Material interno
                      </TableHead>
                      <TableHead className="w-[8%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-gray">
                            {item.supplierCode}
                            {item.gtin ? ` · GTIN ${item.gtin}` : ''}
                          </p>
                        </TableCell>
                        <TableCell>{item.supplierUnit}</TableCell>
                        <TableCell numeric>{item.quantity}</TableCell>
                        <TableCell numeric>{money(item.unitValue)}</TableCell>
                        <TableCell>
                          {item.materialId ? (
                            <>
                              <p className="text-sm font-medium">
                                {item.materialName}
                              </p>
                              <p className="text-sm text-gray">
                                1 {item.supplierUnit} = {item.conversionFactor}{' '}
                                na unidade do material
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-gray">
                              sem vínculo
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <PermissionGate
                              permissions={['stock:invoice_entry:edit']}
                            >
                              <ActionButton
                                Icon={IconLink}
                                tooltip={`Vincular ${item.description}`}
                                onClick={() =>
                                  setMatching({ invoiceId: invoice.id, item })
                                }
                              />
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray">
                  O vínculo fica guardado: na próxima nota do mesmo fornecedor,
                  o item já vem reconhecido.
                </p>
                <PermissionGate permissions={['stock:invoice_entry:edit']}>
                  <Button
                    isLoading={isPending}
                    disabled={pending.length > 0}
                    onClick={() => confirm(invoice.id)}
                  >
                    {isPending ? 'Confirmando...' : 'Confirmar entrada'}
                  </Button>
                </PermissionGate>
              </CardFooter>
            </Card>
          )
        })}

        {!invoices.length && (
          <Card>
            <CardContent className="py-8 px-6">
              <p className="text-sm text-gray text-center">
                Nenhuma nota aguardando entrada. Importe o XML da NF-e que o
                fornecedor mandou.
              </p>
            </CardContent>
          </Card>
        )}

        <MatchItemModal
          invoiceId={matching?.invoiceId}
          item={matching?.item}
          open={!!matching}
          onOpenChange={() => setMatching(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
