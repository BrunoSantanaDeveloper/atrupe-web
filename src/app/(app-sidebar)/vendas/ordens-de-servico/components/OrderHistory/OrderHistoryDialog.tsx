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
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

// Types
import type { OrderType } from '@/types/sales/order'
import { Timeline } from '@/components/common/Timeline'

// Hooks
import { useOrderHistory } from '@/hooks/queries/useOrderHistory'

// Lib
import { formatOrderHistoryEvent } from '@/lib/formatHistoryEvent'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  order?: OrderType
}

export function OrderHistoryDialog({ open, setOpen, order }: Props) {
  const { history, isLoading } = useOrderHistory({
    orderId: order?.id || '',
    enabled: open && !!order?.id,
  })

  const events = useMemo(() => {
    return history.map(formatOrderHistoryEvent)
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
            <DialogTitle>Histórico da Ordem de Serviço</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <IconLoader2
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
