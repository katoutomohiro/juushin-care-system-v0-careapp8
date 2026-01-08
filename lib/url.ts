export const formUrl = (form: string, serviceId: string, userId: string) =>
  `/forms/${form}?user=${encodeURIComponent(userId)}&service=${serviceId}`;

export const buildUserDiaryUrl = (
  serviceId: string,
  userId: string,
  careReceiverId?: string | null,
) => {
  const base = `/services/${serviceId}/users/${encodeURIComponent(userId)}/diary`
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
  params.set('userId', userId)
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
  params.set('user', userId)
  params.set('service', serviceId)
  if (careReceiverId) {
    params.set('careReceiverId', careReceiverId)
  }
  return `${base}?${params.toString()}`
}
