import { workflowAccess, workflowInviteLinks, renderWorkflows } from "@vidzy/database"
import { InferInsertModel } from "drizzle-orm"

export type WorkflowModelType = InferInsertModel<typeof renderWorkflows>
export type WorkflowInviteLinksModelType = InferInsertModel<typeof workflowInviteLinks>
export type WorkflowAccessModelType = InferInsertModel<typeof workflowAccess>
