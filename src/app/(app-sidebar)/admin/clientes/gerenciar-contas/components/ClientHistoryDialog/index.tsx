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
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'

// Types
import type { AccountItem } from '../Table/Data'
import { Timeline } from '@/components/common/Timeline'

// Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { getData, createItem } from '@/actions/_cruds'

// Lib
import { formatSubscriptionHistoryEvent } from '@/lib/formatHistoryEvent'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

export function ClientHistoryDialog({ open, setOpen, rowData }: Props) {
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['client-history', rowData?.id],
    queryFn: () =>
      getData({
        route: `/subscriptions/active-clients/${rowData?.id}/history`,
      }),
    enabled: open && !!rowData?.id,
  })

  const events = useMemo(() => {
    const responseData = historyData?.data
    if (!responseData) return []

    // Se responseData tem uma propriedade 'data', é o formato do endpoint
    const history = Array.isArray(responseData)
      ? responseData
      : responseData.data || []
    return history.map(formatSubscriptionHistoryEvent)
  }, [historyData])

  // Acessar lastAccess e company do objeto de resposta correto
  const responseData = historyData?.data
  const lastAccess =
    responseData && !Array.isArray(responseData)
      ? responseData.lastAccess
      : null
  const companyInfo =
    responseData && !Array.isArray(responseData) ? responseData.company : null

  const mutation = useMutation({
    mutationFn: (messageData: { message: string }) =>
      createItem({
        route: `/subscriptions/active-clients/${rowData?.id}/messages`,
        data: messageData,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['client-history', rowData?.id],
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
            <div className="flex-1">
              <DialogTitle>Histórico da Conta</DialogTitle>
              {lastAccess && (
                <p className="text-sm text-gray-500 mt-1">
                  Último acesso:{' '}
                  {format(parseISO(lastAccess.date), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}{' '}
                  por {lastAccess.user?.name || 'Usuário'}
                </p>
              )}
            </div>
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
            <>
              {(companyInfo || lastAccess) && (
                <div className="mb-4 rounded-lg bg-gray-50 p-4">
                  <h3 className="type-body-strong mb-2">Resumo da Conta</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {companyInfo && (
                      <>
                        <div>
                          <span className="text-gray-500">Empresa:</span>{' '}
                          <span className="font-medium">
                            {companyInfo.name || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>{' '}
                          <span className="font-medium">
                            {companyInfo.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </>
                    )}
                    {lastAccess && (
                      <>
                        <div>
                          <span className="text-gray-500">Último usuário:</span>{' '}
                          <span className="font-medium">
                            {lastAccess.user?.name || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">IP:</span>{' '}
                          <span className="font-medium">
                            {lastAccess.ipAddress || 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <Timeline events={events} />
            </>
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
              className="min-h-[120px]"
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
            <IconSend size={ICON_SIZE.md} className="mr-2" />
            Enviar mensagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
