'use client'

// React
import { useState } from 'react'

// Icon Imports
import { IconUserPlus, IconAlertTriangle } from '@tabler/icons-react'

// UI component Imports
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Component Imports
import { CustomButton } from '@/components/common/CustomButton'

export function SetClient() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <CustomButton icon={IconUserPlus} title="Informar cliente" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2"
            />
            <AlertDialogTitle>Informar cliente</AlertDialogTitle>
            <AlertDialogDescription className="sr-only"></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
