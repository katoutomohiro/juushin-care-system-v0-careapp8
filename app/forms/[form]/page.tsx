"use client"

import { useMemo } from "react"
import type { ReactElement } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ActivityForm } from "@/components/forms/activity-form"
import { CommunicationForm } from "@/components/forms/communication-form"
import { ExcretionForm } from "@/components/forms/excretion-form"
import { ExpressionForm } from "@/components/forms/expression-form"
import { HydrationForm } from "@/components/forms/hydration-form"
import { InfectionPreventionForm } from "@/components/forms/infection-prevention-form"
import { MealTubeFeedingForm } from "@/components/forms/meal-tube-feeding-form"
import { PositioningForm } from "@/components/forms/positioning-form"
import { RespiratoryForm } from "@/components/forms/respiratory-form"
import { SeizureForm } from "@/components/forms/seizure-form"
import { SkinOralCareForm } from "@/components/forms/skin-oral-care-form"
import { SwallowingForm } from "@/components/forms/swallowing-form"
import { TransportationForm } from "@/components/forms/transportation-form"
import { TubeFeedingForm } from "@/components/forms/tube-feeding-form"
import { VitalsForm } from "@/components/forms/vitals-form"
import { DataStorageService } from "@/services/data-storage-service"

type FormComponent = (props: { selectedUser: string; onSubmit: (data: any) => void; onCancel: () => void }) => ReactElement

const FORM_COMPONENTS: Record<string, FormComponent> = {
  seizure: SeizureForm,
  expression: ExpressionForm,
  vitals: VitalsForm,
  hydration: HydrationForm,
  excretion: ExcretionForm,
  activity: ActivityForm,
  respiratory: RespiratoryForm,
  swallowing: SwallowingForm,
  communication: CommunicationForm,
  positioning: PositioningForm,
  skinOralCare: SkinOralCareForm,
  infectionPrevention: InfectionPreventionForm,
  tubeFeeding: TubeFeedingForm,
  mealTubeFeeding: MealTubeFeedingForm,
  transportation: TransportationForm,
}

export default function FormPage() {
  const params = useParams<{ form: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const formKey = params.form
  const selectedUser = searchParams.get("user") || ""
  const serviceId = searchParams.get("service") || ""
  const FormComponent = FORM_COMPONENTS[formKey]

  const redirectUrl = useMemo(() => {
    if (serviceId && selectedUser) {
      return `/services/${serviceId}/users/${encodeURIComponent(selectedUser)}/daily-logs`
    }
    return "/daily-log"
  }, [serviceId, selectedUser])

  const handleSubmit = (data: any) => {
    if (!selectedUser || !serviceId) {
      alert("利用者またはサービスが指定されていません。もう一度お試しください。")
      return
    }
    const timestamp =
      data?.timestamp ||
      (data?.time ? `${new Date().toISOString().slice(0, 10)}T${data.time}:00` : new Date().toISOString())

    DataStorageService.saveCareEvent({
      ...data,
      eventType: formKey,
      timestamp,
      time: data?.time || new Date(timestamp).toISOString().slice(11, 16),
      userId: selectedUser,
      serviceId,
    })

    router.push(redirectUrl)
  }

  if (!FormComponent) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">フォームが見つかりません</h1>
        <p className="mt-2 text-sm text-muted-foreground">指定されたフォームID: {formKey}</p>
      </main>
    )
  }

  return (
    <FormComponent
      selectedUser={selectedUser}
      onSubmit={handleSubmit}
      onCancel={() => router.push(redirectUrl)}
    />
  )
}
