import { attachments } from "@vidzy/database"
import { InferInsertModel } from "drizzle-orm"

export type AttachmentsModelType = InferInsertModel<typeof attachments>
