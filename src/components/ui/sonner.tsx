'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

import {
  IconLoader,
  IconCircleXFilled,
  IconInfoCircleFilled,
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
          title: 'group-[.toast]:text-gray-900',
          description: 'group-[.toast]:text-gray-500',
          actionButton:
            'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500',
        },
      }}
      {...props}
      icons={{
        loading: <Icon icon={IconLoader} size="sm" className="animate-spin" />,
        success: (
          <Icon
            icon={IconCircleCheckFilled}
            size="sm"
            className="text-success"
          />
        ),
        warning: (
          <Icon
            icon={IconAlertTriangleFilled}
            size="sm"
            className="text-warning"
          />
        ),
        error: (
          <Icon icon={IconCircleXFilled} size="sm" className="text-error" />
        ),
        info: (
          <Icon icon={IconInfoCircleFilled} size="sm" className="text-blue" />
        ),
      }}
      expand={true}
      visibleToasts={3}
    />
  )
}

export { Toaster }
