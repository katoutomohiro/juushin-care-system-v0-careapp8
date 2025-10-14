import type React from "react"
import { useToast } from "./toast"

export { useToast }

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>
}
