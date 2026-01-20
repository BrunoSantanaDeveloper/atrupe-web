'use client'

// UI
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    IconEdit,
    IconTrash,
    IconArrowDown,
    IconArrowUp,
} from '@tabler/icons-react'

// Types
export interface CfopData {
    id: string
    code: string
    description: string
    type: 'ENTRADA' | 'SAIDA'
    info?: string
    isActive?: boolean
}

interface CfopRowProps {
    cfop: CfopData
    onEdit: (cfop: CfopData) => void
    onDelete: (cfop: CfopData) => void
    isLoading?: boolean
}

export function CfopRow({
    cfop,
    onEdit,
    onDelete,
    isLoading = false,
}: CfopRowProps) {
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    {cfop.type === 'ENTRADA' ? (
                        <IconArrowDown className="w-4 h-4 text-green-600" />
                    ) : (
                        <IconArrowUp className="w-4 h-4 text-blue-600" />
                    )}
                    <Badge
                        variant={cfop.type === 'ENTRADA' ? 'successLight' : 'blueLight'}
                    >
                        {cfop.type === 'ENTRADA' ? 'Entrada' : 'Saída'}
                    </Badge>
                </div>
            </td>
            <td className="px-4 py-3 font-mono font-medium text-gray-900">
                {cfop.code}
            </td>
            <td className="px-4 py-3 text-gray-700">{cfop.description}</td>
            <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={cfop.info}>{cfop.info || '—'}</td>

            <td className="px-4 py-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <IconDotsVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(cfop)}>
                            <IconEdit className="w-4 h-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(cfop)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <IconTrash className="w-4 h-4 mr-2" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    )
}
