import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const supabaseCaseRecords = createClient(supabaseUrl, supabaseKey)

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

export type ATCaseRecordBack = {
  vitalRows: ATCaseRecordVitalRow[]
  hydrationRows: ATCaseRecordHydrationRow[]
  eliminationRows: ATCaseRecordEliminationRow[]
  seizureNote: string
  otherNote: string
}

export type ATCaseRecordFront = {
  date: string
  serviceName: string
  serviceTime: string
  userName: string
  age: string
  sex: string
  recorder: string
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

function normalizeDate(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10)
  return parsed.toISOString().slice(0, 10)
}

function pickTemplate(userId?: string): CaseRecordTemplate {
  return (userId && caseRecordTemplateByUserId[userId]) || "AT"
}

export function resolveCaseRecordTemplate(userId?: string): CaseRecordTemplate {
  return pickTemplate(userId)
}

function filterEventsForDate(events: any[] | undefined, recordDate: string, userId?: string) {
  if (!Array.isArray(events)) return []
  const isoDate = normalizeDate(recordDate)
  return events.filter((ev) => {
    if (userId && ev.userId && ev.userId !== userId) return false
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

export function getDefaultATCaseRecordContent(
  recordDate: string,
  headerOverrides?: Partial<Pick<ATCaseRecordFront, "userName" | "serviceName" | "serviceTime" | "age" | "sex" | "recorder">>,
): ATCaseRecordContent {
  const date = normalizeDate(recordDate)
  return {
    front: {
      date,
      serviceName: headerOverrides?.serviceName || "",
      serviceTime: headerOverrides?.serviceTime || "",
      userName: headerOverrides?.userName || "",
      age: headerOverrides?.age || "",
      sex: headerOverrides?.sex || "",
      recorder: headerOverrides?.recorder || "",
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

export function buildATCaseRecordContentFromDailyLog(params: {
  recordDate: string
  dailyLog?: any
  careEvents?: any[]
  userId?: string
  headerOverrides?: Partial<Pick<ATCaseRecordFront, "userName" | "serviceName" | "serviceTime" | "age" | "sex" | "recorder">>
}): ATCaseRecordContent {
  const { recordDate, dailyLog, careEvents, userId, headerOverrides } = params
  const isoDate = normalizeDate(recordDate)
  const events = filterEventsForDate(careEvents, isoDate, userId)

  const hydrationSummary = buildFrontHydrationSummary(events)
  const eliminationSummary = buildExcretionSummary(events)

  const defaults = getDefaultATCaseRecordContent(isoDate, headerOverrides)

  return {
    front: {
      ...defaults.front,
      hydration1: hydrationSummary[0] || defaults.front.hydration1,
      hydration2: hydrationSummary[1] || defaults.front.hydration2,
      hydration3: hydrationSummary[2] || defaults.front.hydration3,
      hydration4: hydrationSummary[3] || defaults.front.hydration4,
      hydration5: hydrationSummary[4] || defaults.front.hydration5,
      hydration6: hydrationSummary[5] || defaults.front.hydration6,
      elimination1: eliminationSummary || defaults.front.elimination1,
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
      recorder: dailyLog?.recorder || defaults.front.recorder,
    },
    back: {
      vitalRows: buildVitalRows(events),
      hydrationRows: buildHydrationRows(events),
      eliminationRows: buildEliminationRows(events),
      seizureNote: buildSeizureSummary(events),
      otherNote: dailyLog?.otherMessage || "",
    },
  }
}

export async function fetchCaseRecordByDate(
  userId: string,
  serviceType: string,
  recordDate: string,
): Promise<CaseRecordRow[]> {
  const { data, error } = await supabaseCaseRecords
    .from("case_records")
    .select("*")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("record_date", normalizeDate(recordDate))
  if (error) throw error
  return data || []
}

export async function fetchStructuredCaseRecord(
  userId: string,
  serviceType: string,
  recordDate: string,
): Promise<CaseRecordRow | null> {
  const { data, error } = await supabaseCaseRecords
    .from("case_records")
    .select("*")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("record_date", normalizeDate(recordDate))
    .eq("section", "content")
    .limit(1)
    .maybeSingle()

  if (error) throw error
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
  const payload: CaseRecordRow = {
    user_id: userId,
    service_type: serviceType,
    record_date: normalizeDate(recordDate),
    section: "content",
    item_key: template,
    item_value: undefined,
    content: { template, data: { ...content, front: { ...content.front, date: normalizeDate(recordDate) } } },
    template,
    source: params.source || "manual",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseCaseRecords.from("case_records").upsert(payload).select().maybeSingle()
  if (error) throw error
  return data as CaseRecordRow
}

export async function upsertCaseRecordFromDailyLog(
  userId: string,
  serviceType: string,
  recordDate: string,
  dailyLog: any,
  careEvents?: any[],
  headerOverrides?: Partial<Pick<ATCaseRecordFront, "userName" | "serviceName" | "serviceTime" | "age" | "sex" | "recorder">>,
): Promise<CaseRecordRow> {
  const template = pickTemplate(userId)
  const content = buildATCaseRecordContentFromDailyLog({ recordDate, dailyLog, careEvents, userId, headerOverrides })
  return upsertCaseRecordContent({
    userId,
    serviceType,
    recordDate,
    content,
    template,
    source: "daily-log",
  })
}
