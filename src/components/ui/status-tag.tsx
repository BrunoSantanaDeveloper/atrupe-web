import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { IconFileDescription } from '@tabler/icons-react'

const statusTagWrapperVariants = cva(
  'inline-flex flex-col items-start relative select-none',
  {
    variants: {
      size: {
        sm: '',
        md: '',
        lg: '',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const statusTabVariants = cva(
  'flex justify-center items-center font-bold text-white tracking-wide z-10 relative left-[-2px] top-[2px]',
  {
    variants: {
      variant: {
        draft: 'bg-[#9098A6]',
        approval: 'bg-[#FF7426]',
        inProgress: 'bg-[#5869FF]',
        inReview: 'bg-[#8358FE]',
        rejected: 'bg-[#F2B720]',
        readyForDev: 'bg-[#FF007A]',
        blocked: 'bg-[#F43535]',
        complete: 'bg-[#7AC31C]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs rounded-t-md',
        md: 'px-3 py-1 text-xs rounded-t-lg',
        lg: 'px-4 py-1.5 text-sm rounded-t-xl',
      },
    },
    defaultVariants: {
      variant: 'draft',
      size: 'md',
    },
  },
)

const statusCardVariants = cva('flex items-center bg-white relative z-0', {
  variants: {
    variant: {
      draft: 'border-[#9098A6]',
      approval: 'border-[#FF7426]',
      inProgress: 'border-[#5869FF]',
      inReview: 'border-[#8358FE]',
      rejected: 'border-[#F2B720]',
      readyForDev: 'border-[#FF007A]',
      blocked: 'border-[#F43535]',
      complete: 'border-[#7AC31C]',
    },
    size: {
      sm: 'h-10 gap-2.5 px-3 rounded-tr-lg rounded-b-lg border-2',
      md: 'h-14 gap-3 px-4 rounded-tr-xl rounded-b-xl border-2',
      lg: 'h-[78px] gap-4 px-4 rounded-tr-2xl rounded-b-2xl border-2',
    },
  },
  defaultVariants: {
    variant: 'draft',
    size: 'md',
  },
})

const statusIconWrapperVariants = cva(
  'flex items-center justify-center shrink-0',
  {
    variants: {
      variant: {
        draft: 'bg-[#E5E8F0] text-[#9098A6] dark:bg-[#9098A6]/20',
        approval: 'bg-[#FFEADE] text-[#FF7426] dark:bg-[#FF7426]/20',
        inProgress: 'bg-[#DEE1FF] text-[#5869FF] dark:bg-[#5869FF]/20',
        inReview: 'bg-[#E7DEFF] text-[#8358FE] dark:bg-[#8358FE]/20',
        rejected: 'bg-[#FDF5E0] text-[#F2B720] dark:bg-[#F2B720]/20',
        readyForDev: 'bg-[#FFDEEE] text-[#FF007A] dark:bg-[#FF007A]/20',
        blocked: 'bg-[#FFDEDE] text-[#F43535] dark:bg-[#F43535]/20',
        complete: 'bg-[#F1FFDE] text-[#7AC41C] dark:bg-[#7AC41C]/20',
      },
      size: {
        sm: 'w-6 h-6 rounded',
        md: 'w-8 h-8 rounded-md',
        lg: 'w-10 h-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'draft',
      size: 'md',
    },
  },
)

const statusTextVariants = cva('whitespace-nowrap font-medium text-[#191c24]', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})

const defaultTabLabels: Record<string, string> = {
  draft: 'Draft',
  approval: 'Approval',
  inProgress: 'In Progress',
  inReview: 'In Review',
  rejected: 'Rejected',
  readyForDev: 'Ready for Dev',
  blocked: 'Blocked',
  complete: 'Complete',
}

export interface StatusTagProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusTabVariants> {
  title: string
  /**
   * By default, it will fall back to an IconFileDescription if not provided.
   * If you want to customize the Icon, pass the component here.
   */
  icon?: React.ReactNode
  /**
   * Text rendered in the top tab block. If not provided, it falls back to the English
   * default representation of the selected variant (e.g., variant="blocked" -> "Blocked").
   */
  tabLabel?: string
}

export function StatusTag({
  className,
  variant = 'draft',
  size = 'md',
  title,
  icon,
  tabLabel,
  ...props
}: StatusTagProps) {
  const Icon = icon ?? <IconFileDescription className="w-1/2 h-1/2" />

  return (
    <div
      className={cn(statusTagWrapperVariants({ size }), className)}
      {...props}
    >
      <div className={statusTabVariants({ variant, size })}>
        {tabLabel ?? defaultTabLabels[variant || 'draft']}
      </div>
      <div className={statusCardVariants({ variant, size })}>
        <div className={statusIconWrapperVariants({ variant, size })}>
          {Icon}
        </div>
        <span className={statusTextVariants({ size })}>{title}</span>
      </div>
    </div>
  )
}
