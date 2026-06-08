'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
} from '@tabler/icons-react'

import { Button, type ButtonProps } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportData,
  type ExportColumn,
  type ExportFormat,
} from '@/lib/export-excel'

type ExportDataButtonSize = Extract<ButtonProps['size'], 'sm' | 'md' | 'iconMd'>
type ExportDataButtonVariant = Extract<
  ButtonProps['variant'],
  'neutralOutline' | 'neutralGhost' | 'outline'
>

interface ExportDataButtonProps<T> {
  columns: ExportColumn<T>[]
  fileName: string
  getData: () => T[] | Promise<T[]>
  sheetName?: string
  formats?: ExportFormat[]
  disabled?: boolean
  label?: string
  emptyMessage?: string
  successMessage?: string
  errorMessage?: string
  size?: ExportDataButtonSize
  variant?: ExportDataButtonVariant
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: 'Excel',
  csv: 'CSV',
}

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  xlsx: IconFileSpreadsheet,
  csv: IconFileTypeCsv,
}

export function ExportDataButton<T>({
  columns,
  fileName,
  getData,
  sheetName,
  formats = ['xlsx', 'csv'],
  disabled,
  label = 'Exportar',
  emptyMessage = 'Nenhum dado disponivel para exportacao',
  successMessage = 'Exportacao gerada com sucesso',
  errorMessage = 'Erro ao exportar dados',
  size = 'md',
  variant = 'neutralOutline',
}: ExportDataButtonProps<T>) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsLoading(true)
      const data = await getData()

      if (!data.length) {
        toast.info(emptyMessage)
        return
      }

      exportData(format, {
        columns,
        data,
        fileName,
        sheetName,
      })

      toast.success(successMessage)
    } catch (error) {
      console.error(errorMessage, error)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (formats.length === 1) {
    return (
      <Button
        type="button"
        size={size}
        variant={variant}
        RightIcon={IconDownload}
        isLoading={isLoading}
        disabled={disabled}
        onClick={() => handleExport(formats[0])}
      >
        {label}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          RightIcon={IconDownload}
          isLoading={isLoading}
          disabled={disabled}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        {formats.map((format) => {
          const Icon = FORMAT_ICONS[format]

          return (
            <DropdownMenuItem
              key={format}
              disabled={isLoading}
              onClick={() => handleExport(format)}
            >
              <Icon className="h-4 w-4" />
              <span>{FORMAT_LABELS[format]}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
