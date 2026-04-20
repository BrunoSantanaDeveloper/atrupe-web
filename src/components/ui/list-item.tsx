import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const listItemVariants = cva(
  'flex w-full items-start gap-4 p-3 rounded-lg transition-colors hover:bg-gray-50 focus:bg-gray-50 outline-none cursor-pointer',
  {
    variants: {
      size: {
        default: '',
        sm: 'gap-3 p-2',
      },
      interactive: {
        true: 'cursor-pointer',
        false: 'cursor-default pointer-events-none hover:bg-transparent',
      },
    },
    defaultVariants: {
      size: 'default',
      interactive: true,
    },
  },
)

const iconContainerVariants = cva(
  'flex-shrink-0 flex items-center justify-center rounded-full',
  {
    variants: {
      size: {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
      },
      theme: {
        default: 'bg-transparent text-gray-500',
        brand: 'bg-[#A9F1CC] text-[#077550] border border-transparent', // Figma matching
        light: 'bg-white text-gray-700 border border-gray-200 shadow-sm',
      },
    },
    defaultVariants: {
      size: 'md',
      theme: 'default',
    },
  },
)

export interface ListItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof listItemVariants> {
  icon?: React.ReactNode
  iconSize?: 'sm' | 'md'
  iconTheme?: 'default' | 'brand' | 'light'
  title: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  action?: string | React.ReactNode
  onActionClick?: () => void
  trailingIcon?: React.ReactNode
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  (
    {
      className,
      size,
      interactive,
      icon,
      iconSize = 'md',
      iconTheme = 'brand',
      title,
      subtitle,
      badge,
      action,
      onActionClick,
      trailingIcon,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(listItemVariants({ size, interactive }), className)}
        {...props}
      >
        {/* LEADING ICON PORTION */}
        {icon && (
          <div
            className={iconContainerVariants({
              size: iconSize,
              theme: iconTheme,
            })}
          >
            {icon}
          </div>
        )}

        {/* CONTENT PORTION */}
        <div className="flex flex-col items-start flex-grow min-w-0 gap-3">
          <div className="flex flex-col w-full gap-1">
            <div className="flex items-center w-full gap-2">
              <span className="flex-grow min-w-0 truncate text-base font-semibold text-[#101828]">
                {title}
              </span>

              {/* OPTIONAL BADGE */}
              {badge && (
                <div className="flex-shrink-0 px-2.5 py-0.5 rounded-2xl bg-[#ecfdf3] mix-blend-multiply">
                  <span className="text-sm font-medium text-[#027a48]">
                    {badge}
                  </span>
                </div>
              )}

              {/* TRAILING ICON (Checkmarks, carets) */}
              {trailingIcon && (
                <div className="flex-shrink-0 text-gray-400">
                  {trailingIcon}
                </div>
              )}
            </div>

            {/* OPTIONAL SUBTITLE */}
            {subtitle && (
              <span className="w-full text-sm text-[#667085]">{subtitle}</span>
            )}
          </div>

          {/* OPTIONAL CTA / LEARN MORE */}
          {action && (
            <div
              className="flex items-center gap-2 mt-0 cursor-pointer group"
              onClick={(e) => {
                if (onActionClick) {
                  e.stopPropagation()
                  onActionClick()
                }
              }}
            >
              {typeof action === 'string' ? (
                <>
                  <span className="text-sm font-semibold text-[#085d40] group-hover:underline">
                    {action}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-[#085d40] transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M4.16663 10H15.8333M15.8333 10L10 4.16663M15.8333 10L10 15.8333"
                      stroke="currentColor"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              ) : (
                action
              )}
            </div>
          )}
        </div>
      </div>
    )
  },
)
ListItem.displayName = 'ListItem'
