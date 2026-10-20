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
import { Skeleton } from '@/components/ui/skeleton'

// Icon Imports
import { IconHistory } from '@tabler/icons-react'

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
            // Eventos da linha do tempo ainda chegando
            <div className="space-y-5 py-2">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
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
