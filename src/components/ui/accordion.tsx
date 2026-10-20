'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { IconChevronDown as ChevronDown } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-gray-200 mt-3 pb-2', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    /**
     * O Radix envolve o gatilho num `<h3>`. Em navegação (barra lateral) isso
     * polui a lista de títulos da página; `asHeading={false}` usa um `<div>`.
     */
    asHeading?: boolean
  }
>(({ className, children, asHeading = true, ...props }, ref) => {
  const trigger = (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 mr-2 items-center justify-between pt-2 pb-3 font-medium transition-colors [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <Icon
        icon={ChevronDown}
        size="sm"
        className="text-brand shrink-0 transition-transform duration-200"
      />
    </AccordionPrimitive.Trigger>
  )
  return asHeading ? (
    <AccordionPrimitive.Header className="flex">
      {trigger}
    </AccordionPrimitive.Header>
  ) : (
    <AccordionPrimitive.Header asChild>
      <div className="flex">{trigger}</div>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-1 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
