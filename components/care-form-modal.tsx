"use client"

import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { SeizureForm } from "./forms/seizure-form"
import { VitalsForm } from "./forms/vitals-form"
import { HydrationForm } from "./forms/hydration-form"
import { TubeFeedingForm } from "./forms/tube-feeding-form"
import { ExpressionForm } from "./forms/expression-form"
import { ExcretionForm } from "./forms/excretion-form"
import { ActivityForm } from "./forms/activity-form"
import { SkinOralCareForm } from "./forms/skin-oral-care-form"
import { RespiratoryForm } from "./forms/respiratory-form"
import { PositioningForm } from "./forms/positioning-form"
import { SwallowingForm } from "./forms/swallowing-form"
import { InfectionPreventionForm } from "./forms/infection-prevention-form"
import { CommunicationForm } from "./forms/communication-form"
import { DataStorageService } from "@/services/data-storage-service"

interface CareFormModalProps {
  isOpen: boolean
  onClose: () => void
  formType: string | null
  onSubmit: (data: any) => void
  selectedUser: string
}

export function CareFormModal({ isOpen, onClose, formType, onSubmit, selectedUser }: CareFormModalProps) {
  const handleSubmit = (data: any) => {
    try {
      const eventData = {
        ...data,
        userId: selectedUser,
        timestamp: new Date().toISOString(),
        eventType: data.eventType,
      }

      const savedEvent = DataStorageService.saveCareEvent(eventData)
      console.log("[v0] Care event saved via DataStorageService:", savedEvent.id)

      onSubmit(savedEvent)
      onClose()
    } catch (error) {
      console.error("[v0] Failed to save care event:", error)
      alert("記録の保存に失敗しました。もう一度お試しください。")
    }
  }

  const renderForm = () => {
    switch (formType) {
      case "seizure":
        return <SeizureForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "vitals":
        return <VitalsForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "hydration":
        return <HydrationForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "tube_feeding":
        return <TubeFeedingForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "expression":
        return <ExpressionForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "excretion":
        return <ExcretionForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "activity":
        return <ActivityForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "skin_oral_care":
        return <SkinOralCareForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "respiratory":
        return <RespiratoryForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "positioning":
        return <PositioningForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "swallowing":
        return <SwallowingForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "infection-prevention":
        return <InfectionPreventionForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      case "communication":
        return <CommunicationForm selectedUser={selectedUser} onSubmit={handleSubmit} onCancel={onClose} />
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">{formType} フォームは準備中です</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-2 border-gray-200 shadow-2xl p-0 max-w-6xl w-[98vw] flex flex-col z-[100] relative">
        <DialogDescription className="sr-only">
          {formType ? `${formType}の記録フォーム` : "ケア記録フォーム"}
        </DialogDescription>
        <div>{renderForm()}</div>
      </DialogContent>
    </Dialog>
  )
}
