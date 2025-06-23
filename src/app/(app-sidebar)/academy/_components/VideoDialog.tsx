'use client'

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Converte URLs do YouTube e Vimeo para formato de embed
function getEmbedUrl(url: string): string {
  // Se já é uma URL de embed válida, retorna como está
  if (url.includes('embed') || url.includes('player.vimeo.com')) {
    return url
  }

  // YouTube - diferentes formatos
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const youtubeMatch = url.match(youtubeRegex)

  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`
  }

  // Vimeo - diferentes formatos
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoRegex)

  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return `https://player.vimeo.com/video/${videoId}?autoplay=1`
  }

  // Se não for YouTube nem Vimeo, retorna a URL original
  return url
}

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  video: string
  title?: string
  description?: string
}

export function VideoDialog({
  open,
  onOpenChange,
  video,
  title,
  description,
}: VideoDialogProps) {
  const embedUrl = getEmbedUrl(video)

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
