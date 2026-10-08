'use client'

// UI
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Icons
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconArrowDown,
  IconArrowUp,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// Types
export interface CfopReference {
  id: string
  code: string
  description: string
}

export interface OperationNatureData {
  id: string
  description: string
  type: 'ENTRADA' | 'SAIDA'
  finality: string
  consumerPresence: string
  active: boolean
  isActive?: boolean // normalization
  cfopInternal?: CfopReference
  cfopExternal?: CfopReference
}

interface NaturezaRowProps {
  nature: OperationNatureData
  onEdit: (nature: OperationNatureData) => void
  onDelete: (nature: OperationNatureData) => void
  onToggleActive: (nature: OperationNatureData, active: boolean) => void
  isLoading?: boolean
}

export function NaturezaRow({
  nature,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: NaturezaRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <Switch
          checked={nature.isActive}
          onCheckedChange={(checked) => onToggleActive(nature, checked)}
          disabled={isLoading}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {nature.type === 'ENTRADA' ? (
            <Icon icon={IconArrowDown} size="sm" className="text-green-600" />
          ) : (
            <Icon icon={IconArrowUp} size="sm" className="text-blue-600" />
          )}
          <span className="font-medium text-gray-900">
            {nature.description}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm">
        {nature.cfopInternal ? (
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {nature.cfopInternal.code}
            </span>
            <span
              className="truncate max-w-[150px]"
              title={nature.cfopInternal.description}
            >
              {nature.cfopInternal.description}
            </span>
          </div>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3 text-gray-500 text-sm">
        {nature.cfopExternal ? (
          <div className="flex flex-col">
            <span className="font-mono text-xs">
              {nature.cfopExternal.code}
            </span>
            <span
              className="truncate max-w-[150px]"
              title={nature.cfopExternal.description}
            >
              {nature.cfopExternal.description}
            </span>
          </div>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icon icon={IconDotsVertical} size="md" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(nature)}>
              <Icon icon={IconPencil} size="md" className="mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(nature)}
              className="text-red-600 focus:text-red-600"
            >
              <Icon icon={IconTrash} size="md" className="mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
