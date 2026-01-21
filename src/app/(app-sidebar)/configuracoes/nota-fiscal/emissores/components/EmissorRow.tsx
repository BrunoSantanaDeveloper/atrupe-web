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
  IconStar,
  IconStarFilled,
  IconPlugConnected,
} from '@tabler/icons-react'

// Types
export interface EmissorData {
  id: string
  companyId: string // Adicionado
  name: string
  isDefault: boolean
  emitCnpj?: string
  emitRazaoSocial?: string
  emitNomeFantasia?: string
  environment?: string
  hasCertificate?: boolean
  accessKey?: string
  // Novos campos para detalhes
  emitCrt?: string
  emitIe?: string
  emitIm?: string
  emitEndereco?: string
  emitNumero?: string
  emitBairro?: string
  emitCep?: string
  emitCmun?: string
  emitUf?: string
  // Fiscal Configs
  serieNfe?: number
  proximoNumeroNfe?: number
  serieNfse?: string
  proximoRpsNfse?: number
  codigoServico?: string
  aliquotaIss?: number
  serieNfce?: number
  proximoNumeroNfce?: number
  defaultCfop?: string
  defaultOperationNature?: string
}

interface EmissorRowProps {
  emissor: EmissorData
  onEdit: (emissor: EmissorData) => void
  onDelete: (emissor: EmissorData) => void
  onSetDefault: (emissor: EmissorData) => void
  onTestConnection: (emissor: EmissorData) => void
  isLoading?: boolean
}

export function EmissorRow({
  emissor,
  onEdit,
  onDelete,
  onSetDefault,
  onTestConnection,
  isLoading = false,
}: EmissorRowProps) {
  const formatCnpj = (cnpj?: string) => {
    if (!cnpj) return '—'
    const cleaned = cnpj.replace(/\D/g, '')
    if (cleaned.length !== 14) return cnpj
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    )
  }

  const isConfigured =
    !!emissor.accessKey && !!emissor.emitCnpj && !!emissor.emitRazaoSocial

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Status */}
      <td className="px-4 py-3">
        {isConfigured ? (
          <Badge variant="default" className="bg-green-100 text-green-700">
            Conexão Ativa
          </Badge>
        ) : (
          <Badge variant="neutral" className="bg-amber-100 text-amber-700">
            Pendente
          </Badge>
        )}
      </td>

      {/* Nome */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{emissor.name}</span>
          {emissor.isDefault && (
            <IconStarFilled className="w-4 h-4 text-amber-500" />
          )}
        </div>
        {emissor.emitNomeFantasia && (
          <span className="text-sm text-gray-500">
            {emissor.emitNomeFantasia}
          </span>
        )}
      </td>

      {/* CNPJ */}
      <td className="px-4 py-3 font-mono text-sm text-gray-700">
        {formatCnpj(emissor.emitCnpj)}
      </td>

      {/* Ambiente */}
      <td className="px-4 py-3">
        {emissor.environment === 'PRODUCAO' ? (
          <Badge variant="default" className="bg-green-100 text-green-700">
            Produção
          </Badge>
        ) : (
          <Badge variant="neutral" className="bg-amber-100 text-amber-700">
            Homologação
          </Badge>
        )}
      </td>

      {/* Ações */}
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <IconDotsVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(emissor)}>
              <IconEdit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTestConnection(emissor)}>
              <IconPlugConnected className="w-4 h-4 mr-2" />
              Testar Conexão
            </DropdownMenuItem>
            {!emissor.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(emissor)}>
                <IconStar className="w-4 h-4 mr-2" />
                Definir como Padrão
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(emissor)}
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
