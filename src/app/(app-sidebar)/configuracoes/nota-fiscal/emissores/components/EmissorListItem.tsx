'use client'

import { useState } from 'react'
import { EmissorData } from './EmissorRow' // Reusing type
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconTrash,
  IconCheck,
  IconClock,
  IconBan,
  IconBuilding,
  IconPrinter,
  IconFileInvoice,
  IconChevronRight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface EmissorListItemProps {
  emissor: EmissorData
  onEdit: (
    emissor: EmissorData,
    type?: 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE',
  ) => void
  onDelete: (emissor: EmissorData) => void
}

export function EmissorListItem({
  emissor,
  onEdit,
  onDelete,
}: EmissorListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatCnpj = (cnpj?: string) => {
    if (!cnpj) return '—'
    const cleaned = cnpj.replace(/\D/g, '')
    if (cleaned.length !== 14) return cnpj
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    )
  }

  const getStatusColor = (
    status: 'PRODUCTION' | 'HOMOLOGATION' | 'DISABLED',
  ) => {
    switch (status) {
      case 'PRODUCTION':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700'
      case 'HOMOLOGATION':
        return 'bg-amber-50 border-amber-100 text-amber-700'
      case 'DISABLED':
        return 'bg-gray-50 border-gray-100 text-gray-400'
      default:
        return 'bg-gray-50 border-gray-100 text-gray-500'
    }
  }

  const getStatusIcon = (
    status: 'PRODUCTION' | 'HOMOLOGATION' | 'DISABLED',
  ) => {
    switch (status) {
      case 'PRODUCTION':
        return (
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
            <IconCheck size={16} />
          </div>
        )
      case 'HOMOLOGATION':
        return (
          <div className="p-1 rounded-full bg-amber-100 text-amber-600">
            <IconClock size={16} />
          </div>
        )
      case 'DISABLED':
        return (
          <div className="p-1 rounded-full bg-gray-100 text-gray-400">
            <IconBan size={16} />
          </div>
        )
    }
  }

  // Helper to determine status based on emissor config
  const isConfigured = !!emissor.id && !!emissor.accessKey

  const envStatus = !isConfigured
    ? 'DISABLED'
    : emissor.environment === 'PRODUCAO'
      ? 'PRODUCTION'
      : 'HOMOLOGATION'

  const StatusCard = ({
    title,
    type,
    status,
    onAction,
  }: {
    title: string
    type: string
    status: 'PRODUCTION' | 'HOMOLOGATION' | 'DISABLED'
    onAction: () => void
  }) => (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border flex-1 min-w-[200px]',
        getStatusColor(status),
      )}
    >
      <div className="flex items-center gap-4">
        {getStatusIcon(status)}
        <div>
          <div className="text-xs font-medium uppercase opacity-70">
            {status === 'PRODUCTION'
              ? 'Produção'
              : status === 'HOMOLOGATION'
                ? 'Homologação'
                : 'Desabilitado'}
          </div>
          <div className="font-semibold">{type}</div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-2 hover:bg-white/50',
          status === 'DISABLED' ? 'text-gray-500' : 'text-current',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onAction()
        }}
      >
        {status === 'DISABLED' && type !== 'NFC-e' ? (
          <span className="flex items-center gap-2">
            Configurar <IconChevronRight size={14} />
          </span>
        ) : type === 'NFC-e' ? (
          <span className="text-xs opacity-50">Indisponível</span>
        ) : (
          <IconPencil size={18} />
        )}
      </Button>
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-sm">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer bg-white"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              isConfigured
                ? 'bg-brand-50 text-brand-600'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            <IconBuilding size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {emissor.emitRazaoSocial || emissor.name}
            </h3>
            {emissor.emitNomeFantasia && (
              <p className="text-sm text-gray-500">
                {emissor.emitNomeFantasia}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badges for collapsed view */}
          {!isExpanded && (
            <div className="hidden md:flex gap-2 mr-4">
              {isConfigured ? (
                <div className="flex gap-2">
                  <Badge
                    variant={envStatus === 'PRODUCTION' ? 'success' : 'warning'}
                    className="gap-1"
                  >
                    {envStatus === 'PRODUCTION' ? 'NF-e Prod' : 'NF-e Homol'}
                  </Badge>
                  <Badge
                    variant={envStatus === 'PRODUCTION' ? 'success' : 'warning'}
                    className="gap-1"
                  >
                    {envStatus === 'PRODUCTION' ? 'NFS-e Prod' : 'NFS-e Homol'}
                  </Badge>
                </div>
              ) : (
                <Badge variant="neutral" className="gap-1 text-gray-500">
                  Não Configurado
                </Badge>
              )}
            </div>
          )}

          <div
            className={cn(
              'transition-transform duration-200',
              isExpanded ? 'rotate-180' : '',
            )}
          >
            <IconChevronDown size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Razão Social
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitRazaoSocial || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Nome Fantasia
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitNomeFantasia || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CNPJ
              </p>
              <p className="font-medium text-gray-900 font-mono">
                {formatCnpj(emissor.emitCnpj)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CRT
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitCrt === '1'
                  ? 'Simples Nacional'
                  : emissor.emitCrt === '3'
                    ? 'Regime Normal'
                    : 'Outro'}
              </p>
            </div>
            {/* Row 2 */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Endereço
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitEndereco}, {emissor.emitNumero}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Bairro
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitBairro || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Cidade/UF
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitCmun} - {emissor.emitUf}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CEP
              </p>
              <p className="font-medium text-gray-900">
                {emissor.emitCep || '—'}
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
            <StatusCard
              title="NF-e"
              type="NF-e"
              status={envStatus}
              onAction={() => onEdit(emissor, 'NFE')}
            />
            <StatusCard
              title="NFS-e"
              type="NFS-e"
              status={envStatus} // Assuming same env for now
              onAction={() => onEdit(emissor, 'NFSE')}
            />
            <StatusCard
              title="NFC-e"
              type="NFC-e"
              status={envStatus}
              onAction={() => onEdit(emissor, 'NFCE')}
            />
          </div>
        </div>
      )}
    </div>
  )
}
