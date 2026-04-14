'use client'

import { useState } from 'react'
import Image from 'next/image'

// Components
import {
  VideoDialog,
  getVideoType,
  getEmbedUrl,
  HlsPlayer,
} from './VideoDialog'
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
  IconFileTypePdf,
  IconCircleFilled,
  IconCircleCheckFilled,
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

function getVideoThumbnail(url: string): string | null {
  // YouTube
  const ytRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const ytMatch = url.match(ytRegex)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`

  // Vimeo — returns placeholder, real thumb requires API call
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`

  return null
}

interface Props {
  data: AcademyItem
  showVideoInline?: boolean
}

export function AcademyItemRow({ data, showVideoInline }: Props) {
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

  const handleToggleChecked = async () => {
    if (isCheckLoading) return
    setIsCheckLoading(true)

    try {
      await createItemNew({
        route: 'academy/progress/toggle',
        data: { itemId: id },
      })
      queryClient.invalidateQueries()
    } catch (error) {
      console.error('Erro ao alternar status do item:', error)
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

  // Inline video renderer
  const renderInlineVideo = () => {
    if (!video || !showVideoInline) return null

    const videoType = getVideoType(video)
    const embedUrl =
      videoType === 'youtube' || videoType === 'vimeo'
        ? getEmbedUrl(video)
        : video

    return (
      <div className="w-full flex justify-center px-5 pb-5 pt-2">
        <div className="relative w-full max-w-2xl aspect-video">
          {videoType === 'hls' ? (
            <HlsPlayer src={video} autoPlay />
          ) : videoType === 'direct' ? (
            <video
              src={video}
              controls
              autoPlay
              muted
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              playsInline
            />
          ) : (
            <iframe
              src={embedUrl}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              title={title || 'Vídeo'}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center justify-between p-5 pl-14">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleChecked}
            disabled={isCheckLoading}
            className={cn(
              'flex-shrink-0 cursor-pointer transition-opacity hover:opacity-70',
              isCheckLoading && 'opacity-50 pointer-events-none',
            )}
            title={
              checked ? 'Desmarcar como concluído' : 'Marcar como concluído'
            }
          >
            {checked ? (
              <IconCircleCheckFilled className="text-success" />
            ) : (
              <IconCircleFilled className="text-gray-200" />
            )}
          </button>
          <div className="max-w-xs md:max-w-md lg:max-w-full">
            <span
              className={cn(
                'text-sm font-medium',
                checked ? 'text-gray-900' : 'text-gray-600',
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
                        RightIcon={IconFileTypePdf}
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

          {video &&
            !showVideoInline &&
            (() => {
              const thumb = getVideoThumbnail(video)
              return (
                <button
                  type="button"
                  onClick={() => handleAction('video', video)}
                  className="flex items-center gap-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors px-1.5 py-1 cursor-pointer"
                >
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={title || 'Vídeo'}
                      width={64}
                      height={36}
                      className="rounded object-cover"
                      unoptimized
                    />
                  ) : null}
                  <IconVideo className="size-4 text-gray-500" />
                </button>
              )
            })()}

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

        {video && !showVideoInline && (
          <VideoDialog
            open={videoDialogOpen}
            onOpenChange={setVideoDialogOpen}
            video={video}
            title={description}
            description={description}
          />
        )}
      </div>

      {renderInlineVideo()}
    </div>
  )
}
