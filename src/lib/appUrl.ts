export const getAppUrl = () => {
  // Priority: NEXT_PUBLIC_APP_URL > NEXTAUTH_URL > VERCEL_URL > ""
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Returns empty string as fallback (never on localhost)
  return ""
}
