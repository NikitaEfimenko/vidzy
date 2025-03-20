import { z } from "zod";
import { fileTypeEnum } from "@vidzy/database";

export const CreateAttachmentDto = z.object({
  userId: z.string().uuid().optional(),
  fileType: z.enum(fileTypeEnum.enumValues),
  file: z.instanceof(Blob),
  isPublic: z.boolean().optional()
})

export type CreateAttachmentDtoType = z.output<typeof CreateAttachmentDto>