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
