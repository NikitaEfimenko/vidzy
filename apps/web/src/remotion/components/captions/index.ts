import { SubtitleType, type SubtitleStyleComponent } from "./types"
import { DefaultCaption } from "./default"
import { LightningCaption } from "./lightning"
import { GlitchCaption } from "./glitch"
import { TypewriterCaption } from "./typewriter"

export * from "./types"
export * from "./default"
export * from "./lightning"
export * from "./glitch"

export const subtitleStyleMap: Record<SubtitleType, SubtitleStyleComponent> = {
  [SubtitleType.DEFAULT]: DefaultCaption,
  [SubtitleType.TYPEWRITER]: TypewriterCaption,
  [SubtitleType.LIGHTNING]: LightningCaption,
  [SubtitleType.GLITCH]: GlitchCaption,
}

// Helper function to get the subtitle component based on type
export const getSubtitleComponent = (type: SubtitleType): SubtitleStyleComponent => {
  return subtitleStyleMap[type] || DefaultCaption
}
