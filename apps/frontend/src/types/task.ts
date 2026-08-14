import z from "zod";

export const Task = z.object({
  id: z.uuid(),
  name: z.string(),
  created_at: z.coerce.date(),
});
