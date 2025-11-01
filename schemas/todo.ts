import { z } from "zod";

export const TodoPriorityEnum = z.enum(["high", "medium", "low"]).default("medium");

export const TodoItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(), // YYYY-MM-DD
  priority: TodoPriorityEnum,
  assignee: z.string().optional(),
  notes: z.string().max(1000).optional(),
  serviceId: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TodoItem = z.infer<typeof TodoItemSchema>;
export type TodoPriority = z.infer<typeof TodoPriorityEnum>;
