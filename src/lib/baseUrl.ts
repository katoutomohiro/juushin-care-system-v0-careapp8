import { getAppUrl } from "./appUrl"

export function getPublicAppUrl(): string {
  return getAppUrl().replace(/\/$/, "")
}
