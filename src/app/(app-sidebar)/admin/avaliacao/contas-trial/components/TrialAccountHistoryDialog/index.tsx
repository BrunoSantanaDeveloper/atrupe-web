// React
import { useMemo, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

// Icons
import { IconHistory, IconLoader2, IconSend } from '@tabler/icons-react'

// Types
import type { TrialAccountItem } from '../Table/Data'
import { Timeline } from '@/components/common/Timeline'

// Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { getData, createItem } from '@/actions/_cruds'

// Lib
import { formatHistoryEvent } from '@/lib/formatHistoryEvent'
import { toast } from 'sonner'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: TrialAccountItem | null
}

export function TrialAccountHistoryDialog({ open, setOpen, rowData }: Props) {
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['trial-account-history', rowData?.id],
    queryFn: () =>
      getData({
        route: `trial-accounts/${rowData?.id}/history`,
      }),
    enabled: open && !!rowData?.id,
  })

  const events = useMemo(() => {
    const history = historyData?.data || []
    return history.map(formatHistoryEvent)
  }, [historyData?.data])

  const mutation = useMutation({
    mutationFn: (messageData: { message: string }) =>
      createItem({
        route: `trial-accounts/${rowData?.id}/messages`,
        data: messageData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trial-account-history', rowData?.id],
      })
      toast.success('Mensagem enviada com sucesso')
      setMessage('')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro ao enviar a mensagem')
    },
  })

  const handleOpenChange = (openDialog: boolean) => {
    if (!openDialog) {
      setMessage('')
    }
    setOpen(openDialog)
  }

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Digite uma mensagem')
      return
    }
    mutation.mutate({ message: message.trim() })
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

          <div className="mt-6 space-y-4">
            <Textarea
              placeholder="Digite uma mensagem"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={mutation.isPending || !message.trim()}
          >
            <IconSend className="h-4 w-4 mr-2" />
            Enviar mensagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
