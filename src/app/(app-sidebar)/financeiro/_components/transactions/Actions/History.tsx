// React
import { useMemo } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Icons
import { IconLoader2 } from '@tabler/icons-react'
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

// Types
import type { TransactionListType } from '@/types/financial/financialFlow'
import { Timeline } from '@/components/common/Timeline'

// Hooks
import { useTransactionHistory } from '@/hooks/queries/useTransactionHistory'

// Lib
import { formatHistoryEvent } from '@/lib/formatHistoryEvent'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  rowData?: TransactionListType
}

export function TransactionHistoryDialog({ open, setOpen, rowData }: Props) {
  const { history, isLoading } = useTransactionHistory({
    transactionId: rowData?.id || '',
    transactionType: rowData?.type || 'receivable',
    enabled: open && !!rowData?.id,
  })

  const events = useMemo(() => {
    return history.map(formatHistoryEvent)
  }, [history])

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'history' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[692px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Histórico</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <IconLoader2
                aria-hidden
                size={ICON_SIZE.lg}
                stroke={ICON_STROKE.lg}
                className="animate-spin text-gray-500"
              />
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
