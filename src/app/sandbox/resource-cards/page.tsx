import React from 'react'
import { ResourceCard } from '@/components/ui/resource-card'

export default function ResourceCardsSandboxPage() {
  // Custom Play Button SVG icon from Figma spec
  const PlayIcon = (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-grow-0 flex-shrink-0 w-5 h-5 relative"
    >
      <path
        d="M10 18.3334C14.6024 18.3334 18.3333 14.6025 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6025 5.39763 18.3334 10 18.3334Z"
        stroke="#085D40"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.33333 6.66667L13.3333 10L8.33333 13.3333V6.66667Z"
        stroke="#085D40"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const VideoOverlayIconLg = (
    <svg
      width={56}
      height={56}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56ZM23.625 38.2705L39.375 29.4672C40.5417 28.8151 40.5417 27.1849 39.375 26.5328L23.625 17.7295C22.4583 17.0774 21 17.8925 21 19.1967V36.8033C21 38.1075 22.4583 38.9226 23.625 38.2705Z"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  )
  const VideoOverlayIconMd = (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48ZM20.25 32.8033L33.75 25.2576C34.75 24.6987 34.75 23.3013 33.75 22.7424L20.25 15.1967C19.25 14.6378 18 15.3365 18 16.4543V31.5457C18 32.6635 19.25 33.3622 20.25 32.8033Z"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  )

  const StandardVideoMedia = ({
    part,
    title,
    size = 'md',
  }: {
    part?: string
    title?: string
    size?: 'md' | 'lg' | 'fluid'
  }) => (
    <div className="absolute inset-0 bg-slate-900 bg-cover bg-center">
      <div className="absolute inset-0 bg-black/10" />
      <div className="flex flex-col justify-start items-start absolute left-3 top-8 sm:top-[46px] gap-1 z-10">
        <p className="opacity-80 text-xs font-medium text-white">{part}</p>
        <p
          className={`font-medium text-white ${size === 'md' ? 'text-sm' : 'text-base'}`}
        >
          {title}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        {size === 'md' ? VideoOverlayIconMd : VideoOverlayIconLg}
      </div>
    </div>
  )

  const StandardUpdateMedia = ({
    size = 'md',
  }: {
    size?: 'md' | 'lg' | 'fluid'
  }) => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#A9F1CC] to-[#0fd27f]">
      {/* Abstract Pattern overlay simulation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60 mix-blend-overlay"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        {size === 'md' ? VideoOverlayIconMd : VideoOverlayIconLg}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto space-y-16">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-medium text-[#252e3b]">
            Media / Resource Cards
          </h2>
          <p className="text-sm border-l-4 border-indigo-500 pl-3 text-gray-600 max-w-3xl">
            A flexible primitive built specifically for announcement cards,
            tutorials, and video/media linking overlays supporting strict
            layouts (Horizontal 560px, Vertical 320px, Vertical Fluid 375px).
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* SEC 1: Tutorial Video Matrix */}
          <div>
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-700 mb-6">
              Type: Video Tutorial Matrix
            </h3>

            <div className="flex flex-wrap gap-8 items-start">
              {/* Horizontal Row (560px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Horizontal (w-[560px])
                </div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ResourceCard
                    layout="horizontal"
                    title="How to get started"
                    subtitle="Jump right in — get an overview of the basics and get started on building."
                    media={
                      <StandardVideoMedia
                        part="Part 1"
                        title="How to get started"
                        size="md"
                      />
                    }
                    actions={
                      <div className="flex items-center gap-2 cursor-pointer group">
                        {PlayIcon}
                        <span className="text-sm font-semibold text-[#085d40] group-hover:underline">
                          Watch video
                        </span>
                      </div>
                    }
                  />
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  {/* No Actions */}
                  <ResourceCard
                    layout="horizontal"
                    title="How to get started"
                    subtitle="Jump right in — get an overview of the basics and get started on building."
                    media={
                      <StandardVideoMedia
                        part="Part 1"
                        title="How to get started"
                        size="md"
                      />
                    }
                  />
                </div>
              </div>

              {/* Vertical Sm Row (320px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Vertical (w-80)
                </div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ResourceCard
                    layout="vertical"
                    title="How to get started"
                    subtitle="Jump right in — get an overview of the basics and get started on building straight away."
                    media={
                      <StandardVideoMedia
                        part="Part 1"
                        title="How to get started"
                        size="lg"
                      />
                    }
                    actions={
                      <div className="flex items-center gap-2 cursor-pointer group">
                        {PlayIcon}
                        <span className="text-sm font-semibold text-[#085d40] group-hover:underline">
                          Watch video
                        </span>
                      </div>
                    }
                  />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ResourceCard
                    layout="vertical"
                    title="How to get started"
                    subtitle="Jump right in — get an overview of the basics and get started on building straight away."
                    media={
                      <StandardVideoMedia
                        part="Part 1"
                        title="How to get started"
                        size="lg"
                      />
                    }
                  />
                </div>
              </div>

              {/* Vertical Fluid Row (375px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Fluid Vector Container (w-[375px])
                </div>
                <div className="bg-white border border-transparent rounded-lg border-dashed hover:border-indigo-400 transition-colors">
                  <ResourceCard
                    layout="vertical-fluid"
                    title="How to get started"
                    subtitle="Jump right in — get an overview of the basics and get started on building straight away."
                    media={
                      <StandardVideoMedia
                        part="Part 1"
                        title="How to get started"
                        size="lg"
                      />
                    }
                    actions={
                      <div className="flex items-center gap-2 cursor-pointer group">
                        {PlayIcon}
                        <span className="text-sm font-semibold text-[#085d40] group-hover:underline">
                          Watch video
                        </span>
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEC 2: Updates / Changelog Matrix */}
          <div className="mt-8">
            <h3 className="font-semibold text-lg border-b pb-2 text-gray-700 mb-6">
              Type: Platform Update / Changelog Matrix
            </h3>

            <div className="flex flex-wrap gap-8 items-start">
              {/* Horizontal Row (560px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Horizontal (w-[560px])
                </div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ResourceCard
                    layout="horizontal"
                    title="We've just released an update!"
                    subtitle="Check out the all new dashboard view. Pages and exports now load faster."
                    media={<StandardUpdateMedia size="md" />}
                    actions={
                      <>
                        <button className="text-sm font-semibold text-[#667085] hover:text-[#344054]">
                          Dismiss
                        </button>
                        <button className="text-sm font-semibold text-[#085d40] hover:underline">
                          Changelog
                        </button>
                      </>
                    }
                  />
                </div>
              </div>

              {/* Vertical Sm Row (320px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Vertical (w-80)
                </div>
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <ResourceCard
                    layout="vertical"
                    title="We've just released an update!"
                    subtitle="Check out the all new dashboard view. Pages and exports now load faster."
                    media={<StandardUpdateMedia size="lg" />}
                    actions={
                      <>
                        <button className="text-sm font-semibold text-[#667085] hover:text-[#344054]">
                          Dismiss
                        </button>
                        <button className="text-sm font-semibold text-[#085d40] hover:underline">
                          Changelog
                        </button>
                      </>
                    }
                  />
                </div>
              </div>

              {/* Vertical Fluid Row (375px) */}
              <div className="flex flex-col gap-4">
                <div className="text-xs font-semibold uppercase text-gray-400">
                  Fluid Vector Container (w-[375px])
                </div>
                <div className="bg-white border border-transparent rounded-lg border-dashed hover:border-indigo-400 transition-colors">
                  <ResourceCard
                    layout="vertical-fluid"
                    title="We've just released an update!"
                    subtitle="Check out the all new dashboard view. Pages and exports now load faster."
                    media={<StandardUpdateMedia size="lg" />}
                    actions={
                      <>
                        <button className="text-sm font-semibold text-[#667085] hover:text-[#344054]">
                          Dismiss
                        </button>
                        <button className="text-sm font-semibold text-[#085d40] hover:underline">
                          Changelog
                        </button>
                      </>
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
