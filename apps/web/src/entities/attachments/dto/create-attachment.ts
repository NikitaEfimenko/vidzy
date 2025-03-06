import { z } from "zod";

export const CreateAttachmentDto = z.object({
  userId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  fileType: z.enum(["image", "video"]),
  file: z.instanceof(Blob),
  isPublic: z.boolean().optional()
})

export type CreateAttachmentDtoType = z.output<typeof CreateAttachmentDto>