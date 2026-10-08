import * as React from 'react'
import { IconArrowLeft, IconArrowRight, IconDots } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

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
  let defaultVariant: ButtonProps['variant'] = variant || 'neutralLight'

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
    <Icon icon={IconArrowLeft} size="md" />
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
    <Icon icon={IconArrowRight} size="md" />
  </PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-10 w-10 items-center justify-center', className)}
    {...props}
  >
    <Icon icon={IconDots} size="sm" />
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
