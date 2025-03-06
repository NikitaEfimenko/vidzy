"use client";

import { Player } from "@remotion/player";
import React, { ReactNode, useDeferredValue, useEffect, useState } from "react";
import { z } from 'zod';

export type RenderDTO<T extends z.ZodType<any, any, any>> = {
  Composition: (props: z.infer<T>) => React.JSX.Element,
  inputPropsSchema: T,
  inputProps: z.infer<T>,
  fps: number,
  compositionHeight: number
  compositionWidth: number
  durationInFrames: number
}

export const VideoPlayground = <T extends z.ZodType<any, any, any>,>({
  Composition,
  inputPropsSchema,
  inputProps,
  children,
  fps,
  compositionHeight,
  compositionWidth,
  durationInFrames
}: RenderDTO<T> & { children?: ReactNode }) => {

  const [innerInputProps, setInputProps] = useState<z.infer<T>>(() => {
    const parsed = inputPropsSchema.safeParse(inputProps)
    return parsed.success ? parsed.data : {}
  });
  const deferededInput = useDeferredValue(innerInputProps)

  useEffect(() => {
    setInputProps(inputProps)
  }, [inputProps])

  return (
    <div className="max-w-screen-xs m-auto mb-2">
      <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
        <Player
          component={Composition}
          inputProps={deferededInput}
          fps={fps}
          compositionHeight={compositionHeight}
          compositionWidth={compositionWidth}
          durationInFrames={durationInFrames}
          style={{
            width: "100%",
          }}
          controls
          autoPlay
          loop
        />
      </div>
      {children}
    </div>
  );
};