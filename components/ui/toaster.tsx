"use client"

import * as ToastPrimitives from "@radix-ui/react-toast"
import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider>
      {toasts.map(({ id, title, description, action, type, duration, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastPrimitives.Provider>
  )
}
