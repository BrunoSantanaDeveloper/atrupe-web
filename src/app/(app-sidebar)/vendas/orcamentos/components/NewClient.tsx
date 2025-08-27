'use client'

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconUser } from '@tabler/icons-react'

import { useNewClientStore } from '../store/useNewClientStore'
import NewClientForm from './NewClient/NewClientForm'
import React from 'react'

function NewClient() {
  const { open, onToggleModalVisibility } = useNewClientStore()
  // <Partial<NewClientFormType>>
  const handleToggleModal = () => {
    onToggleModalVisibility()
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconUser} />
              <span>Novo cliente</span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pré-cadastro de cliente
          </DialogDescription>
        </DialogHeader>
        <NewClientForm />
      </DialogContent>
    </Dialog>
  )
}
export const NewClientModal = React.memo(NewClient)
