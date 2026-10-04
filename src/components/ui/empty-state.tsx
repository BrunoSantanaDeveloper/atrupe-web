import * as React from 'react'
import { cn } from '@/lib/utils'
import { FeaturedIcon } from './featured-icon'
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react'

/**
 * EmptyState Primitive
 *
 * Used for Data Tables, Lists, and Cards when no data is available.
 * Supports variations: 'search', 'data', 'error', or a custom icon.
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: React.ReactNode
  iconType?: 'search' | 'error' | 'data' | 'custom'
  customIcon?: React.ReactNode
  action?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  iconType = 'search',
  customIcon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center items-center w-full px-8 pt-10 pb-12',
        className,
      )}
      {...props}
    >
      <div className="flex justify-center items-center w-full max-w-[512px]">
        <div className="flex flex-col justify-start items-center w-full max-w-[352px] gap-6">
          <div className="flex flex-col justify-start items-center self-stretch gap-4 text-center">
            {/* Visual Icon / Illustration */}
            {iconType === 'search' && (
              <FeaturedIcon
                Icon={IconSearch}
                variant="successBorderedLight"
                size="xl"
                rounded
              />
            )}

            {iconType === 'error' && (
              <FeaturedIcon
                Icon={IconAlertTriangle}
                variant="warningBorderedLight"
                size="xl"
                rounded
              />
            )}

            {iconType === 'data' && (
              <div className="relative flex items-center justify-center w-[152px] h-[118px]">
                {/* Custom Cloud Illustration requested in the Figma specs */}
                <svg
                  width={152}
                  height={120}
                  viewBox="0 0 152 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[152px] h-[118px] relative"
                >
                  <circle cx={76} cy={52} r={52} fill="#EAECF0" />
                  <g filter="url(#filter0_dd_empty_cloud)">
                    <path
                      d="M77.6 16C66.8273 16 57.2978 21.3233 51.4987 29.4829C49.605 29.0363 47.6301 28.8 45.6 28.8C31.4615 28.8 20 40.2615 20 54.4C20 68.5385 31.4615 80 45.6 80L109.6 80C121.971 80 132 69.9712 132 57.6C132 45.2288 121.971 35.2 109.6 35.2C108.721 35.2 107.854 35.2506 107.002 35.349C102.098 23.9677 90.7797 16 77.6 16Z"
                      fill="#F9FAFB"
                    />
                  </g>
                  <circle cx={21} cy={19} r={5} fill="#F2F4F7" />
                  <circle cx={18} cy={109} r={7} fill="#F2F4F7" />
                  <circle cx={145} cy={35} r={7} fill="#F2F4F7" />
                  <circle cx={134} cy={8} r={4} fill="#F2F4F7" />
                  <g>
                    <rect
                      x={52}
                      y={62}
                      width={48}
                      height={48}
                      rx={24}
                      fill="#344054"
                      fillOpacity="0.4"
                    />
                    <path
                      d="M80.0004 90L76.0004 86M76.0004 86L72.0004 90M76.0004 86V95M84.3904 92.39C85.3658 91.8583 86.1363 91.0169 86.5803 89.9986C87.0244 88.9804 87.1167 87.8432 86.8427 86.7667C86.5686 85.6901 85.9439 84.7355 85.0671 84.0534C84.1903 83.3714 83.1113 83.0007 82.0004 83H80.7404C80.4378 81.8292 79.8736 80.7423 79.0904 79.821C78.3072 78.8996 77.3253 78.1678 76.2185 77.6806C75.1118 77.1933 73.909 76.9633 72.7006 77.0079C71.4921 77.0524 70.3095 77.3703 69.2416 77.9376C68.1737 78.505 67.2484 79.3071 66.5351 80.2836C65.8218 81.26 65.3391 82.3855 65.1234 83.5754C64.9077 84.7652 64.9646 85.9885 65.2897 87.1532C65.6148 88.318 66.1997 89.3938 67.0004 90.3"
                      stroke="white"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_dd_empty_cloud"
                      x={0}
                      y={16}
                      width={152}
                      height={104}
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity={0} result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy={8} />
                      <feGaussianBlur stdDeviation={4} />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.03 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_empty"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_empty"
                        result="shape"
                      />
                    </filter>
                  </defs>
                </svg>
              </div>
            )}

            {iconType === 'custom' && customIcon}

            {/* Text Content */}
            <div className="flex flex-col justify-start items-center gap-1 w-full text-center">
              <p className="text-base font-semibold text-gray-900">{title}</p>
              <div className="text-sm text-gray">{description}</div>
            </div>
          </div>

          {/* Action Buttons */}
          {action && (
            <div className="flex items-center justify-center gap-3 w-full [&>button]:flex-1">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
