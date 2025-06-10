// UI component
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icon Imports
import { IconCircleCheck, IconBulb } from '@tabler/icons-react'

// Type Imports
import { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  open: boolean
  setOpen: (value: string) => void
  title: string
  rowData?: unknown
}

export function GenericDialog(props: Props) {
  const { open, title, setOpen, children } = props

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'generic' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconBulb} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>{children}</DialogBody>
        <DialogFooter>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              RightIcon={IconCircleCheck}
              onClick={() => handleOpenChange(false)}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
