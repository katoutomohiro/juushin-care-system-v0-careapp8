import type { CareEvent } from "@/services/data-storage-service"

export type TimelineEvent = {
  id: string
  timestamp: string
  category: string
  icon: string
  description: string
  color: string
  userId?: string
  serviceId?: string
  eventType?: string
}

type BuildOptions = {
  userId?: string
  serviceId?: string
  limit?: number
}

const DEFAULT_COLOR = "bg-slate-50 border-slate-200"

function formatTime(timestamp: string) {
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return ""
  return d.toISOString().slice(11, 16)
}

function amountLabel(ev: CareEvent) {
  const amount = ev.amount ?? ev.volumeMl
  return amount !== undefined && amount !== null && amount !== "" ? `${amount}ml` : ""
}

function pick<T>(...values: Array<T | undefined | null>) {
  return values.find((v) => v !== undefined && v !== null && v !== "")
}

const EVENT_META: Record<
  string,
  {
    category: string
    icon: string
    color: string
    describe: (ev: CareEvent) => string
  }
> = {
  seizure: {
    category: "発作記録",
    icon: "⚡",
    color: "bg-red-50 border-red-200",
    describe: (ev) => {
      const type = pick(ev.type, ev.seizureType, "発作")
      const duration = ev.duration ?? ev.duration_seconds ?? ev.durationSeconds
      const durationLabel = duration ? `${duration}秒` : "時間不明"
      const note = ev.notes || ev.note || ""
      const time = formatTime(ev.timestamp) || ev.time
      const summary = [type, durationLabel].filter(Boolean).join(" / ")
      return [time, summary, note].filter(Boolean).join(" - ")
    },
  },
  expression: {
    category: "表情・反応",
    icon: "😊",
    color: "bg-amber-50 border-amber-200",
    describe: (ev) => {
      const kind = pick(ev.expressionType, ev.expression, "表情")
      const note = pick(ev.reaction, ev.notes, ev.note, ev.observedSymptoms?.join(", "))
      const time = formatTime(ev.timestamp) || ev.time
      return [time, kind, note].filter(Boolean).join(" - ")
    },
  },
  vitals: {
    category: "バイタル",
    icon: "🌡️",
    color: "bg-rose-50 border-rose-200",
    describe: (ev) => {
      const temp = ev.temperature ? `体温 ${ev.temperature}` : ""
      const spo2 = ev.oxygenSaturation ? `SpO2 ${ev.oxygenSaturation}%` : ""
      const pulse = ev.heartRate ? `脈拍 ${ev.heartRate}` : ""
      const respiration = ev.respiratoryRate ? `呼吸 ${ev.respiratoryRate}` : ""
      const note = pick(ev.notes, ev.note)
      const time = formatTime(ev.timestamp) || ev.time
      const stats = [temp, spo2, pulse, respiration].filter(Boolean).join(" / ")
      return [time, stats, note].filter(Boolean).join(" - ")
    },
  },
  hydration: {
    category: "水分・栄養",
    icon: "💧",
    color: "bg-sky-50 border-sky-200",
    describe: (ev) => {
      const kind = pick(ev.fluidType, ev.nutritionBrand, ev.menu, "水分")
      const amount = amountLabel(ev)
      const route = pick(ev.method, ev.infusionMethod)
      const note = pick(ev.intakeStatus, ev.notes, ev.note)
      const time = formatTime(ev.timestamp) || ev.time
      const summary = [kind, amount, route].filter(Boolean).join(" / ")
      return [time, summary, note].filter(Boolean).join(" - ")
    },
  },
  excretion: {
    category: "排泄",
    icon: "🚾",
    color: "bg-emerald-50 border-emerald-200",
    describe: (ev) => {
      const kind =
        ev.excretionType === "urine"
          ? "排尿"
          : ev.excretionType === "stool"
            ? "排便"
            : pick(ev.urineCharacteristics, ev.stoolCharacteristics, "排泄")
      const method = ev.excretionMethod || ""
      const note = pick(ev.notes, ev.note, ev.excretionState, ev.observedSymptoms)
      const time = formatTime(ev.timestamp) || ev.time
      return [time, kind, method, note].filter(Boolean).join(" - ")
    },
  },
  respiratory: {
    category: "呼吸状態",
    icon: "💨",
    color: "bg-cyan-50 border-cyan-200",
    describe: (ev) => {
      const status = pick(ev.breathingPattern, ev.respiratoryStatus, "呼吸")
      const spo2 = ev.oxygenSaturation ? `SpO2 ${ev.oxygenSaturation}%` : ""
      const rate = ev.respiratoryRate ? `呼吸数 ${ev.respiratoryRate}` : ""
      const note = pick(ev.notes, ev.note)
      const time = formatTime(ev.timestamp) || ev.time
      return [time, status, spo2, rate, note].filter(Boolean).join(" - ")
    },
  },
  activity: {
    category: "活動・余暇",
    icon: "🎨",
    color: "bg-violet-50 border-violet-200",
    describe: (ev) => {
      const title = pick(ev.activityType, ev.activityCategory, ev.program, ev.content, "活動")
      const detail = pick(ev.description, ev.reaction, ev.notes, ev.note)
      const time = formatTime(ev.timestamp) || ev.time
      return [time, title, detail].filter(Boolean).join(" - ")
    },
  },
  communication: {
    category: "コミュニケーション",
    icon: "💬",
    color: "bg-yellow-50 border-yellow-200",
    describe: (ev) => {
      const title = pick(ev.expression, ev.activityType, "コミュニケーション")
      const detail = pick(ev.notes, ev.note, ev.reaction)
      const time = formatTime(ev.timestamp) || ev.time
      return [time, title, detail].filter(Boolean).join(" - ")
    },
  },
  transportation: {
    category: "移動・送迎",
    icon: "🚌",
    color: "bg-amber-50 border-amber-200",
    describe: (ev) => {
      const title = pick(ev.transportType, ev.transportationType, "移動")
      const note = pick(ev.notes, ev.note, ev.assistanceLevel)
      const time = formatTime(ev.timestamp) || ev.time
      return [time, title, note].filter(Boolean).join(" - ")
    },
  },
}

export function buildTimelineEvents(events: CareEvent[], options: BuildOptions = {}): TimelineEvent[] {
  const { userId, serviceId, limit = 10 } = options
  const filtered = events.filter((ev) => {
    if (!ev.timestamp) return false
    if (userId && ev.userId !== userId) return false
    if (serviceId && ev.serviceId && ev.serviceId !== serviceId) return false
    return true
  })

  const sorted = filtered.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime()
    const tB = new Date(b.timestamp).getTime()
    return tB - tA
  })

  const items: TimelineEvent[] = sorted.map((ev) => {
    const meta = EVENT_META[ev.eventType] || {
      category: "ケア記録",
      icon: "📝",
      color: DEFAULT_COLOR,
      describe: (value: CareEvent) => {
        const note = pick(value.notes, value.note)
        const time = formatTime(value.timestamp) || value.time
        return [time, value.eventType, note].filter(Boolean).join(" - ")
      },
    }

    return {
      id: ev.id || `${ev.eventType}-${ev.timestamp}`,
      timestamp: ev.timestamp,
      category: meta.category,
      icon: meta.icon,
      description: meta.describe(ev),
      color: meta.color || DEFAULT_COLOR,
      userId: ev.userId,
      serviceId: ev.serviceId,
      eventType: ev.eventType,
    }
  })

  return items.slice(0, limit)
}
