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
import { ContingenciaNfceDialog } from './ContingenciaNfceDialog'
import { InutilizarNfceDialog } from './InutilizarNfceDialog'

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

// Antes só 1 e 3 tinham rótulo e o resto caía em "Outro" — com o Regime
// Normal liberado, 2 passou a ser escolhível e apareceria sem nome.
const CRT_LABELS: Record<string, string> = {
  '1': 'Simples Nacional',
  '2': 'Simples Nacional - Excesso de sublimite',
  '3': 'Regime Normal',
  '4': 'MEI',
}

export type EnvStatus = 'DRAFT' | 'VALIDATING' | 'READY' | 'ERROR' | 'DISABLED'
export type FiscalDocType = 'NFE' | 'NFSE' | 'NFCE'

export interface EmissorEnvironment {
  environment: FiscalEnv
  docType: FiscalDocType
  status: EnvStatus
  cscConfigured: boolean
  lastValidationAt: string | null
  lastValidationError: string | null
  activatedAt: string | null
  // Numeração desta linha (emissor + ambiente + docType). Homologação e
  // produção têm sequências independentes e é daqui que a emissão tira o
  // número — os campos legados de EmissorData são globais.
  series?: number | string | null
  nextNumber?: number | null
}

/** Numeração efetiva de um documento: a do ambiente ativo dele. */
export interface EmissorActiveNumbering {
  environment: FiscalEnv
  series: number | string
  nextNumber: number
}

export interface EmissorData {
  id: string
  companyId: string
  name: string
  isDefault: boolean
  environment?: string

  // Estado por ambiente (Plano 2/4)
  activeEnvironment?: FiscalEnv | null
  activeEnvironmentNfe?: FiscalEnv | null
  activeEnvironmentNfse?: FiscalEnv | null
  activeEnvironmentNfce?: FiscalEnv | null
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
  isActive?: boolean
  defaultNcm?: string
  prazoCancelamentoNfce?: number

  // Contingência NFC-e (emissão offline quando a SEFAZ está indisponível)
  contingenciaNfceAtiva?: boolean
  contingenciaNfceMotivo?: string | null
  contingenciaNfceDataHora?: string | null

  // Numeração efetiva por documento (linha do ambiente ativo). É o que a
  // emissão consome — preferir isto aos campos legados abaixo, que são globais
  // e não distinguem homologação de produção.
  activeNumbering?: {
    nfe: EmissorActiveNumbering
    nfce: EmissorActiveNumbering
    nfse: EmissorActiveNumbering
  }

  // Fiscal Series (legado — global, sem ambiente)
  serieNfe?: number
  proximoNumeroNfe?: number
  serieNfse?: string
  proximoRpsNfse?: number
  codigoServico?: string
  aliquotaIss?: number
  regimeEspecialTributacao?: number | null
  serieNfce?: number
  proximoNumeroNfce?: number
  cscId?: string
  cscConfigured?: boolean
  defaultCfop?: string
  defaultOperationNature?: string

  // Informações complementares e envio
  taxInfoText?: string
  sendDanfeXmlAutomatically?: boolean
  sendDanfeAutomatically?: boolean
  sendXmlAutomatically?: boolean
  sendFiscalEmailCopyTo?: string
}

type DocTone = 'neutral' | 'warning' | 'success' | 'error'

interface DocState {
  label: string
  tone: DocTone
  activeEnv: FiscalEnv | null
}

export function deriveDocState(
  emissor: EmissorData,
  docType: FiscalDocType = 'NFCE',
): DocState {
  if (!emissor.id || !emissor.environments?.length) {
    return { label: 'Pendente', tone: 'warning', activeEnv: null }
  }

  // Resolve o ambiente ativo específico para este docType
  const active =
    docType === 'NFE'
      ? (emissor.activeEnvironmentNfe ?? null)
      : docType === 'NFSE'
        ? (emissor.activeEnvironmentNfse ?? null)
        : (emissor.activeEnvironmentNfce ?? emissor.activeEnvironment ?? null)

  const activeCfg = emissor.environments.find(
    (e) => e.environment === active && e.docType === docType,
  )

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
  onActivate: (
    emissor: EmissorData,
    environment: FiscalEnv,
    docType: 'NFE' | 'NFSE' | 'NFCE',
  ) => void
  /** Recarrega a lista após ações que mudam o estado do emissor. */
  onRefresh?: () => void
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
  onRefresh,
}: EmissorListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendenciesOpen, setPendenciesOpen] = useState(false)
  const [contingenciaOpen, setContingenciaOpen] = useState(false)
  const [inutilizarOpen, setInutilizarOpen] = useState(false)

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
  const nfeState = deriveDocState(emissor, 'NFE')
  const nfseState = deriveDocState(emissor, 'NFSE')
  const nfceState = deriveDocState(emissor, 'NFCE')
  // docState global usado no badge do header (prioriza produção, senão o mais avançado)
  const docState =
    [nfceState, nfeState, nfseState].find((s) => s.label === 'Produção') ??
    nfceState
  const switchLocked = emissor.environmentSwitchLocked === true

  // Ambiente alvo do diagnóstico/pendências: o ativo do NFC-e ou produção por padrão.
  const diagnosticsEnv: FiscalEnv = nfceState.activeEnv ?? 'PRODUCAO'
  const readiness = useEmissorReadiness(
    emissor.id,
    diagnosticsEnv,
    pendenciesOpen,
  )

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

  const DocCard = ({
    type,
    editType,
    cardState,
  }: {
    type: string
    editType: FiscalDocType
    cardState: DocState
  }) => {
    const ready =
      cardState.label === 'Produção' || cardState.label === 'Homologação'
    return (
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border flex-1 min-w-[200px]',
          toneClasses[cardState.tone],
        )}
      >
        <div className="flex items-center gap-4">
          {toneIcon[cardState.tone]}
          <div>
            <div className="text-xs font-medium uppercase opacity-70">
              {cardState.label}
            </div>
            <div className="font-semibold">{type}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {cardState.tone === 'error' && (
            <PendenciesPopover label="Ver pendências" />
          )}

          {ready ? (
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
                  onEdit(emissor, editType)
                }}
                title="Editar"
              >
                <IconPencil size={16} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-current"
                    onClick={(e) => e.stopPropagation()}
                    title="Mais opções"
                  >
                    <IconDotsVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onActivate(
                        emissor,
                        cardState.activeEnv === 'PRODUCAO'
                          ? 'HOMOLOGACAO'
                          : 'PRODUCAO',
                        editType,
                      )
                    }}
                  >
                    {cardState.activeEnv === 'PRODUCAO'
                      ? 'Mudar para homologação'
                      : 'Mudar para produção'}
                  </DropdownMenuItem>

                  {/*
                    Contingência e inutilização são exclusivas da NFC-e e até
                    aqui só existiam como endpoint, sem nenhuma tela.
                  */}
                  {editType === 'NFCE' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setContingenciaOpen(true)
                        }}
                      >
                        {emissor.contingenciaNfceAtiva
                          ? 'Desativar contingência'
                          : 'Ativar contingência'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-error-600 focus:text-error-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setInutilizarOpen(true)
                        }}
                      >
                        Inutilizar faixa de numeração
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : switchLocked ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-current disabled:opacity-50"
              disabled
              title="Ativação de ambiente temporariamente bloqueada"
            >
              <span className="flex items-center gap-2">
                Configurar <IconChevronRight size={14} />
              </span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-current"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="flex items-center gap-2">
                    Configurar <IconChevronRight size={14} />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onActivate(emissor, 'PRODUCAO', editType)
                  }}
                >
                  Ativar produção
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onActivate(emissor, 'HOMOLOGACAO', editType)
                  }}
                >
                  Testar em homologação
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    )
  }

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
              {/* Único acesso ao editor completo depois que o emissor existe:
                  os lápis dos cartões abrem só as abas daquele documento, e
                  Certificado e Envio ficavam sem nenhuma porta de entrada. */}
              <DropdownMenuItem
                onClick={() => onEdit(emissor, 'GLOBAL')}
                disabled={!hasEmissor}
              >
                <IconPencil size={16} className="mr-2" />
                Editar emissor
              </DropdownMenuItem>
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
                {CRT_LABELS[String(emissor.emitCrt)] ?? 'Não informado'}
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
            <DocCard type="NF-e" editType="NFE" cardState={nfeState} />
            <DocCard type="NFS-e" editType="NFSE" cardState={nfseState} />
            <DocCard type="NFC-e" editType="NFCE" cardState={nfceState} />
          </div>
        </div>
      )}

      <ContingenciaNfceDialog
        open={contingenciaOpen}
        onOpenChange={setContingenciaOpen}
        ativa={!!emissor.contingenciaNfceAtiva}
        motivoAtual={emissor.contingenciaNfceMotivo}
        dataHoraAtual={emissor.contingenciaNfceDataHora}
        onSuccess={onRefresh}
      />

      <InutilizarNfceDialog
        open={inutilizarOpen}
        onOpenChange={setInutilizarOpen}
        serie={emissor.serieNfce}
        onSuccess={onRefresh}
      />
    </div>
  )
}
