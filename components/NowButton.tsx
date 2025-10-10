"use client"
import { Button } from "@/components/ui/button"

export function NowButton({ onNow }: { onNow: (iso: string) => void }) {
  const handleClick = () => {
    const d = new Date()
    const offset = d.getTimezoneOffset() * 60000
    const localISO = new Date(d.getTime() - offset).toISOString().slice(0, 16)
    onNow(localISO)
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      今すぐ
    </Button>
  )
}
