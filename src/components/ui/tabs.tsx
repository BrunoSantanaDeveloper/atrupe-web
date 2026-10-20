'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

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
  const { variant } = React.useContext(TabsContext)

  // The 'vertical' flex arrangement for Pill variant when orientation=vertical is handled by class
  const isVertical = props['aria-orientation'] === 'vertical'

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        // Variant Underline
        variant === 'underline' &&
          'flex w-full items-center justify-start border-b border-gray-200 overflow-x-auto overflow-y-hidden',

        // Variant Pill (Segmented Control)
        variant === 'pill' &&
          'inline-flex items-center justify-center gap-1 rounded-lg bg-gray-200 p-1 text-gray',
        variant === 'pill' &&
          isVertical &&
          'flex-col items-stretch h-auto w-auto min-w-[153px]',

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
          'text-sm font-semibold text-gray bg-transparent whitespace-nowrap',
          'hover:text-gray-700',
          'focus-visible:outline-none transition-colors disabled:pointer-events-none disabled:opacity-50',

          // data-[state=active] bg
          'data-[state=active]:bg-gray-25',

          // Intent: Gray (Default Untitled UI)
          intent === 'gray' &&
            'data-[state=active]:border-gray-300 data-[state=active]:text-gray-900',
          // Intent: Success (Figma sample 38cf8f)
          intent === 'success' &&
            'data-[state=active]:border-brand-400 data-[state=active]:text-brand-300',
          // Intent: Brand/Dark (Figma sample 084C36)
          intent === 'dark' &&
            'data-[state=active]:border-brand-400 data-[state=active]:text-brand-800',
          // Intent: Brand
          intent === 'brand' &&
            'data-[state=active]:border-brand data-[state=active]:text-brand-700',
        ],

        // === VARIANT: PILL ===
        variant === 'pill' && [
          'group inline-flex items-center justify-center whitespace-nowrap rounded px-3 transition-[color,background-color,border-color,box-shadow,opacity]',
          'text-sm font-medium text-gray',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50 hover:text-gray-700',

          // Sizing
          sizing === 'default' && 'h-[34px] py-1.5',
          sizing === 'sm' && 'h-7 py-1',

          // data-[state=active] styling
          'data-[state=active]:bg-white data-[state=active]:text-gray-700',
          'data-[state=active]:shadow-sm-strong',
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
                variant === 'underline' && 'bg-gray-200 text-gray-800',

                // Underline Active Intended Colors
                variant === 'underline' &&
                  intent === 'success' &&
                  'group-data-[state=active]:bg-brand-25 group-data-[state=active]:text-brand-300',
                variant === 'underline' &&
                  intent === 'dark' &&
                  'group-data-[state=active]:bg-brand-25 group-data-[state=active]:text-brand-300',
                variant === 'underline' &&
                  (intent === 'gray' || intent === 'brand') &&
                  'group-data-[state=active]:bg-brand-50 group-data-[state=active]:text-brand-700',

                // Pill Badge
                variant === 'pill' && 'bg-gray-200 text-gray-700',
                variant === 'pill' &&
                  'group-data-[state=active]:bg-brand-50 group-data-[state=active]:text-brand-700',
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
      'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-base',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
