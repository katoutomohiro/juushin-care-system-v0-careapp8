// types/journal.ts
export type Route =
  | "HOME->CENTER" | "SCHOOL->CENTER" | "GH->CENTER"
  | "CENTER->HOME" | "CENTER->SCHOOL" | "CENTER->GH";

export interface TransportEvent { id: string; userId: string; route: Route; ts: string } // ISO
export interface VitalEntry { userId: string; ts: string; tempC?: number; pulse?: number; bpSys?: number; bpDia?: number; resp?: number; spo2?: number }
export interface IntakeEntry { userId: string; ts: string; type: "ORAL"|"TUBE"; menu?: string; volumeMl?: number; choke?: boolean }
export interface ExcretionEntry {
  userId: string; ts: string;
  urine?: "NONE"|"LOW"|"MID"|"HIGH";
  stool?: "NONE"|"SOFT"|"NORMAL"|"HARD"|"DIARRHEA"|"BLOODY";
  note?: string;
}
export interface MedCareEntry { userId: string; ts: string; kind: "SUCTION"|"OXYGEN"|"NEBULIZER"|"MEDICATION"|"SEIZURE"; detail?: string }
export interface ActivityEntry { userId: string; ts: string; period: "AM"|"PM"; program: string; participate?: "HIGH"|"MID"|"LOW"|"OBSERVE"; bathStart?: string; bathEnd?: string }
export interface Observation { userId: string; date: string; abdomen?: "NONE"|"MILD"|"HIGH"; skin?: "OK"|"RED"|"RASH"|"ULCER"; swallow?: "OK"|"COUGH"|"VOMIT"; seizureCount?: number; other?: string }
export interface RomEntry { userId: string; ts: string; parts: string[]; note?: string }
export interface Incident { userId: string; ts: string; type: "NEAR_MISS"|"ACCIDENT"|"RESTRAINT"; detail: string; action: string; prevent: string }
export interface Handover { userId: string; date: string; familyNote?: string; nextCare?: string }

export interface A4Transport { pickup?: string; centerArrive?: string; centerLeave?: string; dropArrive?: string }
export interface A4Vitals { morning?: VitalEntry; noon?: VitalEntry; evening?: VitalEntry }

export interface A4Record {
  header: { userId: string; date: string; serviceType?: string; staffIds?: string[] };
  transport: A4Transport;
  vitals: A4Vitals;
  intake: IntakeEntry[];
  excretion: ExcretionEntry[];
  medCare: MedCareEntry[];
  activities: ActivityEntry[];
  observation?: Observation;
  rom: RomEntry[];
  incidents: Incident[];
  notes?: { special?: string; family?: string };
}
