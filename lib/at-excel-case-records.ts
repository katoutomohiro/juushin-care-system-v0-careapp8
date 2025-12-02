import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

let supabaseCaseRecords: SupabaseClient | null = null

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SupabaseのURLまたはキーが設定されていません")
  }
  if (!supabaseCaseRecords) {
    supabaseCaseRecords = createClient(supabaseUrl, supabaseKey)
  }
  return supabaseCaseRecords
}

export const AT_STRUCTURED_TEMPLATE = "at_structured_v1"

export type ATCaseRecordHeader = {
  serviceType: "life-care"
  recordDate: string // YYYY-MM-DD
  userName?: string | null
  name?: string | null // legacy/fallback
  weekday?: string | null
  serviceTimeSlot?: string
  totalServiceTimeSlot?: string | null
  serviceTime?: {
    start: string | null
    end: string | null
  }
  daytimeSupportMorningStart?: string | null
  daytimeSupportMorningEnd?: string | null
  daytimeSupportAfternoonStart?: string | null
  daytimeSupportAfternoonEnd?: string | null
  mainStaffId?: string | null
  subStaffId?: string | null
  staffId?: string | null
  staffName?: string | null
}

export type ATCaseRecordTransportation = {
  pickupFromGroupHome?: { by?: string | null; time?: string | null }
  pickupToOffice?: { by?: string | null; time?: string | null }
  dropFromOffice?: { by?: string | null; time?: string | null }
  dropToGroupHome?: { by?: string | null; time?: string | null }
  routeNote?: string | null
  // legacy
  ghArrivalTime?: string | null
  officeArrivalTime?: string | null
  officeDepartureTime?: string | null
  ghReturnTime?: string | null
}

export type ATCaseRecordTemperature = {
  morning?: number | null
  noon?: number | null
  evening?: number | null
  night?: number | null
  note?: string | null
}

export type ATCaseRecordHydrationItem =
  | "\u304a\u8336"
  | "\u767d\u6e6f"
  | "\u30dd\u30ab\u30ea"
  | "\u6c34"
  | "\u725b\u4e73"
  | "\u305d\u306e\u4ed6"

export type ATCaseRecordHydration = {
  amounts: Partial<Record<ATCaseRecordHydrationItem, number | null>>
  items: {
    time?: string | null
    type: ATCaseRecordHydrationItem | ""
    amountMl?: number | null
    note?: string | null
  }[]
  note?: string | null
}

export type ATCaseRecordExcretionAmount = "\u306a\u3057" | "\u5c11\u91cf" | "\u666e\u901a" | "\u591a\u3044" | ""
export type ATCaseRecordStoolQuality = "\u786c\u3044" | "\u666e\u901a" | "\u8edf\u4fbf" | "\u4e0b\u75c5" | "\u305d\u306e\u4ed6" | ""
// legacy aliases for UI compatibility
export type ATCaseRecordExcretionStatus = ATCaseRecordExcretionAmount
export type ATCaseRecordExcretionCondition = ATCaseRecordStoolQuality

export type ATCaseRecordExcretion = {
  urineStatus?: ATCaseRecordExcretionAmount
  stoolCondition?: ATCaseRecordStoolQuality
  note?: string | null
  events: {
    time?: string | null
    urineAmount?: ATCaseRecordExcretionAmount
    stoolAmount?: ATCaseRecordExcretionAmount
    stoolQuality?: ATCaseRecordStoolQuality
  }[]
}

export type ATCaseRecordMealAmount = number

export type ATCaseRecordMeal = {
  lunchAmount?: number | null // 0-10
  lunchCareNote?: string | null
  dinnerAmount?: number | null // 0-10
  dinnerCareNote?: string | null
  lunchMedication?: boolean
  dinnerMedication?: boolean
  lunchOralCare?: boolean
  dinnerOralCare?: boolean
  otherNote?: string | null
}

export type ATCaseRecordBath = {
  status?: string | null // legacy
  done?: "\u5165\u6d74" | "\u6e05\u62ed" | "\u306a\u3057" | ""
  time?: string | null
  perinealCare?: boolean
  careNote?: string | null
}

export type ATCaseRecordTask = {
  menuOption?: "\u30b9\u30c8\u30ec\u30c3\u30c1\u30fb\u30de\u30c3\u30b5\u30fc\u30b8" | "\u7acb\u3061\u4e0a\u304c\u308a\u8a13\u7df4" | "\u6b69\u884c" | "\u305d\u306e\u4ed6"
  menuDetail?: string
  muscleContracturePrevention?: {
    stretchUpperLimb?: boolean
    stretchLowerLimb?: boolean
    shoulderMassage?: boolean
    waistMassage?: boolean
    hipJointRange?: boolean
    notes?: string | null
  }
    communication?: {
      tools?: {
        communicationCard?: boolean
        photoCard?: boolean
        gesture?: boolean
        facialExpression?: boolean
        other?: boolean
      }
      toiletGuidance?: boolean
      reactionLevel?: "\u53cd\u5fdc\u306a\u3057" | "\u5c11\u3057\u53cd\u5fdc\u3042\u308a" | "\u3088\u304f\u53cd\u5fdc\u3042\u308a" | ""
      notes?: string | null
    }
}

export type ATCaseRecordFallPrevention = {
  note?: string | null
}

export type ATCaseRecordLowerLimbFunction = {
  orthosisUsed?: boolean
  standUpTrainingCount?: number | null
  notes?: string | null
  note?: string | null
}

export type ATCaseRecordSleep = {
  status?: string | null
  note?: string | null
}

export type ATCaseRecordSpecialNote = {
  note?: string | null
}

export type ATCaseRecordActivity = {
  note?: string | null
}

export type ATCaseRecordComplication = {
  note?: string | null
}

export type ATCaseRecordRestraint = {
  used?: "\u4f7f\u7528\u306a\u3057" | "\u4f7f\u7528\u3042\u308a" | ""
  types?: {
    table?: boolean
    kneeBelt?: boolean
    other?: boolean
  }
  notes?: string | null
}

export type ATCaseRecordContent = {
  header: ATCaseRecordHeader
  transportation: ATCaseRecordTransportation
  temperature: ATCaseRecordTemperature
  hydration: ATCaseRecordHydration
  excretion: ATCaseRecordExcretion
  meal: ATCaseRecordMeal
  bath: ATCaseRecordBath
  task: ATCaseRecordTask
  fallPrevention: ATCaseRecordFallPrevention
  lowerLimbFunction: ATCaseRecordLowerLimbFunction
  sleep: ATCaseRecordSleep
  specialNote: ATCaseRecordSpecialNote
  activity: ATCaseRecordActivity
  complication: ATCaseRecordComplication
  restraints?: ATCaseRecordRestraint
}

function buildRecordDate(dateStr: string) {
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function buildDefaultHydrationAmounts(): ATCaseRecordHydration["amounts"] {
  return {
    ["\u304a\u8336"]: null,
    ["\u767d\u6e6f"]: null,
    ["\u30dd\u30ab\u30ea"]: null,
    ["\u725b\u4e73"]: null,
    ["\u6c34"]: null,
    ["\u305d\u306e\u4ed6"]: null,
  }
}

function buildDefaultHydrationItems(): ATCaseRecordHydration["items"] {
  return Array.from({ length: 4 }).map(() => ({
    time: null,
    type: "" as ATCaseRecordHydrationItem | "",
    amountMl: null,
    note: null,
  }))
}

function buildDefaultExcretionEvents(): ATCaseRecordExcretion["events"] {
  return Array.from({ length: 3 }).map(() => ({
    time: null,
    urineAmount: "",
    stoolAmount: "",
    stoolQuality: "",
  }))
}

export function buildDefaultATCaseRecordContent(params: {
  recordDate: string
  serviceType: "life-care"
  serviceTimeSlot?: string
  staffId?: string | null
  staffName?: string | null
  userName?: string | null
}): ATCaseRecordContent {
  const { recordDate, serviceType, serviceTimeSlot = "", staffId = null, staffName = null, userName = null } = params
  const date = buildRecordDate(recordDate)

  return {
    header: {
      serviceType,
      recordDate: date.toISOString().slice(0, 10),
      userName,
      name: userName,
      weekday: undefined,
      serviceTimeSlot,
      totalServiceTimeSlot: "",
      serviceTime: { start: null, end: null },
      daytimeSupportMorningStart: null,
      daytimeSupportMorningEnd: null,
      daytimeSupportAfternoonStart: null,
      daytimeSupportAfternoonEnd: null,
      mainStaffId: staffId,
      subStaffId: null,
      staffId,
      staffName,
    },
    transportation: {
      pickupFromGroupHome: { by: null, time: null },
      pickupToOffice: { by: null, time: null },
      dropFromOffice: { by: null, time: null },
      dropToGroupHome: { by: null, time: null },
      routeNote: "",
      ghArrivalTime: "",
      officeArrivalTime: "",
      officeDepartureTime: "",
      ghReturnTime: "",
    },
    temperature: {
      morning: null,
      noon: null,
      evening: null,
      night: null,
      note: "",
    },
    hydration: {
      amounts: buildDefaultHydrationAmounts(),
      items: buildDefaultHydrationItems(),
      note: "",
    },
    excretion: {
      urineStatus: "",
      stoolCondition: "",
      note: "",
      events: buildDefaultExcretionEvents(),
    },
    meal: {
      lunchAmount: null,
      lunchCareNote: "",
      dinnerAmount: null,
      dinnerCareNote: "",
      lunchMedication: false,
      dinnerMedication: false,
      lunchOralCare: false,
      dinnerOralCare: false,
      otherNote: "",
    },
    bath: {
      status: "",
      done: "",
      time: null,
      perinealCare: false,
      careNote: "",
    },
    task: {
      menuOption: undefined,
      menuDetail: "",
      muscleContracturePrevention: {
        stretchUpperLimb: false,
        stretchLowerLimb: false,
        shoulderMassage: false,
        waistMassage: false,
        hipJointRange: false,
        notes: "",
      },
      communication: {
        tools: {
          communicationCard: false,
          photoCard: false,
          gesture: false,
          facialExpression: false,
          other: false,
        },
        toiletGuidance: false,
        reactionLevel: "",
        notes: "",
      },
    },
    fallPrevention: { note: "" },
    lowerLimbFunction: { orthosisUsed: false, standUpTrainingCount: null, notes: "" },
    sleep: { status: "", note: "" },
    specialNote: { note: "" },
    activity: { note: "" },
    complication: { note: "" },
    restraints: {
      used: "",
      types: { table: false, kneeBelt: false, other: false },
      notes: "",
    },
  }
}

export function normalizeATCaseRecordContent(
  content: Partial<ATCaseRecordContent> | null | undefined,
  params: {
    recordDate: string
    serviceType: "life-care"
    serviceTimeSlot?: string
    staffId?: string | null
    staffName?: string | null
    userName?: string | null
  },
): ATCaseRecordContent {
  const base = buildDefaultATCaseRecordContent(params)
  const header: Partial<ATCaseRecordHeader> = content?.header ?? {}
  const safeHydrationAmounts: ATCaseRecordHydration["amounts"] = {
    ...buildDefaultHydrationAmounts(),
    ...(content?.hydration?.amounts || {}),
  }
  const safeHydrationItems = (content?.hydration?.items || buildDefaultHydrationItems()).map(
    (item): ATCaseRecordHydration["items"][number] => ({
      time: item?.time ?? null,
      type: (item?.type || "") as ATCaseRecordHydrationItem | "",
      amountMl: item?.amountMl ?? null,
      note: item?.note ?? null,
    }),
  )
  while (safeHydrationItems.length < 4) safeHydrationItems.push(...buildDefaultHydrationItems().slice(0, 4 - safeHydrationItems.length))

  const safeExcretionEvents = (content?.excretion?.events || buildDefaultExcretionEvents()).map(
    (ev): ATCaseRecordExcretion["events"][number] => ({
      time: ev?.time ?? null,
      urineAmount: (ev?.urineAmount || "") as ATCaseRecordExcretionAmount,
      stoolAmount: (ev?.stoolAmount || "") as ATCaseRecordExcretionAmount,
      stoolQuality: (ev?.stoolQuality || "") as ATCaseRecordStoolQuality,
    }),
  )
  while (safeExcretionEvents.length < 3)
    safeExcretionEvents.push(...buildDefaultExcretionEvents().slice(0, 3 - safeExcretionEvents.length))

  const resolvedMainStaffId =
    header.mainStaffId ?? header.staffId ?? params.staffId ?? base.header.mainStaffId ?? base.header.staffId ?? null
  const resolvedServiceTimeSlot = header.serviceTimeSlot ?? params.serviceTimeSlot ?? base.header.serviceTimeSlot ?? ""
  const resolvedUserName =
    params.userName ?? header.userName ?? header.name ?? (content?.header as any)?.name ?? base.header.userName ?? base.header.name ?? null
  const resolvedTotalServiceTimeSlot =
    header.totalServiceTimeSlot ?? base.header.totalServiceTimeSlot ?? null

  // Legacy transportation fieldsを新構造へ補完
  const legacyTrans = content?.transportation || {}
  const normalizedTransportation: ATCaseRecordTransportation = {
    pickupFromGroupHome: {
      by: legacyTrans.pickupFromGroupHome?.by ?? null,
      time: legacyTrans.pickupFromGroupHome?.time ?? legacyTrans.ghArrivalTime ?? null,
    },
    pickupToOffice: {
      by: legacyTrans.pickupToOffice?.by ?? null,
      time: legacyTrans.pickupToOffice?.time ?? legacyTrans.officeArrivalTime ?? null,
    },
    dropFromOffice: {
      by: legacyTrans.dropFromOffice?.by ?? null,
      time: legacyTrans.dropFromOffice?.time ?? legacyTrans.officeDepartureTime ?? null,
    },
    dropToGroupHome: {
      by: legacyTrans.dropToGroupHome?.by ?? null,
      time: legacyTrans.dropToGroupHome?.time ?? legacyTrans.ghReturnTime ?? null,
    },
    routeNote: legacyTrans.routeNote ?? "",
    ghArrivalTime: legacyTrans.ghArrivalTime ?? "",
    officeArrivalTime: legacyTrans.officeArrivalTime ?? "",
    officeDepartureTime: legacyTrans.officeDepartureTime ?? "",
    ghReturnTime: legacyTrans.ghReturnTime ?? "",
  }

  return {
    header: {
      ...base.header,
      ...header,
      serviceType: params.serviceType,
      recordDate: header.recordDate || base.header.recordDate,
      serviceTimeSlot: resolvedServiceTimeSlot,
      totalServiceTimeSlot: resolvedTotalServiceTimeSlot,
      userName: resolvedUserName,
      name: header.name ?? (content?.header as any)?.name ?? resolvedUserName ?? null,
      serviceTime: {
        start: header.serviceTime?.start ?? base.header.serviceTime?.start ?? null,
        end: header.serviceTime?.end ?? base.header.serviceTime?.end ?? null,
      },
      daytimeSupportMorningStart: header.daytimeSupportMorningStart ?? base.header.daytimeSupportMorningStart ?? null,
      daytimeSupportMorningEnd: header.daytimeSupportMorningEnd ?? base.header.daytimeSupportMorningEnd ?? null,
      daytimeSupportAfternoonStart:
        header.daytimeSupportAfternoonStart ?? base.header.daytimeSupportAfternoonStart ?? null,
      daytimeSupportAfternoonEnd: header.daytimeSupportAfternoonEnd ?? base.header.daytimeSupportAfternoonEnd ?? null,
      mainStaffId: resolvedMainStaffId,
      subStaffId: header.subStaffId ?? null,
      staffId: header.staffId ?? params.staffId ?? null,
      staffName: header.staffName ?? params.staffName ?? null,
    },
    transportation: normalizedTransportation,
    temperature: {
      ...base.temperature,
      ...(content?.temperature || {}),
      note: content?.temperature?.note ?? base.temperature.note,
    },
    hydration: {
      ...base.hydration,
      ...(content?.hydration || {}),
      amounts: safeHydrationAmounts,
      items: safeHydrationItems.slice(0, 4),
      note: content?.hydration?.note ?? base.hydration.note,
    },
    excretion: {
      ...base.excretion,
      ...(content?.excretion || {}),
      urineStatus: content?.excretion?.urineStatus ?? base.excretion.urineStatus,
      stoolCondition: content?.excretion?.stoolCondition ?? base.excretion.stoolCondition,
      note: content?.excretion?.note ?? base.excretion.note,
      events: safeExcretionEvents.slice(0, 3),
    },
    meal: {
      ...base.meal,
      ...(content?.meal || {}),
      lunchCareNote: content?.meal?.lunchCareNote ?? base.meal.lunchCareNote,
      dinnerCareNote: content?.meal?.dinnerCareNote ?? base.meal.dinnerCareNote,
      otherNote: content?.meal?.otherNote ?? base.meal.otherNote,
      lunchMedication: content?.meal?.lunchMedication ?? false,
      dinnerMedication: content?.meal?.dinnerMedication ?? false,
      lunchOralCare: content?.meal?.lunchOralCare ?? false,
      dinnerOralCare: content?.meal?.dinnerOralCare ?? false,
    },
    bath: {
      ...base.bath,
      ...(content?.bath || {}),
      status: content?.bath?.status ?? base.bath.status,
      done: content?.bath?.done ?? base.bath.done,
      time: content?.bath?.time ?? base.bath.time,
      perinealCare: content?.bath?.perinealCare ?? false,
      careNote: content?.bath?.careNote ?? base.bath.careNote,
    },
    task: {
      ...base.task,
      ...(content?.task || {}),
      muscleContracturePrevention: {
        ...base.task.muscleContracturePrevention,
        ...(content?.task?.muscleContracturePrevention || {}),
        notes: content?.task?.muscleContracturePrevention?.notes ?? base.task.muscleContracturePrevention?.notes,
      },
      communication: {
        ...base.task.communication,
        ...(content?.task?.communication || {}),
        tools: {
          ...base.task.communication?.tools,
          ...(content?.task?.communication?.tools || {}),
        },
        toiletGuidance: content?.task?.communication?.toiletGuidance ?? base.task.communication?.toiletGuidance,
        reactionLevel: content?.task?.communication?.reactionLevel ?? base.task.communication?.reactionLevel,
        notes: content?.task?.communication?.notes ?? base.task.communication?.notes,
      },
    },
    fallPrevention: {
      ...base.fallPrevention,
      ...(content?.fallPrevention || {}),
      note: content?.fallPrevention?.note ?? base.fallPrevention.note,
    },
    lowerLimbFunction: {
      ...base.lowerLimbFunction,
      ...(content?.lowerLimbFunction || {}),
      orthosisUsed: content?.lowerLimbFunction?.orthosisUsed ?? false,
      standUpTrainingCount: content?.lowerLimbFunction?.standUpTrainingCount ?? null,
      notes: content?.lowerLimbFunction?.notes ?? base.lowerLimbFunction.notes,
    },
    sleep: {
      ...base.sleep,
      ...(content?.sleep || {}),
      status: content?.sleep?.status ?? base.sleep.status,
      note: content?.sleep?.note ?? base.sleep.note,
    },
    specialNote: {
      ...base.specialNote,
      ...(content?.specialNote || {}),
      note: content?.specialNote?.note ?? base.specialNote.note,
    },
    activity: {
      ...base.activity,
      ...(content?.activity || {}),
      note: content?.activity?.note ?? base.activity.note,
    },
    complication: {
      ...base.complication,
      ...(content?.complication || {}),
      note: content?.complication?.note ?? base.complication.note,
    },
    restraints: {
      used: content?.restraints?.used ?? base.restraints?.used ?? "",
      types: {
        table: content?.restraints?.types?.table ?? base.restraints?.types?.table ?? false,
        kneeBelt: content?.restraints?.types?.kneeBelt ?? base.restraints?.types?.kneeBelt ?? false,
        other: content?.restraints?.types?.other ?? base.restraints?.types?.other ?? false,
      },
      notes: content?.restraints?.notes ?? base.restraints?.notes ?? "",
    },
  }
}

export async function loadATCaseRecord(params: { userId: string; serviceType: string; recordDate: string }) {
  const supabase = getSupabase()
  const { userId, serviceType, recordDate } = params
  const { data, error } = await supabase
    .from("case_records")
    .select("*")
    .eq("user_id", userId)
    .eq("service_type", serviceType)
    .eq("record_date", recordDate)
    .eq("template", AT_STRUCTURED_TEMPLATE)
    .limit(1)
    .maybeSingle()
  if (error) {
    // テーブル未作成 / レコード未登録のときは null を返して初期データ表示で続行
    if ((error as any).code === "PGRST205" || (error as any).code === "PGRST116") {
      console.warn("[ATCaseRecord] table or row not found, returning null", error)
      return null
    }
    console.error("[ATCaseRecord] load failed", error)
    throw error
  }
  const content = data?.content as { template?: string; data?: ATCaseRecordContent } | null
  if (content?.template === AT_STRUCTURED_TEMPLATE && content.data) {
    return normalizeATCaseRecordContent(content.data, {
      recordDate,
      serviceType: "life-care",
      serviceTimeSlot: content.data.header?.serviceTimeSlot || "",
      staffId: content.data.header?.mainStaffId || content.data.header?.staffId || "",
      staffName: content.data.header?.staffName,
      userName: content.data.header?.userName ?? (content.data.header as any)?.name ?? null,
    })
  }
  return null
}

export async function saveATCaseRecord(params: {
  userId: string
  serviceType: string
  recordDate: string
  content: ATCaseRecordContent
}) {
  const supabase = getSupabase()
  const { userId, serviceType, recordDate, content } = params
  const payload = {
    user_id: userId,
    service_type: serviceType,
    record_date: recordDate,
    section: "content",
    item_key: AT_STRUCTURED_TEMPLATE,
    item_value: null,
    content: { template: AT_STRUCTURED_TEMPLATE, data: content },
    template: AT_STRUCTURED_TEMPLATE,
    source: "manual",
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from("case_records").upsert(payload).select().maybeSingle()
  if (error) {
    console.error("[ATCaseRecord] save failed", error)
    throw error
  }
  return data
}

// ---- Aliases for compatibility with existing page imports ----
export function buildDefaultATExcelCaseRecordContent(params: {
  recordDate: string
  serviceType: "life-care"
  serviceTimeSlot?: string
  staffId?: string | null
  staffName?: string | null
  userName?: string | null
}) {
  return buildDefaultATCaseRecordContent(params)
}

export function normalizeATExcelCaseRecordContent(
  input: unknown,
  params?: {
    recordDate: string
    serviceType: "life-care"
    serviceTimeSlot?: string
    staffId?: string | null
    staffName?: string | null
    userName?: string | null
  },
) {
  const fallbackParams =
    params ||
    ({
      recordDate: new Date().toISOString().slice(0, 10),
      serviceType: "life-care",
    } as const)
  return normalizeATCaseRecordContent((input as Partial<ATCaseRecordContent>) || {}, fallbackParams)
}

export function loadATExcelCaseRecord(params: { userId: string; serviceType: string; recordDate: string }) {
  return loadATCaseRecord(params)
}
