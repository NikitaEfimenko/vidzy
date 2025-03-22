'use client'

import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Sequence,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { z } from "zod";

import { TextFade } from "../components/text-fade";
import Cubes from "../components/cubes";

loadFont();

export const CubesSceneSchema = z.object({
  count: z.string()
})

export type CubesSceneSchemaProps = z.infer<typeof CubesSceneSchema>

export const CubesComposition = (props: CubesSceneSchemaProps) => {
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
            by Vidzy
          </div>
        </TextFade>
      </Sequence>
    </AbsoluteFill>
  );
};


export const compositionName = "PhysicsPreviewScene"  as const
export const FPS = 30

export const initInputProps = {
  count: '10'
} satisfies CubesSceneSchemaProps

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof CubesSceneSchema>> = async ({ props }) => {
  return {
    durationInFrames: 30 * 5,
    props: {
      ...props,
    },
    abortSignal: new AbortController().signal,
    defaultProps: initInputProps,
    fps: FPS,
  };
}

export const config = {
  durationInFrames: 30 * 5,
  fps: FPS,
  height: 480,
  width: 640,
  calculateMetadata
}

