'use client'

import { useRouter } from '@/hooks/useRouter'
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// Components
import { CustomButton } from '@/components/common/CustomButton'

// Icons
import {
  IconX,
  IconArrowLeft,
  IconSend,
  IconPencil,
  IconFileTypePdf,
} from '@tabler/icons-react'

// Actions
import { deleteItemNew } from '@/actions/_cruds'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface InvoiceFormHeaderProps {
  data: NfePrepareResponse
  isEmitting: boolean
  onEmit: () => void
  /** Conferência antes de transmitir; ausente esconde o botão. */
  onPreview?: () => void
  isPreviewing?: boolean
  onCorrectionLetter?: () => void
}

function getStatusBadgeVariant(status?: string) {
  if (status === 'AUTHORIZED') return 'success' as const
  if (status === 'CORRECTION_SENT') return 'successLight' as const
  if (status === 'REJECTED') return 'error' as const
  return 'blueLight' as const
}

function getStatusBadgeLabel(status?: string) {
  if (status === 'AUTHORIZED') return 'NF-e Autorizada'
  if (status === 'CORRECTION_SENT') return 'CC-e Enviada'
  if (status === 'REJECTED') return 'NF-e Rejeitada'
  return 'Em digitação'
}

export function InvoiceFormHeader({
  data,
  isEmitting,
  onEmit,
  onPreview,
  isPreviewing,
  onCorrectionLetter,
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
            <h1 className="type-page-title">Emissão de NF-e</h1>
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

      {showActionBar ? (
        <div className="flex justify-between items-center">
          <CustomButton
            icon={IconX}
            title="Cancelar digitação"
            iconVariant="errorLight"
            onClick={handleCancel}
            disabled={isCanceling || isEmitting}
            isLoading={isCanceling}
          />
          <div className="flex items-center gap-2">
            {onPreview && (
              <CustomButton
                icon={IconFileTypePdf}
                title="Pré-visualizar"
                iconVariant="neutralOutline"
                onClick={onPreview}
                disabled={isEmitting || isCanceling || isPreviewing}
                isLoading={isPreviewing}
              />
            )}
            <CustomButton
              icon={IconSend}
              title="Emitir NF-e"
              iconVariant="light"
              onClick={onEmit}
              disabled={isEmitting || isCanceling}
              isLoading={isEmitting}
            />
          </div>
        </div>
      ) : data.existingNfe?.status === 'AUTHORIZED' ||
        data.existingNfe?.status === 'CORRECTION_SENT' ? (
        <div className="flex justify-end items-center">
          <CustomButton
            icon={IconPencil}
            title="Carta de Correção"
            iconVariant="neutralOutline"
            onClick={onCorrectionLetter}
          />
        </div>
      ) : null}
    </div>
  )
}
