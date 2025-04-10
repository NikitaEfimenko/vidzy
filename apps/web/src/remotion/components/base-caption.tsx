

import type React from "react"
import { useCurrentFrame } from "remotion"
import { SubtitleType, getSubtitleComponent } from "./captions"
import { Caption } from '@remotion/captions';

interface WordProps {
  frame: number
  item: Caption
  transcriptionColor?: string
  subtitleType?: SubtitleType
}

export const CaptionView: React.FC<WordProps> = ({
  item,
  transcriptionColor = "rgba(255, 255, 255, 1)",
  subtitleType = SubtitleType.DEFAULT
}) => {
  const currentFrame = useCurrentFrame()

  // Get the appropriate subtitle component based on the type
  const SubtitleComponent = getSubtitleComponent(subtitleType)

  return <SubtitleComponent
      frame={currentFrame}
      transcriptionColor={transcriptionColor}
      item={item}
    />
}