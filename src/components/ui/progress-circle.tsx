import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  size?: number
  strokeWidth?: number
  circleColor?: string
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  (
    {
      value = 0,
      size = 200,
      strokeWidth = 20,
      circleColor = '#38D399',
      className,
      ...props
    },
    ref,
  ) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          className,
        )}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-gray-100"
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
        </svg>
        <div className="absolute text-3xl font-semibold">{value}%</div>
      </div>
    )
  },
)

ProgressCircle.displayName = 'ProgressCircle'

export { ProgressCircle }
