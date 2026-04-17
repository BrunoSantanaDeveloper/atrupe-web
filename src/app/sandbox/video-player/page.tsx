import React from 'react'
import { VideoPlayer } from '@/components/ui/video-player'

export default function VideoPlayerSandboxPage() {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

  // High quality Unsplash placeholder images matching the mood of the prompt
  const meshGradients = [
    'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1557682260-96773eb01377?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  ]

  const realImages = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', // Smiling woman
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-medium text-[#252e3b]">Video Player</h2>
          <p className="text-sm border-l-4 border-indigo-500 pl-3 text-gray-600 max-w-3xl">
            Responsive cross-size `VideoPlayer` component matching the unified
            Figma Design System. Supports `Playing` and `Paused` visual states
            natively, responsive titles, and fluid play bars.
          </p>
        </div>

        {/* MESH GRADIENT ROW - PAUSED vs PLAYING */}
        <div className="flex flex-col gap-10">
          <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest border-b pb-2">
            Mesh Gradients Context
          </h3>

          <div className="flex flex-col gap-8">
            <h4 className="text-sm font-medium text-gray-500">
              State: Paused (isPlaying = false)
            </h4>
            <div className="flex flex-row items-end gap-6 flex-wrap">
              {sizes.map((size, i) => (
                <div
                  key={`paused-mesh-${size}`}
                  className="flex flex-col items-center gap-3"
                >
                  <VideoPlayer
                    size={size}
                    thumbnailUrl={meshGradients[i]}
                    progress={Math.random() * 80 + 10}
                    buffer={Math.random() * 90 + 20}
                    isPlaying={false}
                  />
                  <span className="text-xs text-gray-400 font-mono">
                    size: "{size}"
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-gray-500 mt-6">
              State: Playing (isPlaying = true)
            </h4>
            <div className="flex flex-row items-end gap-6 flex-wrap">
              {sizes.map((size, i) => (
                <div
                  key={`playing-mesh-${size}`}
                  className="flex flex-col items-center gap-3"
                >
                  <VideoPlayer
                    size={size}
                    thumbnailUrl={meshGradients[i]}
                    progress={Math.random() * 80 + 10}
                    buffer={Math.random() * 90 + 20}
                    isPlaying={true}
                  />
                  <span className="text-xs text-gray-400 font-mono">
                    size: "{size}"
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-200" />

        {/* REAL WORLDS ROW - PAUSED vs PLAYING */}
        <div className="flex flex-col gap-10 pb-20">
          <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-widest border-b pb-2">
            Real Images Context
          </h3>

          <div className="flex flex-col gap-8">
            <h4 className="text-sm font-medium text-gray-500">
              State: Paused (isPlaying = false)
            </h4>
            <div className="flex flex-row items-end gap-6 flex-wrap">
              {sizes.map((size, i) => (
                <div
                  key={`paused-real-${size}`}
                  className="flex flex-col items-center gap-3"
                >
                  <VideoPlayer
                    size={size}
                    thumbnailUrl={realImages[i]}
                    progress={Math.random() * 80 + 10}
                    buffer={Math.random() * 90 + 20}
                    isPlaying={false}
                  />
                  <span className="text-xs text-gray-400 font-mono">
                    size: "{size}"
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-gray-500 mt-6">
              State: Playing (isPlaying = true)
            </h4>
            <div className="flex flex-row items-end gap-6 flex-wrap">
              {sizes.map((size, i) => (
                <div
                  key={`playing-real-${size}`}
                  className="flex flex-col items-center gap-3"
                >
                  <VideoPlayer
                    size={size}
                    thumbnailUrl={realImages[i]}
                    progress={Math.random() * 80 + 10}
                    buffer={Math.random() * 90 + 20}
                    isPlaying={true}
                  />
                  <span className="text-xs text-gray-400 font-mono">
                    size: "{size}"
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
