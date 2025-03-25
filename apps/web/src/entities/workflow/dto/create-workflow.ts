import { z } from "zod";

export const CreateWorkflowDtoSchema = z.object({
  title: z.string(),
  copyFromFlowId: z.string().nullable().optional()
})

export type CreateWorkflowDtoType = z.output<typeof CreateWorkflowDtoSchema>