export function getPublicAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

  if (!url) {
    throw new Error(
      "Missing public app URL env (NEXT_PUBLIC_APP_URL or NEXTAUTH_URL or VERCEL_URL)"
    )
  }

  return url.replace(/\/$/, "")
}
