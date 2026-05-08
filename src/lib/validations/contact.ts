import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1).max(300),
  email: z.email(),
  message: z.string().min(1).max(12000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
