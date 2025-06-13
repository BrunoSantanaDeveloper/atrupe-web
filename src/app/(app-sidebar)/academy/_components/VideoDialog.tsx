'use client'

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: string
  title?: string
  description?: string
  videoType?: 'youtube' | 'vimeo'
}

export function VideoDialog({
  open,
  onOpenChange,
  video,
  title,
  description,
  videoType = 'vimeo',
}: VideoDialogProps) {
  const embedUrl =
    videoType === 'youtube'
      ? `https://www.youtube.com/embed/${video}`
      : `https://player.vimeo.com/video/${video}?h=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&autoplay=1`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Vídeo: {title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            title={title || 'Vídeo'}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
