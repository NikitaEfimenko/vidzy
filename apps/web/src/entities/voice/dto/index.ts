import { z } from "zod";

export const TTSDtoSchema = z.object({
  text: z.string(),
  voicePreset: z.string().optional()
})

const FileSchema = z.any().describe("File")

export const TranscribeDtoSchema = z.object({
  file: FileSchema.optional()
})

export const InstrumentalSeparatorDtoSchema = z.object({
  file: FileSchema.optional()
})

export type TTSDtoType = z.output<typeof TTSDtoSchema>
export type TranscribeDtoType = z.output<typeof TranscribeDtoSchema>
export type InstrumentalSeparatorDtoType = z.output<typeof InstrumentalSeparatorDtoSchema>


