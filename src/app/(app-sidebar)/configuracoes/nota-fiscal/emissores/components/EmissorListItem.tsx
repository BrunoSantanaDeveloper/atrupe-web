'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  IconBan,
  IconCheck,
  IconClock,
  IconPencil,
  IconBuilding,
  IconChevronDown,
  IconChevronRight,
  IconLock,
  IconDotsVertical,
  IconPlugConnected,
  IconStar,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'

import { useEmissorReadiness } from '../hooks/useEmissorReadiness'
import { ReadinessChecklist } from './ReadinessChecklist'
import type { FiscalEnv } from '../lib/fiscal-readiness'

export type EnvStatus = 'DRAFT' | 'VALIDATING' | 'READY' | 'ERROR' | 'DISABLED'

export interface EmissorEnvironment {
  environment: FiscalEnv
  status: EnvStatus
  cscConfigured: boolean
  lastValidationAt: string | null
  lastValidationError: string | null
  activatedAt: string | null
}

export interface EmissorData {
  id: string
  companyId: string
  name: string
  isDefault: boolean
  environment?: string

  // Estado por ambiente (Plano 2/4)
  activeEnvironment?: FiscalEnv | null
  environmentSwitchLocked?: boolean | null
  environments?: EmissorEnvironment[]

  // Dados da empresa vindo do backend
  company?: {
    id: string
    name?: string
    legalName?: string
    cnpj?: string
    stateRegistration?: string
    municipalRegistration?: string
    providerConfigured?: boolean // substitui o antigo accessKey
    partnerKey?: string
    hasCertificate?: boolean
    certificateExpiresAt?: string | null
    address?: {
      street?: string
      number?: string
      neighborhood?: string
      zipcode?: string
      city?: string
      state?: string
      country?: string
    }
  }

  // Fiscal Configs
  emitCrt?: number | string
  ibgeCode?: string
  ie?: string
  im?: string

  // Fiscal Series
  serieNfe?: number
  proximoNumeroNfe?: number
  serieNfse?: string
  proximoRpsNfse?: number
  codigoServico?: string
  aliquotaIss?: number
  serieNfce?: number
  proximoNumeroNfce?: number
  cscId?: string
  cscConfigured?: boolean
  defaultCfop?: string
  defaultOperationNature?: string
}

type DocTone = 'neutral' | 'warning' | 'success' | 'error'

interface DocState {
  label: string
  tone: DocTone
  activeEnv: FiscalEnv | null
}

export function deriveDocState(emissor: EmissorData): DocState {
  if (!emissor.id || !emissor.environments?.length) {
    return { label: 'Não configurado', tone: 'neutral', activeEnv: null }
  }

  const active = emissor.activeEnvironment ?? null
  const activeCfg = emissor.environments.find((e) => e.environment === active)

  if (!active || !activeCfg) {
    return { label: 'Pendente', tone: 'warning', activeEnv: null }
  }
  if (activeCfg.status === 'ERROR') {
    return { label: 'Erro', tone: 'error', activeEnv: active }
  }
  if (activeCfg.status === 'DISABLED') {
    return { label: 'Desativado', tone: 'neutral', activeEnv: active }
  }
  if (activeCfg.status === 'READY') {
    return {
      label: active === 'PRODUCAO' ? 'Produção' : 'Homologação',
      tone: active === 'PRODUCAO' ? 'success' : 'warning',
      activeEnv: active,
    }
  }
  return { label: 'Pendente', tone: 'warning', activeEnv: active }
}

interface EmissorListItemProps {
  emissor: EmissorData
  onEdit: (
    emissor: EmissorData,
    type?: 'GLOBAL' | 'NFE' | 'NFSE' | 'NFCE',
  ) => void
  onDelete: (emissor: EmissorData) => void
  onSetDefault: (emissor: EmissorData) => void
  onTestConnection: (emissor: EmissorData) => void
  onActivate: (emissor: EmissorData, environment: FiscalEnv) => void
}

const toneClasses: Record<DocTone, string> = {
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  error: 'bg-red-50 border-red-100 text-red-700',
  neutral: 'bg-gray-50 border-gray-100 text-gray-500',
}

const toneIcon: Record<DocTone, React.ReactNode> = {
  success: (
    <div className="p-1 rounded-full bg-emerald-100 text-emerald-600">
      <IconCheck size={16} />
    </div>
  ),
  warning: (
    <div className="p-1 rounded-full bg-amber-100 text-amber-600">
      <IconClock size={16} />
    </div>
  ),
  error: (
    <div className="p-1 rounded-full bg-red-100 text-red-600">
      <IconAlertTriangle size={16} />
    </div>
  ),
  neutral: (
    <div className="p-1 rounded-full bg-gray-100 text-gray-400">
      <IconBan size={16} />
    </div>
  ),
}

const badgeVariantForTone: Record<
  DocTone,
  'success' | 'warning' | 'error' | 'neutral'
> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  neutral: 'neutral',
}

export function EmissorListItem({
  emissor,
  onEdit,
  onDelete,
  onSetDefault,
  onTestConnection,
  onActivate,
}: EmissorListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendenciesOpen, setPendenciesOpen] = useState(false)

  const formatCnpj = (cnpj?: string) => {
    if (!cnpj) return '—'
    const cleaned = cnpj.replace(/\D/g, '')
    if (cleaned.length !== 14) return cnpj
    return cleaned.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5',
    )
  }

  const hasEmissor = !!emissor.id
  const docState = deriveDocState(emissor)
  const switchLocked = emissor.environmentSwitchLocked === true

  // Ambiente alvo do diagnóstico/pendências: o ativo ou produção por padrão.
  const diagnosticsEnv: FiscalEnv = docState.activeEnv ?? 'PRODUCAO'
  const readiness = useEmissorReadiness(
    emissor.id,
    diagnosticsEnv,
    pendenciesOpen,
  )

  const isReady =
    docState.label === 'Produção' || docState.label === 'Homologação'

  const PendenciesPopover = ({ label }: { label: string }) => (
    <Popover open={pendenciesOpen} onOpenChange={setPendenciesOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-current">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <ReadinessChecklist
          data={readiness.data}
          isLoading={readiness.isLoading}
          error={readiness.error ? (readiness.error as Error).message : null}
        />
      </PopoverContent>
    </Popover>
  )

  const NfceCard = () => (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border flex-1 min-w-[200px]',
        toneClasses[docState.tone],
      )}
    >
      <div className="flex items-center gap-4">
        {toneIcon[docState.tone]}
        <div>
          <div className="text-xs font-medium uppercase opacity-70">
            {docState.label}
          </div>
          <div className="font-semibold">NFC-e</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {docState.tone === 'error' && (
          <PendenciesPopover label="Ver pendências" />
        )}

        {isReady ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-current"
              onClick={(e) => {
                e.stopPropagation()
                onTestConnection(emissor)
              }}
              title="Testar autenticação"
            >
              <IconPlugConnected size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-current"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(emissor, 'NFCE')
              }}
              title="Editar"
            >
              <IconPencil size={16} />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-current disabled:opacity-50"
            disabled={switchLocked}
            title={
              switchLocked
                ? 'Ativação de ambiente temporariamente bloqueada'
                : undefined
            }
            onClick={(e) => {
              e.stopPropagation()
              if (!hasEmissor || switchLocked) return
              onActivate(emissor, 'PRODUCAO')
            }}
          >
            <span className="flex items-center gap-2">
              Configurar produção <IconChevronRight size={14} />
            </span>
          </Button>
        )}
      </div>
    </div>
  )

  const SimpleCard = ({
    type,
    editType,
  }: {
    type: string
    editType: 'NFE' | 'NFSE'
  }) => (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border flex-1 min-w-[200px]',
        toneClasses[docState.tone],
      )}
    >
      <div className="flex items-center gap-4">
        {toneIcon[docState.tone]}
        <div>
          <div className="text-xs font-medium uppercase opacity-70">
            {docState.label}
          </div>
          <div className="font-semibold">{type}</div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-white/50 text-current"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(emissor, editType)
        }}
        title="Editar"
      >
        <IconPencil size={18} />
      </Button>
    </div>
  )

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-sm',
        !hasEmissor && 'opacity-80',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'p-4 flex items-center justify-between bg-white',
          'cursor-pointer',
        )}
        onClick={() => {
          if (!hasEmissor) {
            onEdit(emissor, 'GLOBAL')
            return
          }
          setIsExpanded(!isExpanded)
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              hasEmissor
                ? 'bg-brand-50 text-brand-600'
                : 'bg-gray-100 text-gray-500',
            )}
          >
            <IconBuilding size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {emissor.company?.name || emissor.name}
              {emissor.isDefault && (
                <Badge variant="light" className="gap-1">
                  <IconStar size={12} /> Padrão
                </Badge>
              )}
            </h3>
            {emissor.company?.legalName && (
              <p className="text-sm text-gray-500">
                {emissor.company.legalName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isExpanded && (
            <div className="hidden md:flex gap-2 mr-2">
              <Badge
                variant={badgeVariantForTone[docState.tone]}
                className="gap-1"
              >
                {docState.label}
              </Badge>
            </div>
          )}

          {/* Menu de ações */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
                disabled={!hasEmissor}
                title={hasEmissor ? 'Ações' : 'Configure o emissor primeiro'}
              >
                <IconDotsVertical size={18} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={() => onTestConnection(emissor)}
                disabled={!hasEmissor}
              >
                <IconPlugConnected size={16} className="mr-2" />
                Testar autenticação
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSetDefault(emissor)}
                disabled={!hasEmissor || emissor.isDefault}
              >
                <IconStar size={16} className="mr-2" />
                Definir como padrão
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(emissor)}
                disabled={!hasEmissor}
                className="text-red-600 focus:text-red-600"
              >
                <IconTrash size={16} className="mr-2" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            className={cn(
              'transition-transform duration-200',
              isExpanded ? 'rotate-180' : '',
            )}
          >
            {hasEmissor ? (
              <IconChevronDown size={20} className="text-gray-400" />
            ) : (
              <IconLock size={20} className="text-gray-400" />
            )}
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
                {emissor.company?.legalName || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Nome Fantasia
              </p>
              <p className="font-medium text-gray-900">
                {emissor.company?.name || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CNPJ
              </p>
              <p className="font-medium text-gray-900 font-mono">
                {formatCnpj(emissor.company?.cnpj)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CRT
              </p>
              <p className="font-medium text-gray-900">
                {String(emissor.emitCrt) === '1'
                  ? 'Simples Nacional'
                  : String(emissor.emitCrt) === '3'
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
                {emissor.company?.address?.street},{' '}
                {emissor.company?.address?.number}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Bairro
              </p>
              <p className="font-medium text-gray-900">
                {emissor.company?.address?.neighborhood || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Cidade/UF
              </p>
              <p className="font-medium text-gray-900">
                {emissor.company?.address?.city} -{' '}
                {emissor.company?.address?.state}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                CEP
              </p>
              <p className="font-medium text-gray-900">
                {emissor.company?.address?.zipcode || '—'}
              </p>
            </div>
          </div>

          {/* Status Cards */}
          <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-100">
            <SimpleCard type="NF-e" editType="NFE" />
            <SimpleCard type="NFS-e" editType="NFSE" />
            <NfceCard />
          </div>
        </div>
      )}
    </div>
  )
}
