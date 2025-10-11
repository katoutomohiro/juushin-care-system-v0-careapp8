'use client'

import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

import { cn } from '@/lib/utils'

type ToggleVariant = 'default' | 'outline'
type ToggleSize = 'default' | 'sm' | 'lg'

interface ToggleGroupStyleContext {
  variant: ToggleVariant
  size: ToggleSize
}

const VARIANT_CLASSES: Record<ToggleVariant, string> = {
  default: 'bg-transparent',
  outline:
    'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
}

const SIZE_CLASSES: Record<ToggleSize, string> = {
  default: 'h-10 px-3',
  sm: 'h-9 px-2.5',
  lg: 'h-11 px-5',
}

const defaultStyle: ToggleGroupStyleContext = {
  variant: 'default',
  size: 'default',
}

const ToggleGroupContext = React.createContext<ToggleGroupStyleContext>(defaultStyle)

type ToggleGroupProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
> & {
  variant?: ToggleVariant
  size?: ToggleSize
}

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, variant = 'default', size = 'default', children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('flex items-center justify-center gap-1', className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

type ToggleGroupItemProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Item
> & {
  variant?: ToggleVariant
  size?: ToggleSize
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const currentVariant = context.variant ?? variant ?? 'default'
  const currentSize = context.size ?? size ?? 'default'

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        VARIANT_CLASSES[currentVariant],
        SIZE_CLASSES[currentSize],
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
