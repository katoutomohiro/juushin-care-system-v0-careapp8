import { NextResponse } from "next/server"
import { listStaffMembers, upsertStaffMember, updateStaffMember } from "@/lib/staff"

export async function GET() {
  try {
    const staff = await listStaffMembers()
    return NextResponse.json({ staff })
  } catch (e: any) {
    console.error("[staff] GET failed", e)
    return NextResponse.json({ error: e?.message || "Failed to fetch staff" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body?.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    const staff = await upsertStaffMember({ name: String(body.name), is_active: body?.is_active ?? true })
    return NextResponse.json({ staff })
  } catch (e: any) {
    console.error("[staff] POST failed", e)
    return NextResponse.json({ error: e?.message || "Failed to save staff" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    if (!body?.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }
    const staff = await updateStaffMember({
      id: String(body.id),
      name: body?.name !== undefined ? String(body.name) : undefined,
      is_active: body?.is_active,
    })
    return NextResponse.json({ staff })
  } catch (e: any) {
    console.error("[staff] PATCH failed", e)
    return NextResponse.json({ error: e?.message || "Failed to update staff" }, { status: 500 })
  }
}
