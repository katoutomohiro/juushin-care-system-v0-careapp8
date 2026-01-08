// Normalize display name like "A・T" or "A.T" or "A-T" or "AT" to internal id like "AT"
// Removes: full-width middle dot (・), periods (.), hyphens (-), spaces, and "さん" suffix
// Then converts to uppercase
export function toInternalId(value: string): string {
  if (!value) return ""
  return (
    value
      .replace(/・/g, "") // Remove full-width middle dot
      .replace(/\./g, "") // Remove periods
      .replace(/-/g, "") // Remove hyphens
      .replace(/\s+/g, "") // Remove all whitespace
      .replace(/さん$/u, "") // Remove "さん" suffix
      .trim()
      .toUpperCase()
  )
}
export const formUrl = (form: string, serviceId: string, userId: string) =>
  `/forms/${form}?user=${encodeURIComponent(userId)}&service=${serviceId}`;

export const buildUserDiaryUrl = (
  serviceId: string,
  userId: string,
  careReceiverId?: string | null,
) => {
  const internal = toInternalId(userId)
  const base = `/services/${serviceId}/users/${encodeURIComponent(internal)}/diary`
  return careReceiverId ? `${base}?careReceiverId=${encodeURIComponent(careReceiverId)}` : base
}

export const buildSeizureUrl = (
  serviceId: string,
  userId: string,
  careReceiverId?: string | null,
) => {
  const base = `/daily-log/seizure`
  const params = new URLSearchParams()
  params.set('serviceId', serviceId)
  params.set('userId', toInternalId(userId))
  if (careReceiverId) {
    params.set('careReceiverId', careReceiverId)
  }
  return `${base}?${params.toString()}`
}

export const buildVitalsUrl = (
  serviceId: string,
  userId: string,
  careReceiverId?: string | null,
) => {
  const base = `/forms/vitals`
  const params = new URLSearchParams()
  params.set('user', toInternalId(userId))
  params.set('service', serviceId)
  if (careReceiverId) {
    params.set('careReceiverId', careReceiverId)
  }
  return `${base}?${params.toString()}`
}
