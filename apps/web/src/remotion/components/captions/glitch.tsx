import { useCurrentFrame, useVideoConfig, interpolate } from "remotion"
import type React from "react"
import type { SubtitleStyleProps } from "./types"
import { msToFrame } from "../utils"

export const GlitchCaption: React.FC<SubtitleStyleProps> = ({
  item,
  transcriptionColor,
  // frame
}) => {
  const globalFrame = useCurrentFrame()

  const frame = globalFrame - msToFrame(item.startMs)

  const opacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" })

  const glitchX = interpolate(frame, [0, 2, 4, 6, 8], [0, 10, -10, 5, 0], { extrapolateRight: "clamp" })

  const glitchY = interpolate(frame, [0, 3, 5, 7, 9], [0, 5, -5, 3, 0], { extrapolateRight: "clamp" })

  const styleCombined = {
    fontFamily: "VT323, monospace",
    fontSize: 52,
    fontWeight: "bold",
    display: "inline-block",
    padding: '0.25em',
    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
    transform: `translateX(${glitchX}px) translateY(${glitchY}px)`,
    opacity,
    color: transcriptionColor ?? "white",
  }

  return <span style={styleCombined}>{item.text}</span>
}
