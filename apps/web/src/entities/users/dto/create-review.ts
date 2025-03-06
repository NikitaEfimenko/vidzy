import { z } from "zod";

export const CreateSaaSReviewDtoSchema = z.object({
  rating: z.number(),
  reviewText: z.string(),
})

export type CreateSaaSReviewDtoType = z.output<typeof CreateSaaSReviewDtoSchema>