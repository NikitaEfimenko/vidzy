'use client'

import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { z } from "zod";

import { CatIcon } from "lucide-react";
import { TextFade } from "../components/text-fade";
import Cubes from "../components/cubes";

loadFont();

export const SimplePreviewSchema = z.object({
  count: z.string()
})

export type SimplePreviewProps = z.infer<typeof SimplePreviewSchema>

export const SimplePreview = (props: SimplePreviewProps) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  return (
    <AbsoluteFill className="bg-background" style={{colorScheme: "dark"}}>
      <Sequence from={0} durationInFrames={durationInFrames - 2 * fps}>
        <Cubes count={Number(props.count)}/>
      </Sequence>
      <Sequence from={durationInFrames - 2.5 * fps}>
        <TextFade>
          <div className="text-3xl font-bold flex items-center gap-2">
            by Procat
            <CatIcon/>
          </div>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  );
};


export const compositionName = "SimplePreviewProps"

export const config = {
  durationInFrames: 35 * 8,
  fps: 35,
  height: 480,
  width: 640
}

