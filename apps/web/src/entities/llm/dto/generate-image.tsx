import { z } from "zod";

export const GenerateImageDtoSchema = z.object({
  prompt: z.string(),
  provider: z.enum(['ollama', 'yandex'])
})

export type GenerateImageDtoSchemaType = z.output<typeof GenerateImageDtoSchema>



