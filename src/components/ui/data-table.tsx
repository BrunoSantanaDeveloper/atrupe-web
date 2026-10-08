import * as React from 'react'
import { cn } from '@/lib/utils'
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

// ============================================
// DATA TABLE SHELL & ACESSÓRIOS
// Utilitários para envelopar tabelas mantendo o padrão Untitled UI.
// ============================================

export interface DataTableCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Wrapper principal (Card) que engloba a Table completa.
 * Traz as propriedades exatas de sadow da spec: 0px 1px 3px 0 rgba(16,24,40,0.1)...
 */
export function DataTableCard({
  className,
  children,
  ...props
}: DataTableCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden',
        'shadow-[0px_1px_3px_0px_rgba(16,24,40,0.1),_0px_1px_2px_0px_rgba(16,24,40,0.06)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DataTableHeaderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
}

/**
 * Cabeçalho do Card da Tabela (Onde fica o Título, badge contadora e descrição)
 */
export function DataTableHeader({
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: DataTableHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 px-6 pt-5 pb-[19px] bg-white border-b border-gray-200',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          {badge && (
            <div className="flex items-center justify-center px-2 py-0.5 rounded-2xl bg-brand-50">
              <span className="text-xs font-medium text-brand-700">
                {badge}
              </span>
            </div>
          )}
        </div>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

export interface DataTableSortHeadProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  sortDirection?: 'asc' | 'desc' | 'none'
  isActive?: boolean
}

/**
 * Célula de Cabeçalho (TableHead) interativa e com ícone de ordenação.
 */
export function DataTableSortHead({
  title,
  sortDirection = 'none',
  isActive = false,
  className,
  ...props
}: DataTableSortHeadProps) {
  const isSorted = sortDirection !== 'none'

  return (
    <div
      className={cn(
        'flex items-center gap-1 cursor-pointer select-none group transition-colors',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'text-xs font-medium transition-colors',
          isActive || isSorted
            ? 'text-gray-700'
            : 'text-gray-500 group-hover:text-gray-700',
        )}
      >
        {title}
      </span>
      {sortDirection === 'asc' && (
        <Icon icon={IconArrowUp} size="sm" className="text-gray-500" />
      )}
      {sortDirection === 'desc' && (
        <Icon icon={IconArrowDown} size="sm" className="text-gray-500" />
      )}
    </div>
  )
}

export interface DataTableFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Rodapé da Tabela (Reservado para acoplar a Pagination diretamente)
 */
export function DataTableFooter({
  children,
  className,
  ...props
}: DataTableFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between px-6 pt-3 pb-4 bg-white border-t border-gray-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface DataTableFooterSimpleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  onPrevious?: () => void
  onNext?: () => void
  previousLabel?: string
  nextLabel?: string
}

/**
 * Rodapé Simples com "Página X de Y" + botões Anterior/Próximo
 */
export function DataTableFooterSimple({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  previousLabel = 'Anterior',
  nextLabel = 'Próximo',
  className,
  ...props
}: DataTableFooterSimpleProps) {
  return (
    <DataTableFooter className={className} {...props}>
      <p className="text-sm font-medium text-gray-700">
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          disabled={currentPage <= 1}
          className="flex items-center justify-center px-3.5 py-2 rounded-lg bg-white border border-gray-300 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {previousLabel}
        </button>
        <button
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center px-3.5 py-2 rounded-lg bg-white border border-gray-300 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {nextLabel}
        </button>
      </div>
    </DataTableFooter>
  )
}
