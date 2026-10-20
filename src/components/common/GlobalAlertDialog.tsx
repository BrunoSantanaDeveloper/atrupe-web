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
    iconTone,
    confirmVariant,
    isConfirming,
    close,
  } = useAlertDialog()

  return (
    // Enquanto confirma, o diálogo não fecha (Esc, Voltar): só ao terminar
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && !isConfirming && close()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {Icon && (
            <FeaturedIcon
              Icon={Icon}
              size="lg"
              tone={iconTone}
              className="mx-auto mb-2 flex"
            />
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className={cn(!description && 'sr-only')}>
            {description || title}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelLabel && (
            <AlertDialogCancel onClick={onCancel} disabled={isConfirming}>
              {cancelLabel}
            </AlertDialogCancel>
          )}
          {confirmLabel && (
            <AlertDialogAction
              onClick={(event) => {
                // A ação do Radix fecha no clique; quem fecha é o fim do onConfirm
                event.preventDefault()
                onConfirm?.()
              }}
              isLoading={isConfirming}
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
