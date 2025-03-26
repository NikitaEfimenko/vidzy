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

export const StorySchema = z.object({
  audioOffsetInSeconds: z.number().min(0),
  subtitlesFileName: z.string(),
  audioFileName: z.string(),
  coverImgFileName: z.array(z
    .string()),
  titleText: z.string(),
  titleColor: zColor(),
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
  titleText,
  titleColor,
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
  audioWizEnabled
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
  subtitlesFileName: "https://storage.procat-saas.online/vidzy/1741823137631-srt-1741823137630.srt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T234538Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=6769acee5841ccfd01a0c8f8bac54b2c2af6d8c7c11187f705e9d727db009ee5",
  audioFileName: "https://storage.procat-saas.online/vidzy/1741823026614-voice-1741823026613.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T234348Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=e9b5c8250c7726ac9d43f2a0e9059c9df178cecc5b95e7444dff1ac2c75e5ac3",
  coverImgFileName: [
    "https://storage.procat-saas.online/vidzy/1741822471582-3c359253ff9a11ef8d789e380d4be75f.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T233432Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=2f14895d1f206acdb847855506d819818f566e37e66bfc0bb1e0d5b06b3f8a41",
    "https://storage.procat-saas.online/vidzy/1741822462161-1acef1e3ff9a11ef9fb866b929a52cde.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T233423Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=720cc11ce051c4908f8d4c8a7ebc76498c7d4e45c69140fd6838a6c922f5d281",
    "https://storage.procat-saas.online/vidzy/1741822501737-fc2ad60eff9911ef928c82872adeaf38.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T233502Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=637e8ee7dc5a03344900a17df589739941ba26f8a537b0e4ea55e8620ccb126e",
    "https://storage.procat-saas.online/vidzy/1741822479902-ad15a3f3ff9911efb48eb633c76826bc.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250312%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250312T233441Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=9523153bb1fcbe1c35155b7567ef4c662744b08f61f732255c2aaa29ff5f9546"
  ],
  titleText: "test",
  titleColor: "rgba(0, 0, 200, 0.93)",

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
} satisfies z.infer<typeof StorySchema>

export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof StorySchema>> = async ({ props }) => {
  let durationInSeconds = 10
  try {
    durationInSeconds = await getAudioDurationInSeconds(
      props.audioFileName,
    )
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
    defaultProps: initInputProps,
    fps: FPS,
  };
}

export const config = {
  durationInFrames: 30 * 10,
  fps: FPS,
  calculateMetadata,
  height: 480,
  width: 640
}