'use client'

import { IconInfoCircle } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { FeatureEnforcementLevel } from '@/types/planConfig'

export const MATRIX_QUERY_KEY = ['admin-plan-matrix']
export const HISTORY_QUERY_KEY = ['admin-plan-history']
/** A tela de disponibilidade e a troca de plano em Gerenciar contas usam esta. */
export const MANAGEABLE_PLANS_QUERY_KEY = ['admin-manageable-plans']

const ENFORCEMENT_BADGE: Record<
  FeatureEnforcementLevel,
  { label: string; variant: 'successLight' | 'warningLight' | 'neutralLight' }
> = {
  api: { label: 'Bloqueio na API', variant: 'successLight' },
  tela: { label: 'Só na tela', variant: 'warningLight' },
  nenhum: { label: 'Sem efeito ainda', variant: 'neutralLight' },
}

/** Onde o recurso é aplicado quando o plano não o inclui. */
export function EnforcementBadge({
  level,
  detail,
}: {
  level: FeatureEnforcementLevel
  detail: string
}) {
  const badge = ENFORCEMENT_BADGE[level]
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Badge variant={badge.variant} className="whitespace-nowrap">
              {badge.label}
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{detail}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function InfoHint({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-gray-400">
            <IconInfoCircle size={16} />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Senha gerencial: só aparece quando a alteração atinge assinaturas. */
export function ManagerPasswordField({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="manager-password" className="text-sm text-gray-700">
        Senha gerencial
      </Label>
      <Input
        id="manager-password"
        type="password"
        autoComplete="current-password"
        placeholder="Sua senha de superadmin"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-gray-500">
        Pedida porque a alteração atinge assinaturas em vigor.
      </p>
    </div>
  )
}

export const pluralize = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

export const subscriptionsLabel = (count: number) =>
  pluralize(count, 'assinatura atual', 'assinaturas atuais')

export const limitLabel = (value: number | null | undefined) =>
  value === null || value === undefined
    ? '—'
    : value === -1
      ? 'Ilimitado'
      : String(value)

export const PROPAGATION_NOTE =
  'A API obedece na hora. Quem está com o sistema aberto vê a mudança no menu em até 5 minutos ou ao recarregar a página.'
