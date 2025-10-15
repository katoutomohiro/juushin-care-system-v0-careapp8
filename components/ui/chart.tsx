"use client"

import React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipProps, LegendProps } from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType<any>
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)
function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { config: ChartConfig; children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"] }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`
  return (
    <ChartContext.Provider value={{ config }}>
      <div data-chart={chartId} ref={ref} className={cn("flex aspect-video justify-center text-xs", className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config || {}).filter(([, itemConfig]) => itemConfig?.theme || itemConfig?.color)
  if (!colorConfig.length) return null
  const css = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const body = colorConfig
        .map(([key, itemConfig]) => {
          const safeKey = String(key).replace(/[^a-z0-9_-]/gi, "-")
          const color = (itemConfig as any).theme?.[theme] || (itemConfig as any).color
          if (!color) return ""
          return [
            `  --color-${safeKey}: ${color};`,
            `  .legend-swatch--${safeKey} { background-color: var(--color-${safeKey}); }`,
            `  .indicator--${safeKey} { background-color: var(--color-${safeKey}); border-color: var(--color-${safeKey}); }`,
          ].join("\n")
        })
        .filter(Boolean)
        .join("\n")
      return `${prefix} [data-chart=${id}] {\n${body}\n}`
    })
    .join("\n")
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

type AnyPayload = { color?: string; name?: string; dataKey?: string; value?: number | string; payload?: any }

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined
  const payloadAny = payload as any
  const payloadPayload = "payload" in payloadAny && typeof payloadAny.payload === "object" && payloadAny.payload !== null ? payloadAny.payload : undefined
  let configLabelKey: string = key
  if (key in payloadAny && typeof payloadAny[key as keyof typeof payloadAny] === "string") configLabelKey = payloadAny[key as keyof typeof payloadAny] as string
  else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  return configLabelKey in (config || {}) ? (config as any)[configLabelKey] : (config as any)[key as keyof typeof config]
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = React.forwardRef((props: TooltipProps<any, any> & { indicator?: "dot" | "line" | "dashed"; className?: string; hideIndicator?: boolean; nameKey?: string; labelKey?: string }, ref: any) => {
  const { active, payload = [], className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, nameKey, labelKey } = props as any
  const { config } = useChart()
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey || (item as AnyPayload).dataKey || (item as AnyPayload).name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === "string" ? (config as any)[label as keyof typeof config]?.label || label : itemConfig?.label
    if (labelFormatter) return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
    if (!value) return null
    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) return null
  const nestLabel = payload.length === 1 && indicator !== "dot"
  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item: any, index: number) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const Icon = (itemConfig as any)?.icon
          const safeKey = String(key).replace(/[^a-z0-9_-]/gi, "-")
          return (
            <div key={(item.dataKey as any) ?? index} className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}>
              {formatter && (item as any)?.value !== undefined && item.name ? (
                (formatter as any)(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {Icon ? <Icon /> : !hideIndicator && (
                    <div className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", { "h-2.5 w-2.5": indicator === "dot", "w-1": indicator === "line", "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed", "my-0.5": nestLabel && indicator === "dashed" }, `indicator--${safeKey}`)} />
                  )}
                  <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">{(itemConfig as any)?.label || item.name}</span>
                    </div>
                    {item.value !== undefined && <span className="font-mono font-medium tabular-nums text-foreground">{typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}</span>}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartLegendContent = React.forwardRef((props: LegendProps & { hideIndicator?: boolean; indicator?: "dot" | "line" | "dashed"; className?: string }, ref: any) => {
  const { className, hideIcon = false, payload = [], verticalAlign = "bottom", nameKey } = props as any
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item: any, i: number) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        const Icon = (itemConfig as any)?.icon
        const safeKey = String(key).replace(/[^a-z0-9_-]/gi, "-")
        return (
          <div key={(item.value as any) ?? i} className={"flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"}>
            {Icon && !hideIcon ? <Icon /> : (
              <div className={cn("h-2 w-2 shrink-0 rounded-[2px]", `legend-swatch--${safeKey}`)} />
            )}
            {(itemConfig as any)?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartStyle }
