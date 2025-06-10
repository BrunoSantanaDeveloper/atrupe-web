// UI component Imports
import { TableRow, TableCell } from '@/components/ui/table'

interface Props {
  colSpan?: number
}

export function TableRowNoResults({ colSpan = 6 }: Props) {
  return (
    <TableRow>
      <TableCell
        className="text-gray text-center py-8 px-6 border-b"
        colSpan={colSpan}
      >
        Nenhum resultado encontrado
      </TableCell>
    </TableRow>
  )
}
