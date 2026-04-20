import * as React from 'react'
import { ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ButtonProps, buttonVariants } from '@/components/ui/button'

import Link from 'next/link'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
  isActive?: boolean
  activeVariant?: 'brand' | 'success' | 'dark'
} & Pick<ButtonProps, 'size' | 'variant' | 'rounded'> &
  React.ComponentProps<typeof Link>

const PaginationLink = ({
  className,
  isActive,
  activeVariant = 'brand',
  variant,
  size = 'icon',
  rounded,
  ...props
}: PaginationLinkProps) => {
  let defaultVariant: any = variant || 'neutralLight'

  if (isActive && !variant) {
    if (activeVariant === 'brand') defaultVariant = 'light'
    if (activeVariant === 'success') defaultVariant = 'successLight'
    if (activeVariant === 'dark') defaultVariant = 'neutral'
  }

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: defaultVariant,
          size,
          rounded,
        }),
        isActive && activeVariant === 'brand' && !variant
          ? 'bg-brand-50 text-brand-700'
          : '',
        isActive && activeVariant === 'success' && !variant
          ? 'bg-success-100 text-success-800'
          : '',
        className,
      )}
      {...props}
    />
  )
}
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({
  className,
  variant = 'neutralOutline',
  size = 'default',
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir para página anterior"
    size={size}
    variant={variant}
    className={cn(size === 'icon' ? '' : 'gap-1 pl-2.5', className)}
    {...props}
  >
    <ArrowLeft className="h-4 w-4" />
    {size !== 'icon' && <span>Anterior</span>}
  </PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({
  className,
  variant = 'neutralOutline',
  size = 'default',
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir para próxima página"
    size={size}
    variant={variant}
    className={cn(size === 'icon' ? '' : 'gap-1 pr-2.5', className)}
    {...props}
  >
    {size !== 'icon' && <span>Próximo</span>}
    <ArrowRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Mais páginas</span>
  </span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
