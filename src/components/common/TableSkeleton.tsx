// React Imports
import { Fragment } from 'react'

// UI component Imports
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  cols?: number
  rows?: number
}

export function TableSkeleton({ cols = 5, rows = 10 }: Props) {
  const colsArray = Array.from({ length: cols })
  const itemsArray = Array.from({ length: rows })

  return (
    <>
      <Table className="text-xs">
        <TableHeader>
          <TableRow className="bg-gray-50">
            {colsArray.map((_, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-12" />
              </TableHead>
            ))}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemsArray.map((_, index) => (
            <Fragment key={index}>
              <TableRow>
                {colsArray.map((_, index) => (
                  <TableCell key={index}>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-4 justify-end items-center">
                    <Skeleton className="w-6 h-6" />
                    <Skeleton className="w-6 h-6" />
                  </div>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
