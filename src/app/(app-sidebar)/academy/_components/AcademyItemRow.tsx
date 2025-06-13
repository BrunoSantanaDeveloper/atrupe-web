'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// UI
import { Button } from '@/components/ui/button'
import { VideoDialog } from './VideoDialog'

// Libs
import { cn } from '@/lib/utils'

// Icons
import {
  IconVideo,
  IconFileText,
  IconCircleFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

const modalRegistry = {
  CompanyInfo: dynamic(
    () =>
      import(
        '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/components/CompanyInfo'
      ).then((module) => ({ default: module.CompanyInfo })),
    {
      loading: () => (
        <Button size="sm" isLoading>
          Aguarde
        </Button>
      ),
      ssr: false, // Modais só precisam rodar no client
    },
  ),
  // Adicione outros modais aqui - cada um só carrega quando usado!
  MeasureStandards: dynamic(
    () =>
      import(
        '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/padrao-de-medida/components/Dialog'
      ).then((module) => ({ default: module.MeasureDefaultsDialog })),
    {
      loading: () => (
        <Button size="sm" isLoading>
          Aguarde
        </Button>
      ),
      ssr: false,
    },
  ),
}

interface Props {
  description: string
  checked: boolean
  files?: string[]
  video?: string
  page?: string
  modal?: string
  buttonTitle?: string
}

export function AcademyItemRow({
  description,
  checked,
  files,
  video,
  page,
  modal,
  buttonTitle,
}: Props) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)

  const handleAction = (
    type: 'file' | 'video' | 'page' | 'modal',
    value?: string,
  ) => {
    if (type === 'modal' && value) {
      setActiveModal(value)
    } else if (type === 'page' && value) {
      window.open(value, '_blank')
    } else if (type === 'file' && value) {
      window.open(value, '_blank')
    } else if (type === 'video' && value) {
      setVideoDialogOpen(true)
    }
  }

  const renderModal = () => {
    if (
      !activeModal ||
      !modalRegistry[activeModal as keyof typeof modalRegistry]
    ) {
      return null
    }

    const ModalComponent =
      modalRegistry[activeModal as keyof typeof modalRegistry]

    return <ModalComponent />
  }

  return (
    <div className="flex items-center justify-between p-5 pl-14 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        {checked ? (
          <IconCircleCheckFilled className="text-success" />
        ) : (
          <IconCircleFilled className="text-gray-200" />
        )}
        <span
          className={cn(
            'text-sm',
            checked ? 'text-gray-900 font-medium' : 'text-gray-600',
          )}
        >
          {description}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {files?.map((file, index) => {
            return (
              <Button
                key={index}
                type="button"
                variant="neutralGhost"
                size="iconSm"
                RightIcon={IconFileText}
                onClick={() => handleAction('file', file)}
              />
            )
          })}
        </div>

        {video && (
          <Button
            type="button"
            variant="neutralGhost"
            size="iconSm"
            onClick={() => handleAction('video', video)}
            RightIcon={IconVideo}
          />
        )}

        {!activeModal && (
          <Button
            type="button"
            size="sm"
            className="min-w-[200px]"
            onClick={() =>
              handleAction(modal ? 'modal' : 'page', modal || page)
            }
          >
            {buttonTitle || 'Configurar'}
          </Button>
        )}
        {renderModal()}
      </div>

      {video && (
        <VideoDialog
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
          video={video}
          title={description}
          description={description}
        />
      )}
    </div>
  )
}
