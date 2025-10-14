import type React from "react"
import { useToast, toast } from "./toast" // Assuming the useToast and toast functions are declared in a separate file

export { useToast, toast }

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>
}
