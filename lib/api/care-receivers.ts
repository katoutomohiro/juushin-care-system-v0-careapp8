/**
 * Centralized care-receivers API client
 * Encapsulates all fetch logic and validates required parameters
 * Purpose: Prevent direct /api/care-receivers calls; force all usage through this module
 */

import { buildCareReceiversUrl } from '@/lib/utils/care-receiver-urls'

interface GetCareReceiversParams {
  serviceId: string
  code?: string | null
}

interface CareReceiver {
  id: string
  code: string
  name: string
  service_code: string
  created_at: string
}

interface CareReceiversResponse {
  ok: boolean
  careReceivers: CareReceiver[]
  count: number
  serviceCode: string
}

/**
 * Fetch care-receivers for a service
 * @param serviceId - Required service identifier (e.g., 'life-care')
 * @param code - Optional specific care-receiver code to filter
 * @returns CareReceiversResponse or null if fetch fails
 *
 * Automatically validates serviceId and builds URL with proper parameters.
 * Returns null on error (not thrown) to allow caller to decide error handling.
 */
export async function getCareReceivers({
  serviceId,
  code,
}: GetCareReceiversParams): Promise<CareReceiversResponse | null> {
  try {
    // Validate serviceId (required) and delegate to URL builder
    const url = buildCareReceiversUrl(serviceId, code)
    if (!url) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[getCareReceivers] Invalid parameters:', {
          serviceId: serviceId ? 'present' : 'missing',
          code: code ? 'present' : 'empty',
        })
      }
      return null
    }

    const response = await fetch(url)

    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        const text = await response.text()
        console.error('[getCareReceivers] API error:', {
          url,
          status: response.status,
          statusText: response.statusText,
          body: text.slice(0, 200), // First 200 chars for debugging
        })
      }
      return null
    }

    const data = await response.json()
    return data as CareReceiversResponse
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getCareReceivers] Fetch failed:', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
    return null
  }
}

/**
 * Fetch a single care-receiver by code
 * @param serviceId - Service identifier
 * @param code - Care-receiver code
 * @returns Single care receiver or null if not found or error occurs
 */
export async function getCareReceiverByCode(
  serviceId: string,
  code: string
): Promise<CareReceiver | null> {
  const response = await getCareReceivers({ serviceId, code })
  if (response?.ok && response.careReceivers.length > 0) {
    return response.careReceivers[0]
  }
  return null
}
