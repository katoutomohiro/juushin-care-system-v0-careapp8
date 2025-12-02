"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { UserDailyLogTimeline } from "./user-daily-log-timeline"

type UserOption = { id: string; name: string }

interface Props {
  users: UserOption[]
  initialUserId?: string
}

export default function DailyLogPageClient({ users, initialUserId }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedUser, setSelectedUser] = useState(initialUserId || "")

  const userOptions = useMemo(() => users, [users])

  const handleChangeUser = (userId: string) => {
    setSelectedUser(userId)
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (userId) {
      params.set("user", userId)
    } else {
      params.delete("user")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">日誌タイムライン</h1>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <label htmlFor="user-select" className="text-sm font-medium">
          利用者を選択:
        </label>
        <select
          id="user-select"
          name="user"
          value={selectedUser}
          onChange={(e) => handleChangeUser(e.target.value)}
          className="mt-2 w-full rounded border px-3 py-2 text-sm"
        >
          <option value="">全ての利用者</option>
          {userOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <UserDailyLogTimeline heading="直近の記録" userId={selectedUser || undefined} />
    </div>
  )
}
