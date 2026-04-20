import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  size?: number
  strokeWidth?: number
  circleColor?: string
  trackColor?: string
  variant?: 'full' | 'semi'
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      value = 0,
      size = 200,
      strokeWidth = 20,
      circleColor = '#38D399',
      trackColor = 'text-gray-100',
      variant = 'full',
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    // For semi-circles, the path length is half
    const totalLength = variant === 'semi' ? circumference / 2 : circumference
    // How much to offset (hide) based on value
    const offset = totalLength - (value / 100) * totalLength

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          className,
        )}
        style={{ width: size, height: variant === 'semi' ? size / 2 : size }}
        {...props}
      >
        <svg
          className={
            variant === 'semi'
              ? 'transform rotate-180 absolute top-0 left-0'
              : 'transform -rotate-90'
          }
          width={size}
          height={size}
          style={{ overflow: 'visible' }}
        >
          {variant === 'semi' ? (
            <>
              {/* Track */}
              <circle
                className={trackColor}
                strokeWidth={strokeWidth}
                stroke="currentColor"
                strokeDasharray={`${circumference / 2} ${circumference / 2}`}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              {/* Indicator */}
              <circle
                className="transition-all duration-300 ease-in-out"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference / 2} ${circumference / 2}`}
                strokeDashoffset={
                  circumference / 2 - (value / 100) * (circumference / 2)
                }
                strokeLinecap="round"
                stroke={circleColor}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
            </>
          ) : (
            <>
              <circle
                className={trackColor}
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              <circle
                className="transition-all duration-300 ease-in-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke={circleColor}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
            </>
          )}
        </svg>
        <div
          className={cn(
            'absolute flex flex-col items-center justify-center',
            variant === 'semi' ? 'bottom-0 translate-y-0' : '',
          )}
        >
          {children !== undefined ? (
            children
          ) : (
            <div className="text-3xl font-semibold">{value}%</div>
          )}
        </div>
      </div>
    )
  },
)

ProgressCircle.displayName = 'ProgressCircle'

export { ProgressCircle }
