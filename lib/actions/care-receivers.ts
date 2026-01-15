'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate care receivers cache after CRUD operations
// Refreshes: service user lists, API cache, dashboard pages
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

// Create new care receiver with automatic data refresh
// Fields: code, name, service_code, age, gender, care_level, condition, medical_care
export async function createCareReceiverAction(data: {
  code: string
  name: string
  service_code: string
  age?: number
  gender?: string
  care_level?: number
  condition?: string
  medical_care?: string
}) {
  try {
    const response = await fetch('/api/care-receivers/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    if (result.ok) {
      await revalidateCareReceiversData()
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[createCareReceiverAction]', message)
    return { ok: false, error: message }
  }
}

// Update care receiver with automatic data refresh
// Partial fields: name, age, gender, care_level, condition, medical_care, is_active
export async function updateCareReceiverAction(
  id: string,
  data: Partial<{
    name?: string
    age?: number
    gender?: string
    care_level?: number
    condition?: string
    medical_care?: string
    is_active?: boolean
  }>
) {
  try {
    const response = await fetch(`/api/care-receivers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    if (result.ok) {
      await revalidateCareReceiversData()
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[updateCareReceiverAction]', message)
    return { ok: false, error: message }
  }
}

// Delete care receiver with automatic data refresh
export async function deleteCareReceiverAction(id: string) {
  try {
    const response = await fetch(`/api/care-receivers/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    if (result.ok) {
      await revalidateCareReceiversData()
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[deleteCareReceiverAction]', message)
    return { ok: false, error: message }
  }
}
