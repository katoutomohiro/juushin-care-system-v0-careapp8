/**
 * 利用者関連のURL生成関数
 * 複数の画面で同じURL生成ロジックを共有し、404を防ぐ
 */

/**
 * ケース記録ページへのURLを生成
 * @param serviceId サービスID（デフォルト: 'life-care'）
 * @param userId ユーザーID（未指定時は'AT'がデフォルト）
 * @returns ケース記録ページの相対URL
 */
export function getCaseRecordsHref(
  serviceId: string = 'life-care',
  userId?: string | null
): string {
  const normalizedUserId = userId || 'AT'
  return `/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/case-records`
}

/**
 * 利用者詳細ページへのURLを生成
 * @param serviceId サービスID
 * @param userId ユーザーID
 * @returns 利用者詳細ページの相対URL
 */
export function getCareReceiverDetailHref(
  serviceId: string = 'life-care',
  userId?: string | null
): string {
  const normalizedUserId = userId || 'AT'
  return `/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}`
}

/**
 * 日誌ページへのURLを生成
 * @param serviceId サービスID
 * @param userId ユーザーID
 * @returns 日誌ページの相対URL
 */
export function getDailyLogsHref(
  serviceId: string = 'life-care',
  userId?: string | null
): string {
  const normalizedUserId = userId || 'AT'
  return `/services/${serviceId}/users/${encodeURIComponent(normalizedUserId)}/daily-logs`
}

/**
 * 利用者APIのURLを生成
 * @param serviceId サービスID（必須）
 * @param code 利用者コード（任意）
 * @returns APIの相対URL（serviceIdが無ければnull）
 */
export function buildCareReceiversUrl(
  serviceId: string,
  code?: string | null
): string | null {
  const normalizedServiceId = serviceId.trim()
  if (!normalizedServiceId) return null

  const normalizedCode = code?.trim()
  if (code !== undefined && !normalizedCode) return null

  const params = new URLSearchParams()
  params.set('serviceId', normalizedServiceId)
  if (normalizedCode) params.set('code', normalizedCode)

  return `/api/care-receivers?${params.toString()}`
}
