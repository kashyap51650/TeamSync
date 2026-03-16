import { z } from "zod";

export const editProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  color: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type EditProjectForm = z.infer<typeof editProjectSchema>;
