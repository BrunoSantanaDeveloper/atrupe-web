'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// ============================================================================
// CONTEXT
// Permite passar `variant` e `contextSize` para os childs (List, Trigger)
// ============================================================================

type TabsVariant = 'underline' | 'pill'
type TabsIntent = 'brand' | 'success' | 'gray' | 'dark'
type TabsSize = 'default' | 'sm'

interface TabsContextValue {
  variant: TabsVariant
  intent: TabsIntent
  sizing: TabsSize
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'underline',
  intent: 'gray',
  sizing: 'default',
})

// ============================================================================
// TABS ROOT
// ============================================================================

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant
  intent?: TabsIntent
  sizing?: TabsSize
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(
  (
    {
      className,
      variant = 'underline',
      intent = 'gray',
      sizing = 'default',
      ...props
    },
    ref,
  ) => (
    <TabsContext.Provider value={{ variant, intent, sizing }}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn(
          variant === 'pill' && props.orientation === 'vertical'
            ? 'flex flex-row gap-6'
            : '',
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  ),
)
Tabs.displayName = TabsPrimitive.Root.displayName

// ============================================================================
// TABS LIST
// ============================================================================

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { variant, sizing } = React.useContext(TabsContext)

  // The 'vertical' flex arrangement for Pill variant when orientation=vertical is handled by class
  const isVertical = props['aria-orientation'] === 'vertical'

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        // Variant Underline
        variant === 'underline' &&
          'flex w-full items-center justify-start border-b border-[#eaecf0] overflow-x-auto overflow-y-hidden',

        // Variant Pill (Segmented Control)
        variant === 'pill' &&
          'inline-flex items-center justify-center rounded-md bg-[#eaecf0] p-1 text-[#667085]',
        variant === 'pill' &&
          isVertical &&
          'flex-col items-stretch h-auto w-auto min-w-[153px]',
        variant === 'pill' && !isVertical && sizing === 'default' && 'h-11',
        variant === 'pill' && !isVertical && sizing === 'sm' && 'h-10',

        className,
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

// ============================================================================
// TABS TRIGGER
// ============================================================================

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  icon?: React.ReactNode
  badge?: React.ReactNode
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, icon, badge, ...props }, ref) => {
  const { variant, intent, sizing } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        // === VARIANT: UNDERLINE ===
        variant === 'underline' && [
          'group inline-flex items-center justify-center relative px-5 py-4 gap-2 border-b-[3px] border-transparent',
          'text-[13px] font-semibold text-[#667085] bg-transparent whitespace-nowrap',
          'hover:text-[#344054]',
          'focus-visible:outline-none transition-colors disabled:pointer-events-none disabled:opacity-50',

          // data-[state=active] bg
          'data-[state=active]:bg-[#fcfcfd]',

          // Intent: Gray (Default Untitled UI)
          intent === 'gray' &&
            'data-[state=active]:border-[#d0d5dd] data-[state=active]:text-[#101828]',
          // Intent: Success (Figma sample 38cf8f)
          intent === 'success' &&
            'data-[state=active]:border-[#14b375] data-[state=active]:text-[#38cf8f]',
          // Intent: Brand/Dark (Figma sample 084C36)
          intent === 'dark' &&
            'data-[state=active]:border-[#14b375] data-[state=active]:text-[#084C36]',
          // Intent: Brand
          intent === 'brand' &&
            'data-[state=active]:border-brand data-[state=active]:text-brand-700',
        ],

        // === VARIANT: PILL ===
        variant === 'pill' && [
          'group inline-flex items-center justify-center whitespace-nowrap rounded px-3 transition-all',
          'text-sm font-medium text-[#667085]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50 hover:text-[#344054]',

          // Sizing
          sizing === 'default' && 'h-[34px] py-1.5',
          sizing === 'sm' && 'h-7 py-1',

          // data-[state=active] styling
          'data-[state=active]:bg-white data-[state=active]:text-[#101828]',
          'data-[state=active]:shadow-[0px_1px_3px_0_rgba(16,24,40,0.1),_0px_1px_2px_0_rgba(16,24,40,0.06)]',
        ],

        className,
      )}
      {...props}
    >
      {props.asChild ? (
        children
      ) : (
        <>
          {/* Icon Slot */}
          {icon && (
            <span
              className={cn(
                'flex-shrink-0 w-4 h-4 flex items-center justify-center',
                variant === 'underline' &&
                  'opacity-70 group-data-[state=active]:opacity-100', // If an SVG doesn't inherit currentColor use this
              )}
            >
              {icon}
            </span>
          )}

          {/* Text Slot */}
          <span>{children}</span>

          {/* Badge Slot */}
          {badge && (
            <span
              className={cn(
                'flex items-center justify-center rounded-full text-xs font-semibold px-1.5 transition-colors',

                // Underline Inactive
                variant === 'underline' && 'bg-[#eaecf0] text-[#1d2939]',

                // Underline Active Intended Colors
                variant === 'underline' &&
                  intent === 'success' &&
                  'group-data-[state=active]:bg-[#ecfdf4] group-data-[state=active]:text-[#38cf8f]',
                variant === 'underline' &&
                  intent === 'dark' &&
                  'group-data-[state=active]:bg-[#ecfdf4] group-data-[state=active]:text-[#38cf8f]',
                variant === 'underline' &&
                  (intent === 'gray' || intent === 'brand') &&
                  'group-data-[state=active]:bg-[#cae1ff] group-data-[state=active]:text-brand-700', // adjust if needed

                // Pill Badge
                variant === 'pill' && 'bg-[#eaecf0] text-[#344054]',
                variant === 'pill' &&
                  'group-data-[state=active]:bg-[#d2f9e3] group-data-[state=active]:text-[#085d40]',
              )}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

// ============================================================================
// TABS CONTENT
// ============================================================================

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
