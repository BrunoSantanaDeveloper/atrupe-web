'use client'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog'

// Third-party
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Actions
import { getItem } from '@/actions/_cruds'

interface ContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ContractData {
  html: string
  contractId: string
  version: number
  acceptedAt: string
  ipAddress: string
}

export function ContractModal({ open, onOpenChange }: ContractModalProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['accepted-contract'],
    queryFn: async () => {
      const response = await getItem({ route: '/contract/accepted' })
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data as ContractData
    },
    enabled: open, // fetch only when dialog is open
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Contrato de Assinatura</DialogTitle>
          <DialogDescription>
            Documento aceito no momento da contratação da assinatura atual.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="overflow-y-auto px-6 py-4 flex flex-col border border-gray-100 rounded-md bg-gray-50/50 mt-2">
          {isLoading ? (
            // Linhas de texto no lugar do contrato, no formato do documento
            <div className="min-h-[40vh] flex-1 space-y-3">
              <Skeleton className="h-5 w-1/2" />
              {['w-full', 'w-11/12', 'w-full', 'w-4/5', 'w-full', 'w-2/3'].map(
                (width, index) => (
                  <Skeleton key={index} className={`h-4 ${width}`} />
                ),
              )}
            </div>
          ) : isError ? (
            <div className="flex-1 flex items-center justify-center min-h-[40vh]">
              <span className="text-red-500">
                Não foi possível encontrar o contrato aceito.
              </span>
            </div>
          ) : data ? (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: data.html || '' }}
            />
          ) : null}
        </DialogBody>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between mt-6">
          <div className="flex flex-col gap-1 text-xs text-gray-500 text-left mb-4 sm:mb-0">
            {data && (
              <>
                <span>
                  <strong>Versão do Contrato:</strong> {data.version} | Aceito
                  em:{' '}
                  {format(new Date(data.acceptedAt), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
                <span>
                  <strong>IP de Aceite:</strong> {data.ipAddress}
                </span>
              </>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
