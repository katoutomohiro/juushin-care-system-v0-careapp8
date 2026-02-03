"use client";
import React from "react";
import { lifeCareReceivers } from "@/lib/mock/careReceivers";
import { ActivityForm } from "../forms/activity-form";
import { VitalsForm } from "../forms/vitals-form";
import { SeizureForm } from "../forms/seizure-form";
import { ExpressionForm } from "../forms/expression-form";
import { HydrationForm } from "../forms/hydration-form";
import { ExcretionForm } from "../forms/excretion-form";

export type CommonDiaryProps = {
  serviceId?: string;
  userId?: string;
  careReceiverId?: string;
};

/**
 * CommonDiary composes existing category forms into a single diary UI
 * that can be reused across services.
 */
export default function CommonDiary({ serviceId, userId, careReceiverId }: CommonDiaryProps) {
  const receiverName = careReceiverId ? lifeCareReceivers.find(r => r.id === careReceiverId)?.label : undefined;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{receiverName ? `日誌（${receiverName}）` : "Diary"}</h1>
  <VitalsForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
  <SeizureForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
  <ExpressionForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
  <HydrationForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
  <ExcretionForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
  <ActivityForm selectedUser={userId ?? ""} onSubmit={() => {}} onCancel={() => {}} />
      {/* TODO: add more categories as needed */}
      <div className="text-sm text-muted-foreground">
        <span>Service: {serviceId ?? "(any)"}</span> · <span>User: {userId ?? "(any)"}</span>
      </div>
    </div>
  );
}
