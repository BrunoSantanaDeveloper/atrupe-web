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
  IconBuilding,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconPlugConnected,
  IconCertificate,
} from '@tabler/icons-react'

// Types
export interface EmissorData {
  id: string
  name: string
  isDefault: boolean
  emitCnpj?: string
  emitRazaoSocial?: string
  emitNomeFantasia?: string
  environment?: string
  hasCertificate?: boolean
  accessKey?: string
}

interface EmissorCardProps {
  emissor: EmissorData
  onEdit: (emissor: EmissorData) => void
  onDelete: (emissor: EmissorData) => void
  onSetDefault: (emissor: EmissorData) => void
  onTestConnection: (emissor: EmissorData) => void
  isLoading?: boolean
}

export function EmissorCard({
  emissor,
  onEdit,
  onDelete,
  onSetDefault,
  onTestConnection,
  isLoading = false,
}: EmissorCardProps) {
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <IconBuilding className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{emissor.name}</h3>
              {emissor.isDefault && (
                <Badge variant="neutral" className="gap-1">
                  <IconStarFilled className="w-3 h-3" />
                  Padrão
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {emissor.emitNomeFantasia ||
                emissor.emitRazaoSocial ||
                'Não configurado'}
            </p>
          </div>
        </div>

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
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">CNPJ</p>
          <p className="text-sm font-medium text-gray-700">
            {formatCnpj(emissor.emitCnpj)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            Ambiente
          </p>
          <p className="text-sm font-medium text-gray-700">
            {emissor.environment === 'PRODUCAO' ? (
              <span className="text-green-600">Produção</span>
            ) : (
              <span className="text-amber-600">Homologação</span>
            )}
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <div
          className={`flex items-center gap-1.5 text-xs ${emissor.hasCertificate ? 'text-green-600' : 'text-gray-400'
            }`}
        >
          <IconCertificate className="w-4 h-4" />
          {emissor.hasCertificate ? 'Certificado OK' : 'Sem certificado'}
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs ${isConfigured ? 'text-green-600' : 'text-amber-600'
            }`}
        >
          <IconPlugConnected className="w-4 h-4" />
          {isConfigured ? 'Configurado' : 'Pendente'}
        </div>
      </div>
    </div>
  )
}
