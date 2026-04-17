import * as React from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  IconFileText,
  IconCreditCard,
  IconTrash,
  IconEdit,
  IconDotsVertical,
} from '@tabler/icons-react'

// ============================================
// COMPONENTES DE CONTEÚDO DE CÉLULA (TABLE CELLS)
// Baseados nas definições geométricas e hierarquia visual do Figma
// ============================================

export interface CellTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  subtitle?: React.ReactNode
}

/**
 * Padrão base: Title forte e Subtitle mais opaco.
 */
export function CellText({
  title,
  subtitle,
  className,
  ...props
}: CellTextProps) {
  return (
    <div
      className={cn('flex flex-col justify-start items-start', className)}
      {...props}
    >
      <p className="text-sm font-medium text-[#101828]">{title}</p>
      {subtitle && <p className="text-sm text-[#667085]">{subtitle}</p>}
    </div>
  )
}

export interface CellUserProps extends CellTextProps {
  avatarUrl?: string
  avatarFallback?: string
  avatarSize?: 'sm' | 'md' | 'lg'
}

/**
 * Célula de Usuário (Avatar + Nome + E-mail)
 */
export function CellUser({
  avatarUrl,
  avatarFallback,
  title,
  subtitle,
  avatarSize = 'md',
  className,
  ...props
}: CellUserProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      {(avatarUrl || avatarFallback) && (
        <Avatar className={sizeMap[avatarSize]}>
          {avatarUrl && <AvatarImage src={avatarUrl} />}
          <AvatarFallback className="bg-[#c7b9da] text-white text-xs">
            {avatarFallback ?? title?.toString().substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <CellText title={title} subtitle={subtitle} />
    </div>
  )
}

export interface CellFileProps extends CellTextProps {
  iconBgColor?: string
  iconColor?: string
  icon?: React.ReactNode
}

/**
 * Célula de Arquivo (Ícone circular + Nome do Arquivo + Tamanho/Info)
 */
export function CellFile({
  title,
  subtitle,
  iconBgColor = 'bg-[#A9F1CC]',
  iconColor = 'text-[#077550]',
  icon,
  className,
  ...props
}: CellFileProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-[20px] shrink-0',
          iconBgColor,
          iconColor,
        )}
      >
        {icon ?? <IconFileText className="w-5 h-5" />}
      </div>
      <CellText title={title} subtitle={subtitle} />
    </div>
  )
}

export interface CellPaymentProps extends CellTextProps {
  icon?: React.ReactNode
}

/**
 * Célula de Pagamento (Cartão Ícone + Bandeira/Final + Validade)
 */
export function CellPayment({
  title,
  subtitle,
  icon,
  className,
  ...props
}: CellPaymentProps) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <div className="flex items-center justify-center w-[46px] h-8 bg-white border border-[#F2F4F7] rounded-md shrink-0 shadow-sm text-[#172B85]">
        {icon ?? <IconCreditCard className="w-6 h-6" />}
      </div>
      <CellText title={title} subtitle={subtitle} />
    </div>
  )
}

export interface CellProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  label?: string
}

/**
 * Célula de Progresso Linear
 */
export function CellProgress({
  value,
  label,
  className,
  ...props
}: CellProgressProps) {
  return (
    <div
      className={cn('flex items-center gap-3 w-full max-w-[280px]', className)}
      {...props}
    >
      <div className="flex-grow">
        <Progress
          value={value}
          className="h-2"
          indicatorClassName="bg-[#099260]"
        />
      </div>
      <span className="text-sm font-medium text-[#344054] min-w-[36px]">
        {label ?? `${value}%`}
      </span>
    </div>
  )
}

export interface CellAvatarGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  users: Array<{ src?: string; fallback: string }>
  max?: number
  total?: number
  size?: 'sm' | 'md'
}

/**
 * Célula de Grupo de Avatares (com indicador de "+X" restantes)
 */
export function CellAvatarGroup({
  users,
  max = 5,
  total,
  size = 'md',
  className,
  ...props
}: CellAvatarGroupProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = (total ?? users.length) - visibleUsers.length

  const szClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'

  return (
    <div
      className={cn('flex items-center space-x-[-8px]', className)}
      {...props}
    >
      {visibleUsers.map((u, i) => (
        <Avatar key={i} className={cn('border-2 border-white', szClass)}>
          <AvatarImage src={u.src} />
          <AvatarFallback className="bg-[#bea887] text-white">
            {u.fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-white bg-[#d2f9e3] text-[#38cf8f] font-medium shrink-0 z-10',
            szClass,
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  )
}

export interface CellActionGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onEdit?: () => void
  onDelete?: () => void
  editText?: string
  deleteText?: string
  mode?: 'text' | 'icon'
}

/**
 * Célula de Ações Básicas (Edit/Delete em formato texto link ou ícone)
 */
export function CellActionGroup({
  onEdit,
  onDelete,
  editText = 'Edit',
  deleteText = 'Delete',
  mode = 'text',
  className,
  ...props
}: CellActionGroupProps) {
  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {onDelete && (
        <button
          onClick={onDelete}
          className="cursor-pointer text-sm font-semibold text-[#667085] hover:text-[#344054] transition-colors"
        >
          {mode === 'text' ? (
            deleteText
          ) : (
            <IconTrash className="w-5 h-5 text-[#667085]" />
          )}
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="cursor-pointer text-sm font-semibold text-[#667085] hover:text-[#344054] transition-colors"
        >
          {mode === 'text' ? (
            editText
          ) : (
            <IconEdit className="w-5 h-5 text-[#667085]" />
          )}
        </button>
      )}
      {mode === 'icon' && !onEdit && !onDelete && (
        <button className="cursor-pointer text-[#98A2B3] hover:text-[#667085] transition-colors">
          <IconDotsVertical className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

// ============================================
// TREND BADGE (Seta ↑↓ + Percentual)
// Figma: Badge pill com seta e percentual colorido
// ============================================

export interface CellTrendProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | string
  direction: 'up' | 'down'
}

/**
 * Célula de Tendência (Ex: ↑5% verde ou ↓4% vermelho)
 */
export function CellTrend({
  value,
  direction,
  className,
  ...props
}: CellTrendProps) {
  const isUp = direction === 'up'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-2xl text-xs font-medium',
        isUp ? 'bg-[#ecfdf3] text-[#027a48]' : 'bg-[#fef3f2] text-[#b42318]',
        className,
      )}
      {...props}
    >
      <svg
        width={12}
        height={12}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3"
      >
        <path
          d={
            isUp
              ? 'M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6'
              : 'M6 2.5V9.5M6 9.5L9.5 6M6 9.5L2.5 6'
          }
          stroke={isUp ? '#12B76A' : '#F04438'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{typeof value === 'number' ? `${value}%` : value}</span>
    </div>
  )
}

// ============================================
// BADGE GROUP CELL (Múltiplas badges inline)
// Figma: "License use" column com [Active] [Customer data] [Admin] [+4]
// ============================================

export interface CellBadgeItem {
  label: string
  color?: 'green' | 'blue' | 'indigo' | 'pink' | 'orange' | 'gray' | 'brand'
  dot?: boolean
}

export interface CellBadgeGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  badges: CellBadgeItem[]
  max?: number
}

const badgeColorMap: Record<string, string> = {
  green: 'bg-[#ecfdf3] text-[#027a48]',
  blue: 'bg-[#eff8ff] text-[#175cd3]',
  indigo: 'bg-[#eef4ff] text-[#3538cd]',
  pink: 'bg-[#fdf2fa] text-[#c11574]',
  orange: 'bg-[#fff6ed] text-[#c4320a]',
  gray: 'bg-[#f8f9fc] text-[#363f72]',
  brand: 'bg-[#d2f9e3] text-[#085d40]',
}

const dotColorMap: Record<string, string> = {
  green: 'bg-[#12B76A]',
  gray: 'bg-[#667085]',
}

/**
 * Grupo de badges coloridas em linha (usado em colunas "License use", "Tags", etc.)
 */
export function CellBadgeGroup({
  badges,
  max = 4,
  className,
  ...props
}: CellBadgeGroupProps) {
  const visible = badges.slice(0, max)
  const remaining = badges.length - visible.length

  return (
    <div
      className={cn('flex items-center gap-1 flex-wrap', className)}
      {...props}
    >
      {visible.map((b, i) => (
        <span
          key={i}
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-2xl text-xs font-medium',
            b.dot ? 'pl-1.5 pr-2' : '',
            badgeColorMap[b.color ?? 'gray'],
          )}
        >
          {b.dot && (
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                dotColorMap[b.color ?? 'gray'] ?? 'bg-[#12B76A]',
              )}
            />
          )}
          {b.label}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-2xl text-xs font-medium bg-[#f2f4f7] text-[#344054]">
          +{remaining}
        </span>
      )}
    </div>
  )
}
