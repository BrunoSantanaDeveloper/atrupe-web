'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Components
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import { IconX, IconArrowLeft, IconSend } from '@tabler/icons-react'

// Actions
import { deleteItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface InvoiceFormHeaderProps {
  data: NfePrepareResponse
  isEmitting: boolean
  onEmit: () => void
}

function getStatusBadgeVariant(status?: string) {
  if (status === 'AUTHORIZED') return 'success' as const
  if (status === 'REJECTED') return 'error' as const
  return 'blueLight' as const
}

function getStatusBadgeLabel(status?: string) {
  if (status === 'AUTHORIZED') return 'NF-e Autorizada'
  if (status === 'REJECTED') return 'NF-e Rejeitada'
  return 'Em digitação'
}

export function InvoiceFormHeader({
  data,
  isEmitting,
  onEmit,
}: InvoiceFormHeaderProps) {
  const router = useRouter()
  const [isCanceling, setIsCanceling] = useState(false)

  const showActionBar =
    !data.hasExistingNfe ||
    data.existingNfe?.status === 'DRAFT' ||
    data.existingNfe?.status === 'REJECTED'

  const handleCancel = async () => {
    // Se existe um draft salvo, excluí-lo antes de voltar
    if (data.draftId) {
      setIsCanceling(true)
      try {
        const result = await deleteItemNew({
          route: `/fiscal/nfe/draft/${data.draftId}`,
        })
        if (!result.success) {
          toast.error('Não foi possível cancelar o rascunho')
          return
        }
        toast.success('Digitação cancelada')
      } catch {
        toast.error('Erro ao cancelar o rascunho')
        return
      } finally {
        setIsCanceling(false)
      }
    }
    router.push('/nota-fiscal/emitir')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="iconSm"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => router.push('/nota-fiscal/emitir')}
            aria-label="Voltar para emissão"
          >
            <IconArrowLeft size={20} />
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Emissão de NF-e
            </h1>
            <span className="text-xl text-gray-400">
              {data.destinatario.razaoSocial}
            </span>
            <Badge
              variant={getStatusBadgeVariant(data.existingNfe?.status)}
              className="ml-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {getStatusBadgeLabel(data.existingNfe?.status)}
            </Badge>
          </div>
        </div>
      </div>

      {showActionBar && (
        <div className="flex justify-between items-center">
          <CustomButton
            icon={IconX}
            title={isCanceling ? 'Cancelando...' : 'Cancelar digitação'}
            iconVariant="errorLight"
            onClick={handleCancel}
            disabled={isCanceling || isEmitting}
            isLoading={isCanceling}
          />
          <CustomButton
            icon={IconSend}
            title={isEmitting ? 'Emitindo...' : 'Emitir NF-e'}
            iconVariant="light"
            onClick={onEmit}
            disabled={isEmitting || isCanceling}
            isLoading={isEmitting}
          />
        </div>
      )}
    </div>
  )
}
