// services/a4-mapping.ts
import {
  A4Record, A4Transport, TransportEvent, VitalEntry,
  IntakeEntry, ExcretionEntry, MedCareEntry, ActivityEntry,
  Observation, RomEntry, Incident
} from "@/types/journal";

const byTs = <T extends { ts: string }>(a: T, b: T) =>
  new Date(a.ts).getTime() - new Date(b.ts).getTime();

export function mapTransport(events: TransportEvent[]): A4Transport {
  const e = [...events].sort(byTs);
  const a4: A4Transport = {};
  for (const ev of e) {
    if (ev.route.endsWith("->CENTER")) {
      if (!a4.pickup) a4.pickup = ev.ts;
      else if (!a4.centerArrive) a4.centerArrive = ev.ts;
    } else if (ev.route.startsWith("CENTER->")) {
      if (!a4.centerLeave) a4.centerLeave = ev.ts;
      else if (!a4.dropArrive) a4.dropArrive = ev.ts;
    }
  }
  return a4;
}

export function mapVitals(dayValues: VitalEntry[]): { morning?: VitalEntry; noon?: VitalEntry; evening?: VitalEntry } {
  const sorted = [...dayValues].sort(byTs);
  return {
    morning:  sorted[0],
    noon:     sorted[1],
    evening:  sorted[2],
  };
}

export function composeA4Record(params: {
  userId: string; date: string;
  transport: TransportEvent[];
  vitals: VitalEntry[];
  intake: IntakeEntry[];
  excretion: ExcretionEntry[];
  medCare: MedCareEntry[];
  activities: ActivityEntry[];
  observation?: Observation;
  rom: RomEntry[];
  incidents: Incident[];
  notes?: { special?: string; family?: string };
  serviceType?: string;
  staffIds?: string[];
}): A4Record {
  return {
    header: { userId: params.userId, date: params.date, serviceType: params.serviceType, staffIds: params.staffIds },
    transport: mapTransport(params.transport),
    vitals: mapVitals(params.vitals),
    intake: [...params.intake].sort(byTs),
    excretion: [...params.excretion].sort(byTs),
    medCare: [...params.medCare].sort(byTs),
    activities: [...params.activities].sort(byTs),
    observation: params.observation,
    rom: [...params.rom].sort(byTs),
    incidents: [...params.incidents].sort(byTs),
    notes: params.notes,
  };
}
