import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { AT_SERVICE_TIME_OPTIONS } from "./case-record-constants"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
let supabaseCaseRecords: SupabaseClient | null = null

function getSupabaseCaseRecords() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SupabaseのURLまたはキーが設定されていません")
  }
  if (!supabaseCaseRecords) {
    supabaseCaseRecords = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseCaseRecords
}

export type CaseRecordTemplate = "AT"

export type ATCaseRecordVitalRow = {
  time: string
  temperature: string
  spo2: string
  pulse: string
  respiration: string
  condition: string
}

export type ATCaseRecordHydrationRow = {
  time: string
  kind: string
  amount: string
  route: string
  note: string
}

export type ATCaseRecordEliminationRow = {
  time: string
  urine: string
  stool: string
  note: string
}

export type ATCaseRecordTransport = {
  ghArrivalTime: string
  officeArrivalTime: string
  officeDepartureTime: string
  ghReturnTime: string
}

export type ATCaseRecordBack = {
  vitalRows: ATCaseRecordVitalRow[]
  hydrationRows: ATCaseRecordHydrationRow[]
  eliminationRows: ATCaseRecordEliminationRow[]
  seizureNote: string
  otherNote: string
}

export type ATCaseRecordFront = {
  date: string
  year: string
  month: string
  day: string
  weekday: string
  serviceName: string
  serviceTime: string
  serviceTimeSlot?: string
  staffId?: string | null
  staffName?: string | null
  userName: string
  age: string
  sex: string
  transport: ATCaseRecordTransport
  transportTime?: string
  transportDetail?: string
  breakfast: string
  hydration1: string
  hydration2: string
  hydration3: string
  hydration4: string
  hydration5: string
  hydration6: string
  elimination1: string
  elimination2: string
  elimination3: string
  lunch: string
  snack: string
  dinner: string
  bathing: string
  task1Title: string
  task1Note: string
  task2Title: string
  task2Count: string
  task2Note: string
  task3Title: string
  task3Note: string
  activityDetail: string
  specialNote: string
  restraint: string
}

export type ATCaseRecordContent = {
  front: ATCaseRecordFront
  back: ATCaseRecordBack
}

type ATCaseRecordHeaderOverrides = Partial<
  Pick<ATCaseRecordFront, "userName" | "serviceName" | "serviceTime" | "serviceTimeSlot" | "age" | "sex">
>

export type CaseRecordContentEnvelope = {
  template: CaseRecordTemplate
  data: ATCaseRecordContent
}

export interface CaseRecordRow {
  id?: string
  user_id: string
  service_type: string
  record_date: string
  section: string
  item_key: string
  item_value?: string
  content?: CaseRecordContentEnvelope | null
  template?: CaseRecordTemplate | null
  source?: string
  created_at?: string
  updated_at?: string
}

const caseRecordTemplateByUserId: Record<string, CaseRecordTemplate> = {
  "A・T": "AT",
}

const VITAL_ROW_COUNT = 6
const HYDRATION_ROW_COUNT = 6
const ELIMINATION_ROW_COUNT = 3
const HISTORY_DAYS_DEFAULT = 365

function normalizeDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function getDateParts(date: string) {
  const normalized = normalizeDate(date)
  const d = new Date(normalized)
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"]
  return {
    year: normalized.slice(0, 4),
    month: normalized.slice(5, 7),
    day: normalized.slice(8, 10),
    weekday: weekdays[d.getDay()] ?? "",
  }
}

function pickTemplate(userId?: string): CaseRecordTemplate {
  return (userId && caseRecordTemplateByUserId[userId]) || "AT"
}

export function resolveCaseRecordTemplate(userId?: string): CaseRecordTemplate {
  return pickTemplate(userId)
}

function filterEventsForDate(events: any[] | undefined, recordDate: string, userId?: string, serviceId?: string) {
  if (!Array.isArray(events)) return []
  const isoDate = normalizeDate(recordDate)
  return events.filter((ev) => {
    if (userId && ev.userId && ev.userId !== userId) return false
    if (serviceId && ev.serviceId && ev.serviceId !== serviceId) return false
    const ts: string | undefined = ev.timestamp || ev.ts || ev.time
    if (!ts) return false
    const guessed = new Date(ts)
    if (!Number.isNaN(guessed.getTime())) {
      return guessed.toISOString().slice(0, 10) === isoDate
    }
    if (typeof ev.time === "string") {
      const fallback = new Date(`${isoDate}T${ev.time}`)
      return !Number.isNaN(fallback.getTime()) && fallback.toISOString().slice(0, 10) === isoDate
    }
    return false
  })
}

function formatEventTime(ev: any) {
  const ts: string | undefined = ev.timestamp || ev.ts || ev.time
  if (!ts) return ""
  const d = new Date(ts)
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(11, 16)
  if (typeof ev.time === "string") return ev.time
  return ""
}

function formatTransportClock(raw?: string) {
  if (!raw) return ""
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    const match = trimmed.match(/^(\d{1,2}):(\d{2})/)
    if (match) {
      const hour = match[1].padStart(2, "0")
      return `${hour}:${match[2]}`
    }
  }
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(11, 16)
  return ""
}

function buildSeizureSummary(events: any[]) {
  const seizures = events.filter((ev) => ev.eventType === "seizure")
  if (!seizures.length) return ""

  const durations = seizures
    .map((ev) => {
      const raw = ev.duration ?? ev.duration_seconds
      const n = Number(raw)
      return Number.isFinite(n) ? n : null
    })
    .filter((n): n is number => n != null)
  const longest = durations.length ? Math.max(...durations) : null
  const times = seizures
    .map((ev) => formatEventTime(ev))
    .filter(Boolean)
    .join(", ")

  const details = seizures
    .slice(0, 3)
    .map((ev) => {
      const parts = [
        ev.type || ev.seizureType,
        ev.severity && `重症度:${ev.severity}`,
        ev.triggers && `誘因:${ev.triggers}`,
        ev.response && `対応:${ev.response}`,
        ev.notes || ev.note,
      ].filter(Boolean)
      return parts.join(" / ")
    })
    .filter(Boolean)
    .join(" | ")

  return `発作${seizures.length}件${longest != null ? ` / 最長 ${longest}秒` : ""}${times ? ` / 時刻 ${times}` : ""}${
    details ? ` / 詳細 ${details}` : ""
  }`
}

function buildExcretionSummary(events: any[]) {
  const excretion = events.filter((ev) => ev.eventType === "excretion")
  if (!excretion.length) return ""
  const urineCount = excretion.filter((ev) => ev.excretionType === "urine").length
  const stoolCount = excretion.filter((ev) => ev.excretionType === "stool").length
  return `尿${urineCount}回 / 便${stoolCount}回`
}

function buildVitalRows(events: any[]): ATCaseRecordVitalRow[] {
  const vitalEvents = events.filter((ev) => ev.eventType === "vitals").slice(0, VITAL_ROW_COUNT)
  const rows: ATCaseRecordVitalRow[] = Array.from({ length: VITAL_ROW_COUNT }, () => ({
    time: "",
    temperature: "",
    spo2: "",
    pulse: "",
    respiration: "",
    condition: "",
  }))

  vitalEvents.forEach((ev, idx) => {
    rows[idx] = {
      time: formatEventTime(ev),
      temperature: ev.temperature ? String(ev.temperature) : "",
      spo2: ev.oxygenSaturation ? String(ev.oxygenSaturation) : "",
      pulse: ev.heartRate ? String(ev.heartRate) : "",
      respiration: ev.respiratoryRate ? String(ev.respiratoryRate) : "",
      condition: ev.notes || ev.note || "",
    }
  })

  return rows
}

function buildHydrationRows(events: any[]): ATCaseRecordHydrationRow[] {
  const hydrationEvents = events
    .filter((ev) => ["hydration", "tube_feeding", "meal_tube_feeding", "intake"].includes(ev.eventType))
    .slice(0, HYDRATION_ROW_COUNT)

  const rows: ATCaseRecordHydrationRow[] = Array.from({ length: HYDRATION_ROW_COUNT }, () => ({
    time: "",
    kind: "",
    amount: "",
    route: "",
    note: "",
  }))

  hydrationEvents.forEach((ev, idx) => {
    const amount = ev.amount ?? ev.volumeMl
    rows[idx] = {
      time: formatEventTime(ev),
      kind: ev.fluidType || ev.nutritionBrand || ev.menu || "",
      amount: amount != null && amount !== "" ? `${amount}` : "",
      route: ev.method || ev.infusionMethod || "",
      note: ev.intakeStatus || ev.notes || ev.note || "",
    }
  })

  return rows
}

function buildFrontHydrationSummary(events: any[]) {
  const hydrationEvents = events
    .filter((ev) => ["hydration", "tube_feeding", "meal_tube_feeding", "intake"].includes(ev.eventType))
    .slice(0, HYDRATION_ROW_COUNT)

  const summaries = hydrationEvents.map((ev) => {
    const parts = [
      formatEventTime(ev),
      ev.fluidType || ev.nutritionBrand || ev.menu,
      ev.amount != null ? `${ev.amount}ml` : ev.volumeMl != null ? `${ev.volumeMl}ml` : "",
      ev.method || ev.infusionMethod,
      ev.intakeStatus,
    ].filter(Boolean)
    return parts.join(" / ")
  })

  while (summaries.length < HYDRATION_ROW_COUNT) summaries.push("")
  return summaries.slice(0, HYDRATION_ROW_COUNT)
}

function buildEliminationRows(events: any[]): ATCaseRecordEliminationRow[] {
  const excretion = events.filter((ev) => ev.eventType === "excretion").slice(0, ELIMINATION_ROW_COUNT)
  const rows: ATCaseRecordEliminationRow[] = Array.from({ length: ELIMINATION_ROW_COUNT }, () => ({
    time: "",
    urine: "",
    stool: "",
    note: "",
  }))

  excretion.forEach((ev, idx) => {
    rows[idx] = {
      time: formatEventTime(ev),
      urine: ev.excretionType === "urine" ? "◯" : ev.urineCharacteristics || "",
      stool: ev.excretionType === "stool" ? "◯" : ev.stoolCharacteristics || "",
      note: ev.notes || ev.note || ev.excretionMethod || "",
    }
  })

  return rows
}

function buildFrontEliminationSlots(events: any[]): string[] {
  const excretion = events.filter((ev) => ev.eventType === "excretion")
  const slots: string[] = []
  excretion.slice(0, ELIMINATION_ROW_COUNT).forEach((ev) => {
    const time = formatEventTime(ev)
    const urine = ev.excretionType === "urine" ? "尿◯" : ev.urineCharacteristics ? `尿:${ev.urineCharacteristics}` : ""
    const stool = ev.excretionType === "stool" ? "便◯" : ev.stoolCharacteristics ? `便:${ev.stoolCharacteristics}` : ""
    const method = ev.excretionMethod || ""
    const note = ev.notes || ev.excretionState || ev.observedSymptoms || ""
    const line = [time, urine, stool, method, note].filter(Boolean).join(" / ")
    slots.push(line)
  })
  while (slots.length < ELIMINATION_ROW_COUNT) slots.push("")
  if (slots.every((s) => !s)) {
    slots[0] = buildExcretionSummary(events)
  }
  return slots.slice(0, ELIMINATION_ROW_COUNT)
}

function buildRespiratoryNote(events: any[]) {
  const respiratoryEvents = events.filter((ev) => ev.eventType === "respiratory")
  if (!respiratoryEvents.length) return ""
  return respiratoryEvents
    .slice(0, 3)
    .map((ev) => {
      const parts = [
        formatEventTime(ev),
        ev.breathingPattern || ev.respiratoryStatus,
        ev.oxygenTherapy && `O2:${ev.oxygenTherapy}`,
        ev.oxygenSaturation && `SpO2 ${ev.oxygenSaturation}%`,
        ev.respiratoryRate && `呼吸数${ev.respiratoryRate}`,
        ev.notes || ev.note,
      ].filter(Boolean)
      return parts.join(" / ")
    })
    .join(" | ")
}

function buildActivityNote(events: any[], kinds: string[]) {
  const activityEvents = events.filter((ev) => kinds.includes(ev.eventType))
  if (!activityEvents.length) return ""
  return activityEvents
    .slice(0, 4)
    .map((ev) => {
      const parts = [
        formatEventTime(ev),
        ev.activityType || ev.activityCategory || ev.program || ev.expression || ev.content || ev.transportType,
        ev.description || ev.reaction || ev.observedSymptoms || ev.assistanceLevel,
        ev.note || ev.notes,
      ].filter(Boolean)
      return parts.join(" / ")
    })
    .join(" | ")
}

const TRANSPORT_ROUTE_LABEL: Record<string, string> = {
  "home-to-facility": "自宅↔事業所",
  "facility-to-home": "事業所↔自宅",
  "school-to-facility": "学校↔事業所",
  "facility-to-school": "事業所↔学校",
  other: "その他",
}

function normalizeTransport(base?: ATCaseRecordTransport): ATCaseRecordTransport {
  return {
    ghArrivalTime: base?.ghArrivalTime || "",
    officeArrivalTime: base?.officeArrivalTime || "",
    officeDepartureTime: base?.officeDepartureTime || "",
    ghReturnTime: base?.ghReturnTime || "",
  }
}

function buildTransportFields(events: any[], baseTransport?: ATCaseRecordTransport) {
  const transportEvents = events.filter((ev) => ev.eventType === "transportation")
  const base = normalizeTransport(baseTransport)
  if (!transportEvents.length) return { transportTime: "", transportDetail: "", transportTimes: base }

  const inboundDepartures: string[] = []
  const inboundArrivals: string[] = []
  const outboundDepartures: string[] = []
  const outboundArrivals: string[] = []

  transportEvents.forEach((ev) => {
    const route: string = ev.route || ev.transportRoute || ""
    const departure = formatTransportClock(ev.departureTime || ev.departure || ev.startTime || ev.time)
    const arrival = formatTransportClock(ev.arrivalTime || ev.arrival || ev.endTime)
    const isToFacility = route.includes("to-facility")
    const isFromFacility = route.startsWith("facility-to")
    if (isToFacility) {
      if (departure) inboundDepartures.push(departure)
      if (arrival) inboundArrivals.push(arrival)
    }
    if (isFromFacility) {
      if (departure) outboundDepartures.push(departure)
      if (arrival) outboundArrivals.push(arrival)
    }
  })

  const earliest = (list: string[]) => (list.length ? [...list].sort()[0] : "")
  const latest = (list: string[]) => (list.length ? [...list].sort().slice(-1)[0] : "")

  const transportTimes: ATCaseRecordTransport = {
    ghArrivalTime: earliest(inboundDepartures) || base.ghArrivalTime,
    officeArrivalTime: earliest(inboundArrivals) || base.officeArrivalTime,
    officeDepartureTime: latest(outboundDepartures) || base.officeDepartureTime,
    ghReturnTime: latest(outboundArrivals) || base.ghReturnTime,
  }

  const referenceEvent =
    transportEvents.find((ev) => (ev.route || "").includes("to-facility")) || transportEvents[0]
  const routeLabel = referenceEvent?.route ? TRANSPORT_ROUTE_LABEL[referenceEvent.route] || referenceEvent.route : ""
  const detailParts = [
    routeLabel,
    referenceEvent?.vehicle,
    referenceEvent?.driver && `運転: ${referenceEvent.driver}`,
    referenceEvent?.companion && `付添: ${referenceEvent.companion}`,
    referenceEvent?.physicalCondition,
    referenceEvent?.emotionalState,
    referenceEvent?.incidents,
    referenceEvent?.notes || referenceEvent?.note,
  ]
    .filter(Boolean)
    .map((p) => String(p))

  const transportTime =
    (transportTimes.ghArrivalTime && transportTimes.ghReturnTime
      ? `${transportTimes.ghArrivalTime}〜${transportTimes.ghReturnTime}`
      : "") ||
    [formatTransportClock(referenceEvent?.departureTime || referenceEvent?.time), formatTransportClock(referenceEvent?.arrivalTime)]
      .filter(Boolean)
      .join("〜") ||
    formatEventTime(referenceEvent)

  return {
    transportTime,
    transportDetail: detailParts.join(" / "),
    transportTimes,
  }
}

function buildFrontFromCareEvents(params: {
  events: any[]
  base: ATCaseRecordFront
}): ATCaseRecordFront {
  const { events, base } = params
  const hydrationSummary = buildFrontHydrationSummary(events)
  const eliminationSlots = buildFrontEliminationSlots(events)
  const activityNote = buildActivityNote(events, ["activity", "communication", "transportation"])
  const expressionNote = buildActivityNote(events, ["expression"])
  const transport = buildTransportFields(events, base.transport)

  return {
    ...base,
    hydration1: hydrationSummary[0] || base.hydration1,
    hydration2: hydrationSummary[1] || base.hydration2,
    hydration3: hydrationSummary[2] || base.hydration3,
    hydration4: hydrationSummary[3] || base.hydration4,
    hydration5: hydrationSummary[4] || base.hydration5,
    hydration6: hydrationSummary[5] || base.hydration6,
    elimination1: eliminationSlots[0] || base.elimination1,
    elimination2: eliminationSlots[1] || base.elimination2,
    elimination3: eliminationSlots[2] || base.elimination3,
    activityDetail: activityNote || base.activityDetail,
    specialNote: expressionNote ? `${expressionNote}${base.specialNote ? ` / ${base.specialNote}` : ""}` : base.specialNote,
    transport: transport.transportTimes,
    transportTime: transport.transportTime || base.transportTime,
    transportDetail: transport.transportDetail || base.transportDetail,
  }
}

function buildBackFromCareEvents(events: any[], base: ATCaseRecordBack): ATCaseRecordBack {
  const respiratoryNote = buildRespiratoryNote(events)
  const activityNote = buildActivityNote(events, ["activity", "communication", "transportation"])
  const other = [base.otherNote, respiratoryNote, activityNote].filter(Boolean).join(" | ")

  return {
    vitalRows: buildVitalRows(events),
    hydrationRows: buildHydrationRows(events),
    eliminationRows: buildEliminationRows(events),
    seizureNote: buildSeizureSummary(events) || base.seizureNote,
    otherNote: other,
  }
}

function mergeRowsWithTemplate<T extends Record<string, string>>(template: T[], incoming?: T[]): T[] {
  const rows = Array.isArray(incoming) ? incoming : []
  return template.map((row, idx) => ({ ...row, ...(rows[idx] || {}) }))
}

export function getDefaultATCaseRecordContent(
  recordDate: string,
  headerOverrides?: ATCaseRecordHeaderOverrides,
): ATCaseRecordContent {
  const date = normalizeDate(recordDate)
  const dateParts = getDateParts(date)
  const defaultServiceTime = headerOverrides?.serviceTimeSlot || headerOverrides?.serviceTime || AT_SERVICE_TIME_OPTIONS[0] || ""
  const defaultTransport: ATCaseRecordTransport = {
    ghArrivalTime: "",
    officeArrivalTime: "",
    officeDepartureTime: "",
    ghReturnTime: "",
  }
  return {
    front: {
      date,
      year: dateParts.year,
      month: dateParts.month,
      day: dateParts.day,
      weekday: dateParts.weekday,
      serviceName: headerOverrides?.serviceName || "",
      serviceTime: defaultServiceTime,
      serviceTimeSlot: headerOverrides?.serviceTimeSlot || defaultServiceTime,
      staffId: null,
      staffName: null,
      userName: headerOverrides?.userName || "",
      age: headerOverrides?.age || "",
      sex: headerOverrides?.sex || "",
      transport: defaultTransport,
      transportTime: "",
      transportDetail: "",
      breakfast: "",
      hydration1: "",
      hydration2: "",
      hydration3: "",
      hydration4: "",
      hydration5: "",
      hydration6: "",
      elimination1: "",
      elimination2: "",
      elimination3: "",
      lunch: "",
      snack: "",
      dinner: "",
      bathing: "",
      task1Title: "課題①【側弯・拘縮予防】",
      task1Note: "",
      task2Title: "課題②【下肢の機能低下を防止する】",
      task2Count: "",
      task2Note: "",
      task3Title: "課題③【意思疎通】",
      task3Note: "",
      activityDetail: "",
      specialNote: "",
      restraint: "",
    },
    back: {
      vitalRows: Array.from({ length: VITAL_ROW_COUNT }, () => ({
        time: "",
        temperature: "",
        spo2: "",
        pulse: "",
        respiration: "",
        condition: "",
      })),
      hydrationRows: Array.from({ length: HYDRATION_ROW_COUNT }, () => ({
        time: "",
        kind: "",
        amount: "",
        route: "",
        note: "",
      })),
      eliminationRows: Array.from({ length: ELIMINATION_ROW_COUNT }, () => ({
        time: "",
        urine: "",
        stool: "",
        note: "",
      })),
      seizureNote: "",
      otherNote: "",
    },
  }
}

function normalizeLegacyATContent(legacy: any, base: ATCaseRecordContent): ATCaseRecordContent {
  return {
    front: {
      ...base.front,
      breakfast: legacy.meals?.breakfast?.text || "",
      lunch: legacy.meals?.lunch?.text || "",
      snack: legacy.meals?.snack?.text || "",
      dinner: legacy.meals?.dinner?.text || "",
      hydration1: legacy.meals?.totalWaterIntakeMl ? `総水分:${legacy.meals.totalWaterIntakeMl}ml` : "",
      elimination1: legacy.elimination || "",
      bathing: legacy.bathing || "",
      task1Note: legacy.task1 || "",
      task2Note: legacy.task2 || "",
      task3Note: legacy.task3 || "",
      activityDetail: legacy.activityDetail || "",
      specialNote: legacy.specialNote || "",
      restraint: legacy.wheelchairRestraint || "",
    },
    back: {
      ...base.back,
      seizureNote: legacy.seizures || "",
      otherNote: legacy.otherMessage || legacy.hydrationNote || "",
    },
  }
}

export function normalizeATCaseRecordContent(
  data: any,
  recordDate: string,
  headerOverrides?: ATCaseRecordHeaderOverrides,
): ATCaseRecordContent {
  const base = getDefaultATCaseRecordContent(recordDate, headerOverrides)
  if (!data) return base

  if (!(data.front && data.back)) {
    return normalizeLegacyATContent(data, base)
  }

  const mergedTransport = normalizeTransport(data.front.transport || base.front.transport)
  const mergedFront: ATCaseRecordFront = {
    ...base.front,
    ...data.front,
    date: base.front.date,
    year: data.front.year || base.front.year,
    month: data.front.month || base.front.month,
    day: data.front.day || base.front.day,
    weekday: data.front.weekday || base.front.weekday,
    transport: mergedTransport,
  }

  if (!mergedFront.serviceName) mergedFront.serviceName = base.front.serviceName
  mergedFront.serviceTimeSlot = mergedFront.serviceTimeSlot || mergedFront.serviceTime || base.front.serviceTimeSlot
  mergedFront.serviceTime =
    mergedFront.serviceTime || mergedFront.serviceTimeSlot || base.front.serviceTimeSlot || base.front.serviceTime

  const mergedBack: ATCaseRecordBack = {
    ...base.back,
    ...data.back,
    vitalRows: mergeRowsWithTemplate(base.back.vitalRows, data.back.vitalRows),
    hydrationRows: mergeRowsWithTemplate(base.back.hydrationRows, data.back.hydrationRows),
    eliminationRows: mergeRowsWithTemplate(base.back.eliminationRows, data.back.eliminationRows),
  }

  return { front: mergedFront, back: mergedBack }
}

export function buildATCaseRecordContentFromDailyLog(params: {
  recordDate: string
  dailyLog?: any
  careEvents?: any[]
  userId?: string
  serviceType?: string
  headerOverrides?: ATCaseRecordHeaderOverrides
}): ATCaseRecordContent {
  const { recordDate, dailyLog, careEvents, userId, serviceType, headerOverrides } = params
  const isoDate = normalizeDate(recordDate)
  const events = filterEventsForDate(careEvents, isoDate, userId, serviceType)

  const defaults = getDefaultATCaseRecordContent(isoDate, headerOverrides)
  const frontWithDailyLog: ATCaseRecordFront = {
    ...defaults.front,
    lunch: dailyLog?.meals?.lunch?.text || defaults.front.lunch,
    snack: dailyLog?.meals?.snack?.text || defaults.front.snack,
    dinner: dailyLog?.meals?.dinner?.text || defaults.front.dinner,
    breakfast: dailyLog?.meals?.breakfast?.text || defaults.front.breakfast,
    bathing: dailyLog?.bathing || defaults.front.bathing,
    task1Note: dailyLog?.task1 || defaults.front.task1Note,
    task2Note: dailyLog?.task2 || defaults.front.task2Note,
    task3Note: dailyLog?.task3 || defaults.front.task3Note,
    activityDetail: dailyLog?.activityDetail || defaults.front.activityDetail,
    specialNote: dailyLog?.notes || dailyLog?.specialNotes || defaults.front.specialNote,
    restraint: dailyLog?.wheelchairRestraint || defaults.front.restraint,
  }

  return {
    front: buildFrontFromCareEvents({ events, base: frontWithDailyLog }),
    back: buildBackFromCareEvents(events, {
      ...defaults.back,
      otherNote: dailyLog?.otherMessage || defaults.back.otherNote,
    }),
  }
}

export async function fetchCaseRecordByDate(
  userId: string,
  serviceType: string,
  recordDate: string,
): Promise<CaseRecordRow[]> {
  const supabase = getSupabaseCaseRecords()
  const { data, error } = await supabase
    .from("case_records")
    .select("*")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("record_date", normalizeDate(recordDate))
  if (error) {
    console.error("[case-records] fetchCaseRecordByDate failed", error)
    throw error
  }
  return data || []
}

export async function fetchStructuredCaseRecord(
  userId: string,
  serviceType: string,
  recordDate: string,
): Promise<CaseRecordRow | null> {
  const supabase = getSupabaseCaseRecords()
  const { data, error } = await supabase
    .from("case_records")
    .select("*")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("record_date", normalizeDate(recordDate))
    .eq("section", "content")
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[case-records] fetchStructuredCaseRecord failed", error)
    throw error
  }
  return data || null
}

export async function upsertCaseRecordContent(params: {
  userId: string
  serviceType: string
  recordDate: string
  content: ATCaseRecordContent
  template?: CaseRecordTemplate
  source?: string
}): Promise<CaseRecordRow> {
  const { userId, serviceType, recordDate, content } = params
  const template = params.template || pickTemplate(userId)
  const normalizedFront: ATCaseRecordFront = {
    ...content.front,
    date: normalizeDate(recordDate),
    serviceTimeSlot: content.front.serviceTimeSlot || content.front.serviceTime,
    serviceTime: content.front.serviceTime || content.front.serviceTimeSlot || "",
    transport: normalizeTransport(content.front.transport),
  }
  const normalizedContent: ATCaseRecordContent = { ...content, front: normalizedFront }
  const payload: CaseRecordRow = {
    user_id: userId,
    service_type: serviceType,
    record_date: normalizeDate(recordDate),
    section: "content",
    item_key: template,
    item_value: undefined,
    content: { template, data: normalizedContent },
    template,
    source: params.source || "manual",
    updated_at: new Date().toISOString(),
  }

  const supabase = getSupabaseCaseRecords()
  const { data, error } = await supabase.from("case_records").upsert(payload).select().maybeSingle()
  if (error) {
    console.error("[case-records] upsertCaseRecordContent failed", error)
    throw error
  }
  return data as CaseRecordRow
}

export async function upsertCaseRecordFromDailyLog(
  userId: string,
  serviceType: string,
  recordDate: string,
  dailyLog: any,
  careEvents?: any[],
  headerOverrides?: ATCaseRecordHeaderOverrides,
): Promise<CaseRecordRow> {
  const template = pickTemplate(userId)
  const content = buildATCaseRecordContentFromDailyLog({
    recordDate,
    dailyLog,
    careEvents,
    userId,
    serviceType,
    headerOverrides,
  })
  return upsertCaseRecordContent({
    userId,
    serviceType,
    recordDate,
    content,
    template,
    source: "daily-log",
  })
}

export async function fetchCaseRecordDates(params: {
  userId: string
  serviceType: string
  days?: number
}): Promise<string[]> {
  const { userId, serviceType, days = HISTORY_DAYS_DEFAULT } = params
  const since = new Date()
  since.setDate(since.getDate() - days)
  const supabase = getSupabaseCaseRecords()
  const { data, error } = await supabase
    .from("case_records")
    .select("record_date")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("section", "content")
    .gte("record_date", since.toISOString().slice(0, 10))
    .order("record_date", { ascending: false })

  if (error) throw error
  const dates = (data || []).map((row: any) => row.record_date as string).filter(Boolean)
  const unique = Array.from(new Set(dates))
  return unique
}
