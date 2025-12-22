'use client'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, ButtonProps } from '@/components/ui/button'

// Icon
import { IconPrinter } from '@tabler/icons-react'

export function PrintButton({
  variant = 'neutralOutline',
  size = 'iconMd',
}: {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size={size}
            variant={variant}
            RightIcon={IconPrinter}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-28" align="end">
          <DropdownMenuItem>PDF</DropdownMenuItem>
          <DropdownMenuItem>Excel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
