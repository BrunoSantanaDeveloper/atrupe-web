'use client'

import { useState } from 'react'

// Components
import { VideoDialog } from './VideoDialog'
import { AcademyItem } from '../[planName]/page'
import { Button, ButtonProps } from '@/components/ui/button'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Libs
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconVideo,
  IconCircleFilled,
  IconCircleCheckFilled,
  IconFileTextFilled,
} from '@tabler/icons-react'

// Modals
import { modalRegistry } from './ModalRegistry'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'

const buttonVariant: Record<string, ButtonProps['variant']> = {
  pdf: 'errorGhost',
  doc: 'neutralGhost',
  docx: 'neutralGhost',
  xls: 'successGhost',
  xlsx: 'successGhost',
  ppt: 'warningGhost',
  other: 'neutralGhost',
}

interface Props {
  data: AcademyItem
}

export function AcademyItemRow({ data }: Props) {
  const {
    id,
    title,
    description,
    checked,
    files,
    video,
    page,
    modal,
    buttonTitle,
  } = data

  const queryClient = useQueryClient()

  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [isCheckLoading, setIsCheckLoading] = useState(false)

  const handleAction = (
    type: 'file' | 'video' | 'page' | 'modal',
    value?: string,
  ) => {
    if (value) {
      if (type === 'modal') {
        setActiveModal(value)
      } else if (type === 'page') {
        window.open(value, '_blank')
      } else if (type === 'file') {
        window.open(value, '_blank')
      } else if (type === 'video') {
        setVideoDialogOpen(true)
      }
    }
  }

  const handleSetChecked = async () => {
    setIsCheckLoading(true)

    try {
      await createItemNew({
        route: 'academy/progress',
        data: { itemId: id },
      })
      queryClient.invalidateQueries()
    } catch (error) {
      console.error('Erro ao marcar item como concluído:', error)
    } finally {
      setIsCheckLoading(false)
    }
  }

  const renderModal = () => {
    if (!activeModal || !modalRegistry[activeModal]) {
      return null
    }

    const ModalComponent = modalRegistry[activeModal]

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
        <div className="max-w-xs md:max-w-md lg:max-w-full">
          <span
            className={cn(
              'text-sm',
              checked ? 'text-gray-900 font-medium' : 'text-gray-600',
            )}
          >
            {title || buttonTitle || ''}
          </span>
          <span className="text-xs text-gray block truncate">
            {description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            {files?.map((file, index) => {
              const fileExtension =
                file.url.split('.').pop()?.toLowerCase() || 'other'

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={buttonVariant[fileExtension] || 'neutralLight'}
                      size="iconSm"
                      RightIcon={IconFileTextFilled}
                      onClick={async () => {
                        try {
                          await handleSetChecked()
                          handleAction('file', file.url)
                        } catch (error) {
                          console.error(
                            'Erro ao marcar item como concluído:',
                            error,
                          )
                        }
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>{file.name}</TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </div>

        {video && (
          <Button
            type="button"
            variant="neutralLight"
            size="iconSm"
            onClick={() => handleAction('video', video)}
            RightIcon={IconVideo}
          />
        )}

        {(page || modal) && !activeModal && (
          <Button
            type="button"
            // size="sm"
            className="min-w-72"
            isLoading={isCheckLoading}
            onClick={async () => {
              try {
                await handleSetChecked()
                handleAction(page ? 'page' : 'modal', page || modal)
              } catch (error) {
                console.error('Erro ao marcar item como concluído:', error)
              }
            }}
          >
            {buttonTitle || 'Configurar'}
          </Button>
        )}
        {activeModal && renderModal()}
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
