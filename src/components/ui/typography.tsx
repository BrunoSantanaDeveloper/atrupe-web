import * as React from 'react'

import { cn } from '@/lib/utils'

import type { TypographyRole } from '@/lib/typography-roles'

// Primitivos de texto (design/openspec/changes/tipografia-e-hierarquia).
// O papel define tamanho, altura de linha, peso e cor; a tag define a
// semântica. Classes extras só para layout ou para uma cor de tom.

const ROLE_CLASS: Record<TypographyRole, string> = {
  'page-title': 'type-page-title',
  'page-subtitle': 'type-page-subtitle',
  'section-title': 'type-section-title',
  'card-title': 'type-card-title',
  'dialog-title': 'type-dialog-title',
  'object-title': 'type-object-title',
  'kpi-value': 'type-kpi-value',
  'kpi-hero': 'type-kpi-hero',
  'kpi-label': 'type-kpi-label',
  body: 'type-body',
  'body-strong': 'type-body-strong',
  secondary: 'type-secondary',
  caption: 'type-caption',
  label: 'type-label',
  helper: 'type-helper',
  eyebrow: 'type-eyebrow',
  'table-header': 'type-table-header',
  'nav-item': 'type-nav-item',
  'nav-group': 'type-nav-group',
}

export function typeRole(role: TypographyRole) {
  return ROLE_CLASS[role]
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

const DEFAULT_HEADING_ROLE: Record<HeadingTag, TypographyRole> = {
  h1: 'page-title',
  h2: 'section-title',
  h3: 'card-title',
  h4: 'body-strong',
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag
  /** Papel tipográfico. Não confundir com o atributo ARIA `role`. */
  variant?: TypographyRole
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = 'h2', variant, className, ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(
        ROLE_CLASS[variant ?? DEFAULT_HEADING_ROLE[Tag]],
        className,
      )}
      {...props}
    />
  ),
)
Heading.displayName = 'Heading'

type TextTag = 'p' | 'span' | 'div' | 'dt' | 'dd' | 'label'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: TextTag
  /** Papel tipográfico. Não confundir com o atributo ARIA `role`. */
  variant?: TypographyRole
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Tag = 'p', variant = 'body', className, ...props }, ref) =>
    React.createElement(Tag, {
      ref,
      className: cn(ROLE_CLASS[variant], className),
      ...props,
    }),
)
Text.displayName = 'Text'
