'use client'

// UI
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Icon
import {
  IconFileText,
  IconHelpCircle,
  IconPlayerPlay,
  IconBrandWhatsapp,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Type
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'
import { useState } from 'react'

interface Props {
  data: { files?: string[]; video?: string }
}

export function HelpButton({ data }: Props) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const { files, video } = data

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="iconMd"
            variant="neutralOutline"
            RightIcon={IconHelpCircle}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-32" align="start">
          <DropdownMenuItem
            onClick={() => {
              setVideoDialogOpen(true)
            }}
          >
            <IconPlayerPlay aria-hidden size={ICON_SIZE.md} className="mr-2" />
            <span>Vídeo</span>
          </DropdownMenuItem>
          {files?.length ? (
            <DropdownMenuItem
              onClick={() => {
                window.open(files[0], '_blank')
              }}
            >
              <IconFileText aria-hidden size={ICON_SIZE.md} className="mr-2" />
              <span>PDF</span>
            </DropdownMenuItem>
          ) : null}
          {/* {files?.length ? (
            <DropdownMenuItem
              onClick={() => {
                window.open(files[1], '_blank')
              }}
            >
              <IconTable size={16} className="mr-2" />
              <span>Planilha</span>
            </DropdownMenuItem>
          ) : null} */}
          <DropdownMenuItem
            onClick={() => window.open('https://wa.me/554721229194', '_blank')}
          >
            <IconBrandWhatsapp
              aria-hidden
              size={ICON_SIZE.md}
              className="mr-2"
            />
            <span>Suporte</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {video && (
        <VideoDialog
          open={videoDialogOpen}
          onOpenChange={setVideoDialogOpen}
          video={video}
          title={'Vídeo de Ajuda'}
          description={'Vídeo de Ajuda'}
        />
      )}
    </>
  )
}
