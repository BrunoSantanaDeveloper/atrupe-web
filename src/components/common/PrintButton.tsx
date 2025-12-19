'use client'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Icon
import { IconPrinter } from '@tabler/icons-react'

export function PrintButton() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="iconMd"
            variant="neutralOutline"
            RightIcon={IconPrinter}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-32" align="start">
          <DropdownMenuItem>PDF</DropdownMenuItem>
          <DropdownMenuItem>Excel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
