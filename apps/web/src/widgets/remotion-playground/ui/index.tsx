"use client";

import { Player } from "@remotion/player";
import React, { ReactNode, useDeferredValue, useEffect, useState } from "react";
import { z } from 'zod';
import { CalculateMetadataFunction } from "remotion";

export type RenderDTO<T extends z.ZodType<any, any, any>> = {
  Composition: (props: z.infer<T>) => React.JSX.Element,
  inputPropsSchema: T,
  inputProps: z.infer<T>,
  fps: number,
  compositionHeight: number
  compositionWidth: number
  compositionId: string,
  calculateMetadata: CalculateMetadataFunction<z.infer<T>>
}

export const VideoPlayground = <T extends z.ZodType<any, any, any>,>({
  Composition,
  inputPropsSchema,
  inputProps,
  children,
  fps,
  compositionHeight,
  compositionWidth,
  compositionId,
  calculateMetadata
}: RenderDTO<T> & { children?: ReactNode }) => {
  const [metadata, setMetadata] = useState<ReturnType<typeof calculateMetadata> | null>(null);

  const [innerInputProps, setInputProps] = useState<z.infer<T>>(() => {
    const parsed = inputPropsSchema.safeParse(inputProps)
    return parsed.success ? parsed.data : {}
  });
  const deferededInput = useDeferredValue(innerInputProps)

  useEffect(() => {
    setInputProps(inputProps)
  }, [inputProps])

  useEffect(() => {
    Promise.resolve(
      calculateMetadata({
        defaultProps: inputProps,
        props: inputProps,
        abortSignal: new AbortController().signal,
        compositionId: compositionId,
      })).then(({ durationInFrames, fps }) => {
        setMetadata({
          durationInFrames: durationInFrames as number,
          fps: fps as number,
        });
      })
      .catch((err) => {
        console.log(`Error fetching metadata: ${err}`);
      });
  }, [inputProps])

  return (
    <div className="max-w-screen-xs m-auto mb-2">
      <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
        <Player
          acknowledgeRemotionLicense
          component={Composition}
          inputProps={deferededInput}
          fps={fps}
          compositionHeight={compositionHeight}
          compositionWidth={compositionWidth}
          durationInFrames={(metadata as any)?.durationInFrames ?? fps * 10}
          style={{
            width: "100%",
          }}
          controls
          loop
        />
      </div>
      {children}
    </div>
  );
};