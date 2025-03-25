import { z } from "zod";

export const CreateWorkflowInviteDtoSchema = z.object({
  maxUses: z.number().optional(),
})

export type CreateWorkflowInviteDtoType = z.output<typeof CreateWorkflowInviteDtoSchema>