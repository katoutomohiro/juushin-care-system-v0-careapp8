import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

const TOKYO_TZ = "Asia/Tokyo"

export function now(): dayjs.Dayjs {
  return dayjs().tz(TOKYO_TZ)
}

export function parse(dateString: string): dayjs.Dayjs {
  return dayjs(dateString).tz(TOKYO_TZ)
}

export function format(date: dayjs.Dayjs | string, formatStr = "YYYY-MM-DD HH:mm:ss"): string {
  const d = typeof date === "string" ? parse(date) : date
  return d.format(formatStr)
}

export function toTokyo(date: dayjs.Dayjs | string): dayjs.Dayjs {
  const d = typeof date === "string" ? dayjs(date) : date
  return d.tz(TOKYO_TZ)
}
