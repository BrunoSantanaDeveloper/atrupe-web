import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showTooltips?: boolean | 'top' | 'bottom' | 'alternate' | 'alternate-reverse'
  showLabels?: boolean | 'top' | 'bottom' | 'alternate' | 'alternate-reverse'
  formatLabel?: (value: number) => string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      showTooltips,
      showLabels,
      formatLabel = (v) => `${v}%`,
      ...props
    },
    ref,
  ) => {
    const values = props.value || props.defaultValue || [0]

    const getPositionClass = (
      index: number,
      type:
        | boolean
        | 'top'
        | 'bottom'
        | 'alternate'
        | 'alternate-reverse'
        | undefined,
      isTooltip: boolean,
    ) => {
      if (!type) return null

      let pos: 'top' | 'bottom' = 'top'
      if (type === 'top') pos = 'top'
      else if (type === 'bottom') pos = 'bottom'
      else if (type === 'alternate') pos = index % 2 === 0 ? 'top' : 'bottom'
      else if (type === 'alternate-reverse')
        pos = index % 2 === 0 ? 'bottom' : 'top'
      // defaults: tooltip default top, label default bottom
      else pos = isTooltip ? 'top' : 'bottom'

      if (isTooltip) {
        return pos === 'top' ? 'top-[-42px]' : 'top-7'
      } else {
        return pos === 'top' ? 'top-[-32px]' : 'top-8'
      }
    }

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className,
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#eaecf0]">
          <SliderPrimitive.Range className="absolute h-full bg-[#38cf8f]" />
        </SliderPrimitive.Track>
        {values.map((v, index) => {
          const tooltipPos = getPositionClass(index, showTooltips, true)
          const labelPos = getPositionClass(index, showLabels, false)
          const isTooltipBottom = tooltipPos === 'top-7' // simple check for arrow logic

          return (
            <SliderPrimitive.Thumb
              key={index}
              className="block h-6 w-6 rounded-full border-2 border-[#38cf8f] bg-white shadow-[0_2px_4px_rgba(16,24,40,0.06),0_4px_8px_rgba(16,24,40,0.1)] transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {showTooltips && tooltipPos && (
                <div
                  className={cn(
                    'flex flex-col justify-start items-center absolute left-1/2 -translate-x-1/2 rounded-lg pointer-events-none',
                    tooltipPos,
                  )}
                  style={{
                    filter:
                      'drop-shadow(0px 12px 16px rgba(16,24,40,0.08)) drop-shadow(0px 4px 6px rgba(16,24,40,0.03))',
                  }}
                >
                  {isTooltipBottom ? (
                    <>
                      <svg
                        width={16}
                        height={9}
                        viewBox="0 0 16 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-1.5 relative -mb-0.5"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M1.92894 8.51471C1.03803 8.51471 0.591868 7.43757 1.22183 6.8076L7.29289 0.736529C7.68342 0.346004 8.31658 0.346005 8.70711 0.736529L14.7782 6.8076C15.4081 7.43757 14.962 8.51471 14.0711 8.51471L1.92894 8.51471Z"
                          fill="white"
                        />
                      </svg>
                      <div className="flex flex-col justify-start items-start relative px-3 py-2 rounded-lg bg-white">
                        <p className="text-xs font-semibold text-center text-[#344054]">
                          {formatLabel(v)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col justify-start items-start relative px-3 py-2 rounded-lg bg-white">
                        <p className="text-xs font-semibold text-center text-[#344054]">
                          {formatLabel(v)}
                        </p>
                      </div>
                      <svg
                        width={16}
                        height={9}
                        viewBox="0 0 16 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-1.5 relative -mt-0.5"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M14.0711 -1.5991e-06C14.962 -1.5991e-06 15.4081 1.07714 14.7782 1.70711L8.70711 7.77818C8.31658 8.16871 7.68342 8.1687 7.29289 7.77818L1.22183 1.70711C0.591867 1.07714 1.03803 -1.17763e-06 1.92894 -1.17763e-06L14.0711 -1.5991e-06Z"
                          fill="white"
                        />
                      </svg>
                    </>
                  )}
                </div>
              )}

              {showLabels && labelPos && !showTooltips && (
                <p
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 text-base font-medium text-center text-[#101828] pointer-events-none w-16',
                    labelPos,
                  )}
                >
                  {formatLabel(v)}
                </p>
              )}
            </SliderPrimitive.Thumb>
          )
        })}
      </SliderPrimitive.Root>
    )
  },
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
