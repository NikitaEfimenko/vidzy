'use client'
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { useEffect, useRef, useState } from "react";

import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  continueRender,
  delayRender,
  Sequence,
  useVideoConfig
} from "remotion";


import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { AudioViz } from "../components/audio-viz";
import { Slide } from "../components/slide";
import { PaginatedSubtitles } from "../components/subtitles";
import { BaseSceneSchema, getFormatByEnum } from "../helpers";

export const StorySchema = BaseSceneSchema.extend({
  audioOffsetInSeconds: z.number().min(0),
  subtitlesFileName: z.string().url().describe("url").optional(),
  audioFileName: z.string().url().describe("url").optional(),
  coverImgFileName: z.array(z
    .string().url().describe("url")),
  waveColor: zColor(),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
  audioWizEnabled: z.boolean(),
  mirrorWave: z.boolean(),
  waveLinesToDisplay: z.number().int().min(0),
  waveFreqRangeStartIndex: z.number().int().min(0),
  waveNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});


export type StorySchemaType = z.infer<typeof StorySchema>;

export const StoryComposition = ({
  subtitlesFileName,
  audioFileName,
  coverImgFileName,
  subtitlesTextColor,
  subtitlesLinePerPage,
  waveColor,
  waveNumberOfSamples,
  waveFreqRangeStartIndex,
  waveLinesToDisplay,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
  mirrorWave,
  audioOffsetInSeconds,
  audioWizEnabled,
  format
}: StorySchemaType) => {
  const { durationInFrames, fps } = useVideoConfig();

  const [handle] = useState(() => delayRender());
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    subtitlesFileName && fetch(subtitlesFileName, {
    })
      .then((res) => {
        return res.text()
      })
      .then((text) => {
        setSubtitles(text);
        continueRender(handle);
      })
      .catch((err) => {
        console.log("Error fetching subtitles", err);
      });
  }, [handle, subtitlesFileName]);

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);

  const overlapFrames = 15; // Перекрытие в 10 кадров
  const slideDuration = durationInFrames / coverImgFileName.length - overlapFrames
  return (
    <div ref={ref}>
      <AbsoluteFill>
        {coverImgFileName.map((img, index) => {

          const startFrame = index * (slideDuration + overlapFrames); // Учитываем перекрытие
          const endFrame = startFrame + slideDuration + overlapFrames; // Учитываем перекрытие

          return (
            <Sequence
              key={img}
              from={startFrame - audioOffsetInFrames}
              durationInFrames={slideDuration + 1.5 * overlapFrames} // Увеличиваем длительность Sequence
            >
              <Slide
                img={img}
                startFrame={startFrame}
                endFrame={endFrame}
                fps={fps}
                overlapFrames={overlapFrames} // Передаем перекрытие в Slide
              />
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill>
        <Sequence from={-audioOffsetInFrames}>
          {audioFileName && <Audio pauseWhenBuffering src={audioFileName} />}
          <div
            className="container relative flex flex-col justify-between"
          >
            {/* {coverImgFileName && <Img className="cover absolute opacity-95 -z-10"  src={coverImgFileName} />} */}
            {audioWizEnabled && audioFileName && <div className="flex-1">
              <AudioViz
                audioSrc={audioFileName}
                mirrorWave={mirrorWave}
                waveColor={waveColor}
                numberOfSamples={Number(waveNumberOfSamples)}
                freqRangeStartIndex={waveFreqRangeStartIndex}
                waveLinesToDisplay={waveLinesToDisplay}
              />
            </div>}
            <div
              style={{ lineHeight: `${subtitlesLineHeight}px` }}
              className="captions flex-1 text-center flex items-center justify-center"
            >
              {subtitles && <PaginatedSubtitles
                subtitles={subtitles}
                startFrame={audioOffsetInFrames}
                endFrame={audioOffsetInFrames + durationInFrames}
                linesPerPage={subtitlesLinePerPage}
                subtitlesTextColor={subtitlesTextColor}
                subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                subtitlesLineHeight={subtitlesLineHeight}
                onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
              />}
            </div>
          </div>
        </Sequence>

      </AbsoluteFill>
    </div>
  );
};

export const compositionName = "StoryScene" as const

export const initInputProps = {
  // Audio settings
  audioOffsetInSeconds: 0,

  // Title settings
  subtitlesFileName: "https://storage.procat-saas.online/vidzy/1743102783091-srt-1743102783090.srt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250327%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250327T191303Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d3308787f12dab6d14ebf1f4cc14964656152d0a4329e5348660e4cfe8bc769f",
  audioFileName: "https://storage.procat-saas.online/vidzy/1743103602387-agile.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250327%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250327T192643Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=03d8114318f1bbcf78b98e3d92c058be2557fcc5be47df6a6753c77dd45e1525",
  coverImgFileName: [
    // "https://storage.procat-saas.online/vidzy/1743111899660-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250327%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250327T214500Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=1a7363de17f182fd4f07d9d43722ece11cbb9d311ef797cd736e00b845b01119",
    // "https://storage.procat-saas.online/vidzy/1743111987160-image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250327%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250327T214628Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=532db9756801775626e6c6b8b87fd1e64acaa0d25729b66f47388bb8c90860b1"
  ],

  // Subtitles settings
  // subtitlesFileName: 'https://storage.procat-saas.online/vidzy/1741730616072-srt-1741730616072.srt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250311T220336Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=535946c31b7b9b45327cdb1d05ae80da9fa2b84bff2c982b52360c89ed62179f',
  // subtitlesFileName: 'https://storage.procat-saas.online/vidzy/1741732187344-srt-1741732187344.srt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250311T222948Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=666caa7759f13893f121a66d7c5351c22731b11fd4c898604574d9d3c5f1378f',
  // subtitlesFileName: 'https://storage.procat-saas.online/vidzy/1741734072854-srt-1741734072854.srt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250311%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250311T230114Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=8d531f9183b8f326209fef0da24b0effa3846eedb94e6ca922c54670abe409e8',
  onlyDisplayCurrentSentence: true,
  subtitlesTextColor: "rgba(255, 255, 255, 1)",
  subtitlesLinePerPage: 1,
  subtitlesZoomMeasurerSize: 1,
  subtitlesLineHeight: 120,

  audioWizEnabled: false,
  // Wave settings
  waveColor: "rgba(255, 255, 255, 1)",
  waveFreqRangeStartIndex: 7,
  waveLinesToDisplay: 29,
  waveNumberOfSamples: "256" as const,
  mirrorWave: true,
  format: "1:1" as const,
} satisfies z.infer<typeof StorySchema>

export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof StorySchema>> = async ({ props }) => {
  const formatValues = getFormatByEnum(props.format)
  let durationInSeconds = 10
  try {
    if (props.audioFileName) {
      durationInSeconds = await getAudioDurationInSeconds(
        props.audioFileName,
      )
    }
  }
  catch {
    durationInSeconds = 10
  }
  return {
    durationInFrames: Math.floor(
      (durationInSeconds - props.audioOffsetInSeconds) * FPS,
    ),
    props: {
      ...props,
    },
    abortSignal: new AbortController().signal,
    defaultProps: {...initInputProps, ...props},
    fps: FPS,
    ...formatValues
  };
}

export const config = {
  durationInFrames: 30 * 10,
  fps: FPS,
  // width: 720,
  // height: 1280,
  width: 1280,
  height: 720,
  calculateMetadata,
}