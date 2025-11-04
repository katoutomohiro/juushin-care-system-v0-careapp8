import { z } from "zod";

export const medicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  dosage: z.string(),
  time: z.string(), // "HH:mm"
  taken: z.boolean(),
  date: z.string(), // "YYYY-MM-DD"
});

export type Medication = z.infer<typeof medicationSchema>;
