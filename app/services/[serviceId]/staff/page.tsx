import { supabaseAdmin } from "@/lib/supabase/serverAdmin"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import Link from "next/link"
import { StaffManagementClient } from "./staff-management-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function StaffManagementPage({
  params,
}: {
  params: Promise<{ serviceId: string }>
}) {
  noStore()
  const resolvedParams = await params
  const serviceIdInput = resolvedParams.serviceId

  // Resolve serviceId to UUID
  let serviceUuid: string
  let serviceName = "サービス"

  if (uuidRegex.test(serviceIdInput)) {
    serviceUuid = serviceIdInput
  } else {
    if (!supabaseAdmin) {
      console.error("[staff page] Supabase admin not available")
      notFound()
    }
    const { data: service } = await supabaseAdmin
      .from("services")
      .select("id, name")
      .eq("slug", serviceIdInput)
      .maybeSingle()
    if (!service?.id) {
      console.error("[staff page] service not found for slug:", serviceIdInput)
      notFound()
    }
    serviceUuid = service.id
    serviceName = service.name || serviceName
  }

  // Fetch service name if UUID was provided
  if (uuidRegex.test(serviceIdInput) && supabaseAdmin) {
    const { data: service } = await supabaseAdmin
      .from("services")
      .select("name")
      .eq("id", serviceUuid)
      .maybeSingle()
    if (service?.name) {
      serviceName = service.name
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/services/${serviceIdInput}`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              ← サービスに戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold">職員管理</h1>
              <p className="text-sm text-muted-foreground">{serviceName}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StaffManagementClient serviceId={serviceUuid} serviceSlug={serviceIdInput} />
      </main>
    </div>
  )
}
