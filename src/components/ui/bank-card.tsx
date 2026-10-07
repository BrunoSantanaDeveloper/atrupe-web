import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const bankCardVariants = cva(
  'relative w-[316px] h-[190px] overflow-hidden rounded-[20px] shadow-[8px_10px_16px_0px_rgba(0,0,0,0.05)] transition-all',
  {
    variants: {
      intent: {
        glass: 'bg-white/10 backdrop-blur-md', // Linear gradients are applied via style prop to match Figma
        peach: 'bg-[#f4d9d0]',
        mint: 'bg-brand-100',
        dark: 'bg-gradient-to-tr from-gray-900 to-gray-600',
        light: 'bg-gray-100',
        vibrant: 'bg-gradient-to-tr from-[#011e69] to-[#ef4123]',
      },
      layout: {
        full: '',
        'split-horizontal': '',
        'split-vertical': '',
      },
    },
    defaultVariants: {
      intent: 'glass',
      layout: 'full',
    },
  },
)

export interface BankCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bankCardVariants> {
  title?: string
  name?: string
  number?: string
  expiry?: string
  hasLines?: boolean
  showContactless?: boolean
}

// Master logo interlocking circles
const CardLogo = ({ variant }: { variant: 'white' | 'dark' | 'colored' }) => {
  if (variant === 'colored') {
    return (
      <svg
        width="46"
        height="32"
        viewBox="0 0 46 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[45.33px] h-8 absolute left-[255px] top-[142px]"
        preserveAspectRatio="none"
      >
        <rect width="45.3333" height={32} rx={4} fill="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9053 22.4393C21.3266 23.77 19.2787 24.5733 17.0409 24.5733C12.0478 24.5733 8 20.5737 8 15.64C8 10.7063 12.0478 6.70667 17.0409 6.70667C19.2787 6.70667 21.3266 7.51 22.9053 8.84072C24.484 7.51 26.5319 6.70667 28.7697 6.70667C33.7629 6.70667 37.8106 10.7063 37.8106 15.64C37.8106 20.5737 33.7629 24.5733 28.7697 24.5733C26.5319 24.5733 24.484 23.77 22.9053 22.4393Z"
          fill="#ED0006"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9053 22.4393C24.8492 20.8007 26.0818 18.3626 26.0818 15.64C26.0818 12.9174 24.8492 10.4793 22.9053 8.84072C24.484 7.50999 26.5319 6.70667 28.7697 6.70667C33.7628 6.70667 37.8106 10.7063 37.8106 15.64C37.8106 20.5737 33.7628 24.5733 28.7697 24.5733C26.5319 24.5733 24.484 23.77 22.9053 22.4393Z"
          fill="#F9A000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9054 22.4393C24.8493 20.8008 26.0819 18.3627 26.0819 15.6401C26.0819 12.9175 24.8493 10.4794 22.9054 8.84082C20.9615 10.4794 19.7289 12.9175 19.7289 15.6401C19.7289 18.3627 20.9615 20.8008 22.9054 22.4393Z"
          fill="#FF5E00"
        />
      </svg>
    )
  }

  const shadeClasses = variant === 'dark' ? 'text-gray-900' : 'text-white'

  return (
    <svg
      width="46"
      height="32"
      viewBox="0 0 46 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'w-[45.33px] h-8 absolute left-[255px] top-[142px]',
        shadeClasses,
      )}
      preserveAspectRatio="none"
    >
      <rect
        width="45.3333"
        height={32}
        rx={4}
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.9053 22.4392C21.3266 23.7699 19.2787 24.5733 17.0409 24.5733C12.0478 24.5733 8 20.5737 8 15.6399C8 10.7062 12.0478 6.7066 17.0409 6.7066C19.2787 6.7066 21.3266 7.50994 22.9053 8.84066C24.484 7.50994 26.5319 6.7066 28.7697 6.7066C33.7629 6.7066 37.8106 10.7062 37.8106 15.6399C37.8106 20.5737 33.7629 24.5733 28.7697 24.5733C26.5319 24.5733 24.484 23.7699 22.9053 22.4392Z"
        fill="currentColor"
      />
      <path
        opacity="0.5"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.9053 22.4392C24.8492 20.8007 26.0818 18.3625 26.0818 15.6399C26.0818 12.9173 24.8492 10.4792 22.9053 8.84066C24.484 7.50993 26.5319 6.7066 28.7697 6.7066C33.7628 6.7066 37.8106 10.7062 37.8106 15.6399C37.8106 20.5737 33.7628 24.5733 28.7697 24.5733C26.5319 24.5733 24.484 23.7699 22.9053 22.4392Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.9054 22.4392C24.8493 20.8007 26.0819 18.3625 26.0819 15.6399C26.0819 12.9174 24.8493 10.4792 22.9054 8.8407C20.9615 10.4792 19.7289 12.9174 19.7289 15.6399C19.7289 18.3625 20.9615 20.8007 22.9054 22.4392Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Background Topography Lines Generator
const TopographicLines = ({ color }: { color: string }) => {
  // Creating a nice simulated topographic contour field inside the bounds
  const lineCount = 14
  return (
    <svg
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      className={cn(
        'absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none',
        color,
      )}
    >
      {Array.from({ length: lineCount }).map((_, i) => {
        const offset = i * 15
        return (
          <path
            key={i}
            d={`M-10,${offset} Q100,${offset - 30} 160,${offset + 50} T360,${offset - 20}`}
            stroke="currentColor"
            fill="none"
            strokeWidth="0.8"
          />
        )
      })}
    </svg>
  )
}

export const BankCard = React.forwardRef<HTMLDivElement, BankCardProps>(
  (
    {
      className,
      intent,
      layout,
      title = 'Untitled.',
      name = 'JOHN DOE',
      number = '**** **** **** 1234',
      expiry = '12/28',
      hasLines = false,
      showContactless = true,
      style,
      ...props
    },
    ref,
  ) => {
    // Structural logic to map figma visual domains
    const isPeachMintLight =
      intent === 'peach' || intent === 'mint' || intent === 'light'

    // Resolve Layout Split configurations
    const hasHorizontalSplit = layout === 'split-horizontal'
    const hasVerticalSplit = layout === 'split-vertical'

    // Compute derived text colors based on spatial boundaries vs intentions
    let titleColor = 'text-white'
    if (hasVerticalSplit) {
      titleColor = 'text-white' // Left bound logic inside the dark slate
    } else {
      if (isPeachMintLight) titleColor = 'text-gray-700'
    }

    let bottomDataColor = 'text-white'
    if (hasVerticalSplit || hasHorizontalSplit) {
      bottomDataColor = 'text-white' // Bottom-left region intersects with dark slate
    } else {
      if (isPeachMintLight) bottomDataColor = 'text-gray-700'
    }

    // Contactless icon sits top-right (rarely impacted by splits unless vibrant background)
    let iconColor = 'text-white'
    if (!hasVerticalSplit && !hasHorizontalSplit && isPeachMintLight)
      iconColor = 'text-gray-700'

    // Resolve Logo appearance
    let logoVariant: 'white' | 'colored' | 'dark' = 'white'
    if (intent === 'mint' || intent === 'vibrant' || intent === 'light') {
      logoVariant = 'colored'
    } else if (intent === 'glass' || intent === 'dark' || intent === 'peach') {
      logoVariant = 'white'
    }

    // Custom inline backgrounds required for specific granular tokens like glass gradient
    const defaultStyle: React.CSSProperties = { ...style }
    if (intent === 'glass') {
      defaultStyle.background =
        'linear-gradient(137.05deg, rgba(255,255,255,0.51) 2.89%, rgba(255,255,255,0) 112.35%)'
    }

    return (
      <div
        ref={ref}
        className={cn(bankCardVariants({ intent, layout }), className)}
        style={defaultStyle}
        {...props}
      >
        {/* TOPOGRAPHIC LAYER */}
        {hasLines && (
          <TopographicLines
            color={isPeachMintLight ? 'text-gray-700' : 'text-white'}
          />
        )}

        {/* HORIZONTAL SPLIT LAYER */}
        {hasHorizontalSplit && (
          <div className="w-[316px] h-[95px] absolute left-0 top-[95px] bg-gray-700" />
        )}

        {/* VERTICAL SPLIT LAYER */}
        {hasVerticalSplit && (
          <div className="w-[228px] h-[190px] absolute left-0 top-0 bg-gray-700" />
        )}

        {/* LOGO */}
        <CardLogo variant={logoVariant} />

        {/* CONTENT LAYERS */}
        <p
          className={cn(
            'absolute left-5 top-5 text-base font-semibold z-10',
            titleColor,
          )}
        >
          {title}
        </p>

        <p
          className={cn(
            'absolute left-4 top-[152px] tracking-widest text-base font-semibold z-10',
            bottomDataColor,
          )}
        >
          {number}
        </p>

        <p
          className={cn(
            'absolute left-4 top-32 text-xs font-semibold uppercase z-10',
            bottomDataColor,
          )}
        >
          {name}
        </p>

        <p
          className={cn(
            'absolute left-[172px] top-32 text-xs font-semibold text-right z-10',
            bottomDataColor,
          )}
        >
          {expiry}
        </p>

        {showContactless && (
          <svg
            width={20}
            height={24}
            viewBox="0 0 20 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              'w-5 h-6 absolute left-[276px] top-5 z-10',
              iconColor,
            )}
            preserveAspectRatio="none"
          >
            <path
              d="M15.1429 1.28571C17.0236 4.54326 18.0138 8.23849 18.0138 12C18.0138 15.7615 17.0236 19.4567 15.1429 22.7143M10.4286 3.64285C11.8956 6.18374 12.6679 9.06602 12.6679 12C12.6679 14.934 11.8956 17.8162 10.4286 20.3571M5.92859 5.80713C6.98933 7.66394 7.54777 9.77022 7.54777 11.9143C7.54777 14.0583 6.98933 16.1646 5.92859 18.0214M1.42859 8.14285C2.19306 9.29983 2.59834 10.6362 2.59834 12C2.59834 13.3638 2.19306 14.7002 1.42859 15.8571"
              stroke="currentColor"
              strokeWidth="2.57143"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    )
  },
)
BankCard.displayName = 'BankCard'
