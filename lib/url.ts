export const formUrl = (form: string, serviceId: string, userId: string) =>
  `/forms/${form}?user=${encodeURIComponent(userId)}&service=${serviceId}`;
