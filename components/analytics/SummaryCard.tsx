"use client"

type SummaryCardProps = {
  title: string
  value: number | string | null | undefined
  unit?: string
  description?: string
  color?: "rose" | "blue" | "green"
  icon?: React.ReactNode
}

const colorClasses = {
  rose: {
    bg: "bg-gradient-to-br from-rose-50 to-rose-100/30",
    border: "border-rose-200/50",
    text: "text-rose-700",
    iconText: "text-rose-600",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/30",
    border: "border-blue-200/50",
    text: "text-blue-700",
    iconText: "text-blue-600",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-green-100/30",
    border: "border-green-200/50",
    text: "text-green-700",
    iconText: "text-green-600",
  },
}

export function SummaryCard({
  title,
  value,
  unit,
  description,
  color = "blue",
  icon,
}: SummaryCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`${colors.bg} p-6 rounded-lg border ${colors.border} shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-semibold ${colors.text} uppercase tracking-wider`}>
          {title}
        </p>
        {icon && <div className={colors.iconText}>{icon}</div>}
      </div>
      <p className={`text-4xl font-bold ${colors.text}`}>
        {value ?? "—"}
        {value != null && unit ? <span className="text-2xl ml-1">{unit}</span> : null}
      </p>
      {description && (
        <p className={`text-xs ${colors.iconText} mt-2`}>{description}</p>
      )}
    </div>
  )
}
