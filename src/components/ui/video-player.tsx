'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  IconPlayerPlay as Play,
  IconPlayerPause as Pause,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

const videoPlayerVariants = cva(
  'relative overflow-hidden rounded-lg bg-black group transition-all duration-300 isolate',
  {
    variants: {
      size: {
        xs: 'w-44 h-[104px]',
        sm: 'w-60 h-[136px]',
        md: 'w-[343px] h-48',
        lg: 'w-[560px] h-[315px]',
        xl: 'w-[768px] h-[432px]',
        auto: 'w-full aspect-video',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  },
)

const titleSizeVariants = cva('font-medium text-white', {
  variants: {
    size: {
      xs: 'text-sm w-[152px]',
      sm: 'text-base w-[152px]',
      md: 'text-2xl',
      lg: 'text-4xl',
      xl: 'text-4xl',
      auto: 'text-2xl md:text-3xl lg:text-4xl',
    },
  },
})

const badgeSizeVariants = cva('font-medium text-center text-white', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
      xl: 'text-sm',
      auto: 'text-xs sm:text-sm',
    },
  },
})

const centerPlayButtonVariants = cva(
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white cursor-pointer transition-transform hover:scale-110 z-20',
  {
    variants: {
      size: {
        xs: 'w-12 h-12',
        sm: 'w-14 h-14',
        md: 'w-16 h-16',
        lg: 'w-[72px] h-[72px]',
        xl: 'w-20 h-20',
        auto: 'w-16 h-16 md:w-20 md:h-20',
      },
    },
  },
)

export interface VideoPlayerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof videoPlayerVariants> {
  thumbnailUrl?: string
  isPlaying?: boolean
  onPlayingChange?: (isPlaying: boolean) => void
  progress?: number // 0 to 100
  buffer?: number // 0 to 100
  partTitle?: string
  mainTitle?: string
}

export const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  (
    {
      className,
      size = 'lg',
      thumbnailUrl,
      isPlaying: controlledIsPlaying,
      onPlayingChange,
      progress = 30,
      buffer = 60,
      partTitle = 'Part 1',
      mainTitle = 'How to get started',
      ...props
    },
    ref,
  ) => {
    const [uncontrolledIsPlaying, setUncontrolledIsPlaying] = useState(false)
    const isPlaying =
      controlledIsPlaying !== undefined
        ? controlledIsPlaying
        : uncontrolledIsPlaying

    const handlePlayToggle = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onPlayingChange) onPlayingChange(!isPlaying)
      else setUncontrolledIsPlaying(!isPlaying)
    }

    return (
      <div
        ref={ref}
        className={cn(videoPlayerVariants({ size }), className)}
        {...props}
      >
        {/* THUMBNAIL BACKGROUND */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={mainTitle}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-transform duration-700',
              isPlaying
                ? 'scale-105 blur-[20px] opacity-40'
                : 'scale-100 blur-0 opacity-100',
            )}
          />
        )}

        {/* OVERLAYS FOR PAUSED STATE */}
        <div
          className={cn(
            'absolute inset-0 bg-black/10 transition-opacity duration-300',
            isPlaying ? 'opacity-0' : 'opacity-100',
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500',
            isPlaying ? 'opacity-0' : 'opacity-100',
          )}
        />

        {/* CENTER BIG PLAY BUTTON */}
        {!isPlaying && (
          <div
            onClick={handlePlayToggle}
            className={cn(centerPlayButtonVariants({ size }))}
          >
            <Play
              aria-hidden
              className={cn(
                'fill-current ml-1',
                size === 'xs' || size === 'sm' ? 'w-5 h-5' : 'w-8 h-8',
              )}
            />
          </div>
        )}

        {/* BOTTOM METADATA (Hidden when playing) */}
        {!isPlaying && (
          <div
            className={cn(
              'absolute flex flex-col justify-start items-start gap-1 z-10 transition-all duration-300',
              size === 'xs'
                ? 'left-3 bottom-[32px]'
                : size === 'sm'
                  ? 'left-3 bottom-[44px]'
                  : size === 'md'
                    ? 'left-6 bottom-[52px]'
                    : size === 'lg'
                      ? 'left-8 bottom-[64px]'
                      : 'left-8 bottom-[72px]',
            )}
          >
            <div className="flex justify-center items-center px-2 py-0.5 rounded-2xl bg-white/30 backdrop-blur-sm">
              <span className={cn(badgeSizeVariants({ size }))}>
                {partTitle}
              </span>
            </div>
            <h2 className={cn(titleSizeVariants({ size }))}>{mainTitle}</h2>
          </div>
        )}

        {/* PROGRESS BAR CONTROLS */}
        <div
          className={cn(
            'absolute z-20 flex items-center transition-all duration-300',
            isPlaying ? 'opacity-100' : 'opacity-70 group-hover:opacity-100',
            size === 'xs' || size === 'sm'
              ? 'left-3 right-3 bottom-2 h-1'
              : size === 'md'
                ? 'left-5 right-5 bottom-4 h-1.5'
                : 'left-8 right-8 bottom-6 h-2',
            isPlaying && size !== 'xs' && size !== 'sm' ? 'left-4' : '', // Shift left when playing to accommodate pause btn
          )}
        >
          {/* Active play controls icon prefix */}
          {isPlaying && size !== 'xs' && size !== 'sm' && (
            <button
              onClick={handlePlayToggle}
              className="text-white hover:text-white/80 transition-colors mr-3 focus:outline-none"
            >
              <Icon icon={Pause} size="md" className="fill-current" />
            </button>
          )}

          {/* Track */}
          <div className="relative w-full h-full bg-white/30 rounded-full overflow-hidden cursor-pointer group/track">
            {/* Buffer bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/50 transition-all duration-300"
              style={{ width: `${buffer}%` }}
            />
            {/* Progress bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            {/* Handle/Thumb - only shows on larger sizes or hover */}
            {size !== 'xs' && size !== 'sm' && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/track:scale-100 transition-transform"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            )}
          </div>
        </div>
      </div>
    )
  },
)
VideoPlayer.displayName = 'VideoPlayer'
