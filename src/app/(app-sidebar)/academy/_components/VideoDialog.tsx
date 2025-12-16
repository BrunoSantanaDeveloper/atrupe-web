'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

type VideoType = 'youtube' | 'vimeo' | 'hls' | 'direct'

// Detecta o tipo de vídeo baseado na URL
function getVideoType(url: string): VideoType {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube'
  }
  if (url.includes('vimeo.com')) {
    return 'vimeo'
  }
  if (url.endsWith('.m3u8') || url.includes('.m3u8')) {
    return 'hls'
  }
  return 'direct'
}

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

// Componente para HLS Player
function HlsPlayer({
  src,
  autoPlay = true,
}: {
  src: string
  autoPlay?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay pode falhar devido a políticas do navegador
          })
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari suporta HLS nativamente
      video.src = src
      if (autoPlay) {
        video.play().catch(() => {})
      }
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src, autoPlay])

  return (
    <video
      ref={videoRef}
      controls
      className="absolute top-0 left-0 w-full h-full rounded-lg"
      playsInline
    />
  )
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
  const videoType = getVideoType(video)
  const embedUrl =
    videoType === 'youtube' || videoType === 'vimeo'
      ? getEmbedUrl(video)
      : video

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Vídeo: {title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {videoType === 'hls' ? (
            <HlsPlayer src={video} autoPlay={open} />
          ) : videoType === 'direct' ? (
            <video
              src={video}
              controls
              autoPlay
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
      </DialogContent>
    </Dialog>
  )
}
