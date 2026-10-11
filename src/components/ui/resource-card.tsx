import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const resourceCardVariants = cva('flex relative gap-6 rounded-lg', {
  variants: {
    layout: {
      horizontal: 'flex-row items-start p-3 w-[560px] max-w-full',
      vertical: 'flex-col items-start p-3 w-80 max-w-full',
      'vertical-fluid': 'flex-col items-start px-4 py-3 w-full sm:w-[375px]',
    },
  },
  defaultVariants: {
    layout: 'horizontal',
  },
})

const resourceMediaVariants = cva(
  'relative overflow-hidden rounded-md flex-shrink-0 flex-grow-0',
  {
    variants: {
      layout: {
        horizontal: 'w-44 h-[104px]',
        vertical: 'w-60 h-[136px]',
        'vertical-fluid': 'w-full h-[200px] object-cover',
      },
    },
    defaultVariants: {
      layout: 'horizontal',
    },
  },
)

export interface ResourceCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof resourceCardVariants> {
  media: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  classNames?: {
    media?: string
    content?: string
    title?: string
    subtitle?: string
    actions?: string
  }
}

export function ResourceCard({
  layout,
  className,
  media,
  title,
  subtitle,
  actions,
  classNames,
  ...props
}: ResourceCardProps) {
  return (
    <div className={cn(resourceCardVariants({ layout, className }))} {...props}>
      <div className={cn(resourceMediaVariants({ layout }), classNames?.media)}>
        {media}
      </div>
      <div
        className={cn(
          'flex flex-col justify-start items-start flex-grow gap-3 w-full min-w-0',
          classNames?.content,
        )}
      >
        <div className="flex flex-col relative gap-1 w-full">
          <div
            className={cn(
              'text-base font-semibold text-gray-900 truncate whitespace-normal line-clamp-2',
              classNames?.title,
            )}
          >
            {title}
          </div>
          {subtitle && (
            <div className={cn('text-sm text-gray-500', classNames?.subtitle)}>
              {subtitle}
            </div>
          )}
        </div>
        {actions && (
          <div className={cn('flex items-center gap-3', classNames?.actions)}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
