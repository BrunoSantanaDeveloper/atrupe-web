'use client'

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { useAlertDialog } from '@/store/useAlertDialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'

import { cn } from '@/lib/utils'
import { IconCircleCheck } from '@tabler/icons-react'

export function GlobalAlertDialog() {
  const {
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    Icon,
    iconVariant,
    confirmVariant,
    close,
  } = useAlertDialog()

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {Icon && (
            <FeaturedIcon
              Icon={Icon}
              rounded
              size="lg"
              variant={iconVariant}
              className="mx-auto mb-2"
            />
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={cn(!description && 'sr-only')}>
            {description || title}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          {confirmLabel && (
            <AlertDialogAction
              onClick={onConfirm}
              className={buttonVariants({
                variant: confirmVariant,
              })}
              RightIcon={IconCircleCheck}
            >
              {confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
