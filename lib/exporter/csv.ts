/**
 * Export data as CSV
 * @param data Array of records to export
 * @param headers Array of column names (header row)
 * @param rowMapper Function to map each record to an array of values (must match headers length)
 * @returns Blob URL for download
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
