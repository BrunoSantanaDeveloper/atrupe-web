import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconShoppingCart, IconTrash } from '@tabler/icons-react'

import type { PdvItem } from './pdv-types'
import { formatBRL } from './pdv-types'

interface PdvItemsTableProps {
  items: PdvItem[]
  totalNota: number
  onRemoveItem: (id: string) => void
}

export function PdvItemsTable({
  items,
  totalNota,
  onRemoveItem,
}: PdvItemsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Itens ({items.length})
          </CardTitle>
          <Badge variant="blue" className="text-sm">
            Total: {formatBRL(totalNota)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <IconShoppingCart size={40} className="mb-2" />
            <p className="text-sm">
              Nenhum item adicionado. Adicione produtos acima.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">V. Unit.</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-500">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {item.descricao}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {item.codigo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantidade}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatBRL(item.valorUnitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.valorDesconto > 0
                        ? formatBRL(item.valorDesconto)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatBRL(item.valorTotal - item.valorDesconto)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="iconXs"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-error-500 hover:text-error-700"
                        aria-label="Remover item"
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
