import { cn } from "@/shared/lib/utils"
import {
  Activity,
  AudioLinesIcon,
  BookMarkedIcon,
  FileIcon,
  FileJson2Icon,
  ImageIcon,
  MapIcon,
  SubtitlesIcon,
  VideoIcon,
  Workflow
} from "lucide-react"
import type { ComponentPropsWithRef } from "react"
import { useMemo } from "react"
import { CustomNodeType } from "../../types"
import { FaRobot } from "react-icons/fa"

export const NodeIcon = ({
  nodeType,
  className,
  ...rest
}: { nodeType: CustomNodeType } & ComponentPropsWithRef<typeof Activity>) => {
  const Icon = useMemo(() => {
    switch (nodeType) {
      case "annotation": return BookMarkedIcon
      case "audio-injector": return AudioLinesIcon
      case "file-injector": return FileIcon
      case "image-injector": return ImageIcon
      case "json-injector": return FileJson2Icon
      case "json-mapper": return MapIcon
      case "previewer": return VideoIcon
      case "transcribe-injector": return SubtitlesIcon
      case "ai-helper": return FaRobot
      default: return Workflow
    }
  }, [nodeType])
  return <Icon {...rest} className={cn( "w-12 h-12", className)} />

}