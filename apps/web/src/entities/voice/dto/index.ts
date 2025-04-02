import { z } from "zod";

export const TTSDtoSchema = z.object({
  text: z.string().max(200, "Vidzy Alpha testing up to 200 characters for speech generation - you can upload your track as attachments"),
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


