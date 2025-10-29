/**
 * Column definition for CSV export
 */
export type CsvColumn<T> = {
  key: keyof T | string
  header: string
  map?: (value: any, row: T) => string
}

/**
 * Options for CSV export
 */
export type ExportAsCsvOptions<T> = {
  filename?: string
  maskFields?: string[]
  rowMapper?: (row: T) => T
}

/**
 * Get value from object by path (supports nested like "user.name")
 */
function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)
}

/**
 * Convert value to string
 */
function stringify(v: any) {
  if (v == null) return ""
  if (Array.isArray(v)) return v.join(", ")
  if (typeof v === "object") return JSON.stringify(v)
  return String(v)
}

/**
 * Pure function: Convert data to 2D array with masking
 */
export function toCsvData<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  opts: Pick<ExportAsCsvOptions<T>, "maskFields" | "rowMapper">
): { headers: string[]; body: string[][] } {
  const headers = columns.map((c) => c.header)
  const masked = rows.map((r) => (opts.rowMapper ? opts.rowMapper(r) : r))
  const body = masked.map((row) =>
    columns.map((c) => {
      const key = String(c.key)
      const raw = getByPath(row as any, key)
      const masked =
        opts.maskFields && opts.maskFields.includes(key) ? "***" : raw
      return c.map ? c.map(masked, row) : stringify(masked)
    })
  )
  return { headers, body }
}

/**
 * Export data as CSV (new column-driven API)
 */
export function exportAsCsvV2<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  options: ExportAsCsvOptions<T> = {}
): string {
  const { headers, body } = toCsvData(rows, columns, {
    maskFields: options.maskFields,
    rowMapper: options.rowMapper,
  })

  // Escape CSV values
  const escape = (value: string): string => {
    const cleaned = value.replace(/\r?\n/g, " ")
    return `"${cleaned.replace(/"/g, '""')}"`
  }

  const headerRow = headers.map(escape).join(",")
  const dataRows = body.map((row) => row.map(escape).join(","))

  const csv = [headerRow, ...dataRows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  return URL.createObjectURL(blob)
}

/**
 * Export data as CSV (legacy API - kept for backward compatibility)
 * @param data Array of records to export
 * @param headers Array of column names (header row)
 * @param rowMapper Function to map each record to an array of values (must match headers length)
 * @returns Blob URL for download
 * 
 * @deprecated Use exportAsCsvV2 with column definitions for better type safety and masking support
 * 
 * TODO: 個人情報保護対応
 * - マスキングオプション追加（例：氏名 → イニシャル、生年月日 → 年齢）
 * - 監査ログ記録（exportされたデータの記録）
 * - アクセス権限チェック（role-based export制限）
 * 
 * @example
 * // Basic usage
 * const csvUrl = exportAsCsv(
 *   users,
 *   ['id', 'name', 'email'],
 *   (u) => [u.id, u.name, u.email]
 * )
 * 
 * @example
 * // With future masking option (TODO)
 * const csvUrl = exportAsCsv(
 *   users,
 *   ['id', 'name', 'email'],
 *   (u) => [u.id, maskName(u.name), maskEmail(u.email)],
 *   { enableMasking: true } // Future option
 * )
 */
export function exportAsCsv<T>(
  data: T[],
  headers: string[],
  rowMapper: (item: T) => (string | number | null | undefined)[]
): string {
  // Escape CSV values: wrap in quotes and escape internal quotes
  const escape = (value: string | number | null | undefined): string => {
    const str = String(value ?? "")
    // Replace line breaks with spaces, escape quotes
    const cleaned = str.replace(/\r?\n/g, " ")
    return `"${cleaned.replace(/"/g, '""')}"`
  }

  const headerRow = headers.join(",")
  const dataRows = data.map((item) => {
    const values = rowMapper(item)
    return values.map(escape).join(",")
  })

  const csv = [headerRow, ...dataRows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  return URL.createObjectURL(blob)
}
