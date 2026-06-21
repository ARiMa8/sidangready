import { z } from "zod";

export const projectDraftSchema = z.object({
  projectName: z.string().min(3),
  thesisTitle: z.string().min(5),
  studentName: z.string().min(2),
  major: z.string().min(2),
  university: z.string().min(2),
  targetPresentationMinutes: z.number().min(5).max(15),
});

export type ProjectDraftInput = z.infer<typeof projectDraftSchema>;
