'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

// Quantas colunas a tabela tem, medido no cabeçalho depois de montar. Linhas
// de grupo e de estado usam isso para ocupar a largura toda sem que a tela
// informe um colSpan (que costumava ficar errado quando colunas eram
// condicionais).
const TableColumnsContext = React.createContext<number>(1)

function useColumnCount(tableRef: React.RefObject<HTMLTableElement>) {
  const [count, setCount] = React.useState(1)

  React.useLayoutEffect(() => {
    const table = tableRef.current
    if (!table) return
    const measure = () => {
      const head = table.tHead?.rows[0] ?? table.rows[0]
      if (!head) return
      const total = Array.from(head.cells).reduce(
        (sum, cell) => sum + cell.colSpan,
        0,
      )
      setCount((prev) => (prev === total ? prev : Math.max(total, 1)))
    }
    measure()
    const observer = new MutationObserver(measure)
    observer.observe(table, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [tableRef])

  return count
}

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLTableElement>(null)
  React.useImperativeHandle(ref, () => innerRef.current as HTMLTableElement)
  const columns = useColumnCount(innerRef)

  return (
    <TableColumnsContext.Provider value={columns}>
      <div className="relative w-full overflow-auto">
        <table
          ref={innerRef}
          className={cn('w-full caption-bottom tabular-nums', className)}
          {...props}
        />
      </div>
    </TableColumnsContext.Provider>
  )
})
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      '[&_tr]:border-b [&_tr]:bg-gray-50 [&_tr]:hover:bg-gray-50',
      className,
    )}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-gray-100/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-gray-100 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gray-100',
      className,
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

type NumericProps = {
  /** Coluna de valor, quantidade ou percentual: alinha à direita. */
  numeric?: boolean
}

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & NumericProps
>(({ className, numeric, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'type-table-header h-11 px-6 text-left align-middle [&:has([role=checkbox])]:pr-0',
      numeric && 'text-right',
      className,
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & NumericProps
>(({ className, numeric, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'type-body py-4 px-6 align-middle [&:has([role=checkbox])]:pr-0',
      numeric && 'text-right',
      className,
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

// Linha que separa grupos (setor, mês, categoria). Ocupa todas as colunas.
const TableGroupRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    cellClassName?: string
  }
>(({ className, cellClassName, children, ...props }, ref) => {
  const columns = React.useContext(TableColumnsContext)
  return (
    <tr
      ref={ref}
      className={cn('border-b border-gray-100 bg-gray-50', className)}
      {...props}
    >
      <th
        scope="colgroup"
        colSpan={columns}
        className={cn('type-eyebrow px-6 py-2 text-left', cellClassName)}
      >
        {children}
      </th>
    </tr>
  )
})
TableGroupRow.displayName = 'TableGroupRow'

// Linha única que ocupa todas as colunas (estado vazio, expansão).
const TableFullRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { cellClassName?: string }
>(({ className, cellClassName, children, ...props }, ref) => {
  const columns = React.useContext(TableColumnsContext)
  return (
    <tr ref={ref} className={className} {...props}>
      <td colSpan={columns} className={cellClassName}>
        {children}
      </td>
    </tr>
  )
})
TableFullRow.displayName = 'TableFullRow'

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('type-secondary mt-4', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

/** Colunas da tabela atual (para quem ainda precisa de colSpan explícito). */
function useTableColumns() {
  return React.useContext(TableColumnsContext)
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableGroupRow,
  TableFullRow,
  TableCaption,
  useTableColumns,
}
