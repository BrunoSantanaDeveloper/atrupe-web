// UI component
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icon Imports
import { IconHistory } from '@tabler/icons-react'

// Type Imports
import { Timeline } from '@/components/common/Timeline'
import { EmployeeType } from '@/types/settings/employee'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: EmployeeType
}

type EventType = {
  date: string
  time: string
  author: string
  title: string
}

const events: EventType[] = []

export function UserHistoryDialog(props: Props) {
  const { open, setOpen } = props

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'history' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[692px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconHistory} />
            <DialogTitle>Histórico</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {events.length > 0 ? (
            <Timeline events={events} />
          ) : (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-gray-500">
                Nenhum histórico encontrado
              </p>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
