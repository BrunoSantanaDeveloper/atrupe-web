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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconHistory, IconLoader2 } from '@tabler/icons-react'

// Types
import type { QuotationType } from '@/types/sales/quotation'
import { Timeline } from '@/components/common/Timeline'

// Hooks
import { useQuotationHistory } from '@/hooks/queries/useQuotationHistory'

// Lib
import { formatQuotationHistoryEvent } from '@/lib/formatHistoryEvent'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  quotation?: QuotationType
}

export function QuotationHistoryDialog({ open, setOpen, quotation }: Props) {
  const { history, isLoading } = useQuotationHistory({
    quotationId: quotation?.id || '',
    enabled: open && !!quotation?.id,
  })

  const events = useMemo(() => {
    return history.map(formatQuotationHistoryEvent)
  }, [history])

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[692px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconHistory} />
            <DialogTitle>Histórico do Orçamento</DialogTitle>
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
