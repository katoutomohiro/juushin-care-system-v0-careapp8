'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Server action to refresh care receivers list
 * Called after CRUD operations to ensure data is re-fetched
 * 
 * This revalidates:
 * - /services/*/users (list pages)
 * - /api/care-receivers/list (API cache)
 * - All dashboard pages that show care receiver info
 */
export async function revalidateCareReceiversData() {
  try {
    // Revalidate the user management list page
    revalidatePath('/services/[serviceId]/users', 'page')
    
    // Revalidate any dashboard pages that might show care receiver data
    revalidatePath('/dashboard', 'page')
    revalidatePath('/services/[serviceId]', 'page')
    
    // Also tag-based revalidation for API routes
    revalidateTag('care-receivers-list')
    revalidateTag('care-receivers-detail')
    
    return { success: true }
  } catch (error) {
    console.error('[revalidateCareReceiversData] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Create a new care receiver with automatic data refresh
 */
export async function createCareReceiverAction(data: {
  code: string
  display_name: string
  service_code: string
  age?: number
  gender?: string
  care_level?: number
  condition?: string
  medical_care?: string
  notes?: string
}) {
  try {
    const response = await fetch('/api/care-receivers/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.ok) {
      // Refresh all related pages
      await revalidateCareReceiversData()
      return result
    } else {
      return result
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[createCareReceiverAction] Error:', error)
    return { ok: false, error: message }
  }
}

/**
 * Update an existing care receiver with automatic data refresh
 */
export async function updateCareReceiverAction(
  id: string,
  data: Partial<{
    code?: string
    display_name?: string
    age?: number
    gender?: string
    care_level?: number
    condition?: string
    medical_care?: string
    notes?: string
  }>
) {
  try {
    const response = await fetch(`/api/care-receivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.ok) {
      // Refresh all related pages
      await revalidateCareReceiversData()
      return result
    } else {
      return result
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[updateCareReceiverAction] Error:', error)
    return { ok: false, error: message }
  }
}

/**
 * Delete a care receiver with automatic data refresh
 */
export async function deleteCareReceiverAction(id: string) {
  try {
    const response = await fetch(`/api/care-receivers/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await response.json()

    if (result.ok) {
      // Refresh all related pages
      await revalidateCareReceiversData()
      return result
    } else {
      return result
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[deleteCareReceiverAction] Error:', error)
    return { ok: false, error: message }
  }
}
