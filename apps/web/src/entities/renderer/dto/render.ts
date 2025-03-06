import { z } from "zod";

export const RenderVideoDtoSchema = z.object({
  compositionId: z.string(),
  inputProps: z.string()
})

export type RenderVideoDtoType = z.output<typeof RenderVideoDtoSchema>