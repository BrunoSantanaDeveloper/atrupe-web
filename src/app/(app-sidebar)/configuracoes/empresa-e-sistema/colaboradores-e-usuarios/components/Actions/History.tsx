// React
import { useMemo } from 'react'

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
import { IconHistory, IconLoader2 } from '@tabler/icons-react'

// Type Imports
import { Timeline } from '@/components/common/Timeline'
import { EmployeeType } from '@/types/settings/employee'

// Hooks
import { useEmployeeHistory } from '@/hooks/queries/useEmployeeHistory'

// Lib
import { formatEmployeeHistoryEvent } from '@/lib/formatHistoryEvent'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: EmployeeType
}

export function UserHistoryDialog(props: Props) {
  const { open, setOpen, rowData } = props

  const { history, isLoading } = useEmployeeHistory({
    employeeId: rowData?.id || '',
    enabled: open && !!rowData?.id,
  })

  const events = useMemo(() => {
    return history.map(formatEmployeeHistoryEvent)
  }, [history])

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
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <IconLoader2 className="h-6 w-6 animate-spin text-gray-500" />
            </div>
          ) : events.length > 0 ? (
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
