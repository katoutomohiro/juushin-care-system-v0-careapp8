"use client"

import type React from "react"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CareFormLayoutProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children" | "className"> & {
  title: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  children: React.ReactNode
  isSubmitting?: boolean
  className?: string
  formClassName?: string
}

export function CareFormLayout({
  title,
  onSubmit,
  onCancel,
  children,
  isSubmitting = false,
  className,
  formClassName,
  ...formProps
}: CareFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className={cn("h-full", formClassName)} {...formProps}>
      <Card className={cn("flex flex-col h-[95vh] w-full", className)}>
        <CardHeader className="shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-6 p-6 pb-2">{children}</CardContent>

        <CardFooter className="shrink-0 border-t bg-background p-4 flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 bg-transparent"
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-6 bg-green-600 hover:bg-green-700">
            {isSubmitting ? "保存中..." : "記録を保存"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

export default CareFormLayout
