import { useCurrentFrame, useVideoConfig, interpolate } from "remotion"
import type React from "react"
import type { SubtitleStyleProps } from "./types"
import { msToFrame } from "../utils"

export const LightningCaption: React.FC<SubtitleStyleProps> = ({
  item,
  transcriptionColor,
  frame
}) => {
  const durationInFrames = msToFrame(item.endMs) - msToFrame(item.startMs)
  const localFrame = frame - msToFrame(item.startMs) 
  const verticalShake = interpolate(
    localFrame,
    [0, durationInFrames * 0.1, durationInFrames * 0.2, durationInFrames * 0.3, durationInFrames],
    [0, 5, -5, 5, 0],
    { extrapolateRight: "clamp" },
  )

  const horizontalShake = interpolate(
    localFrame,
    [0, durationInFrames * 0.1, durationInFrames * 0.2, durationInFrames * 0.3, durationInFrames],
    [0, 5, -5, 5, 0],
    { extrapolateRight: "clamp" },
  )

  const opacity = interpolate(localFrame, [0, 5], [0, 1], { extrapolateRight: "clamp" })

  const textShadowColor = `rgba(255, 255, 255, ${interpolate(
    localFrame,
    [0, durationInFrames * 0.2, durationInFrames * 0.6, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" },
  )})`

  const style = {
    fontFamily: "Bungee, cursive",
    display: "inline-block",
    fontSize: 52,
    fontWeight: "bold",
    padding: '0.5em',
    textShadow: `0 0 30px ${textShadowColor}, 0 0 50px ${textShadowColor}`,
    opacity,
    textStroke: `2px black`,
    WebkitTextStroke: `2px black`, // 
    color: transcriptionColor ?? "white",
    transform: `translateY(${verticalShake}px) translateX(${horizontalShake}px)`,
  }

  return <span style={style}>{item.text}</span>
}
