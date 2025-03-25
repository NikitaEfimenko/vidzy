import { z } from "zod";

export const UpdateWorkflowDtoSchema = z.object({
  flowData: z.any()
})
export type UpdateWorkflowDtoType = z.output<typeof UpdateWorkflowDtoSchema>