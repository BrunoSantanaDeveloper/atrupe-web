'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

import {
  IconLoader,
  IconXboxXFilled,
  IconInfoCircleFilled,
  IconAlertCircleFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

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
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-50 dark:group-[.toaster]:border-gray-800',
          title:
            'group-[.toast]:text-gray-900 dark:group-[.toast]:text-gray-50',
          description:
            'group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400',
          actionButton:
            'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-gray-50 dark:group-[.toast]:text-gray-900',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-400',
        },
      }}
      {...props}
      icons={{
        loading: <IconLoader size={16} className="animate-spin" />,
        success: <IconCircleCheckFilled size={16} className="text-success" />,
        warning: <IconAlertCircleFilled size={16} className="text-warning" />,
        error: <IconXboxXFilled size={16} className="text-error" />,
        info: <IconInfoCircleFilled size={16} className="text-blue" />,
      }}
      expand={true}
      visibleToasts={3}
    />
  )
}

export { Toaster }
