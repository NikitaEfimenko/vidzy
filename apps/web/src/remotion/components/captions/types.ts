import { Caption } from "@remotion/captions"
import type React from "react"

export interface SubtitleStyleProps {
  item: Caption
  frame: number
  transcriptionColor?: string
}

export enum SubtitleType {
  DEFAULT = "default",
  LIGHTNING = "lightning",
  TYPEWRITER = "typwriter",
  GLITCH = "glitch",
}

export type SubtitleStyleComponent = React.FC<SubtitleStyleProps>
