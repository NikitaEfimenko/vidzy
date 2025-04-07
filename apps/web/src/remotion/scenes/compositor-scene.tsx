'use client'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  CalculateMetadataFunction,
  Video,
  delayRender,
  continueRender
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { BaseSceneSchema, getFormatByEnum } from "../helpers";
import { OffthreadVideo } from "remotion";
import { useEffect, useRef, useState } from "react";
import { PaginatedSubtitles } from "../components/subtitles";

export const CompositorSchema = BaseSceneSchema.extend({
  audioFileName: z.string().url().describe("url").optional(),
  subtitlesUrl: z.string().url().describe("url").optional(),
  audioVolume: z.number().min(0).max(100),
  videos: z.array(z.object({
    src: z.string().url().describe("url"),
    durationInSeconds: z.number().min(0),
    transitionDurationInSeconds: z.number().min(0).default(0)
  })),

  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
});

export type CompositorSchemaType = z.infer<typeof CompositorSchema>;
export const CompositorScene = ({
  audioFileName,
  audioVolume = 50,
  videos,

  subtitlesUrl,
  subtitlesTextColor,
  subtitlesLinePerPage,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}: CompositorSchemaType) => {
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  const [handle] = useState(() => delayRender());
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    subtitlesUrl && fetch(subtitlesUrl, {
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
  }, [handle, subtitlesUrl]);

  let currentFrame = 0;
  const sequences = videos.map((video, index) => {
    const from = currentFrame;
    const durationInFrames = Math.floor(Number(video.durationInSeconds) * fps);
    const transitionDurationInFrames = Math.floor(Number(video.transitionDurationInSeconds ?? 0) * fps);

    currentFrame += durationInFrames - transitionDurationInFrames;

    return {
      ...video,
      from,
      durationInFrames,
      transitionDurationInFrames,
      isLast: index === videos.length - 1,
    };
  });

  return (
    <div ref={ref}>


      <AbsoluteFill>
        {audioFileName && (
          <Audio
            src={audioFileName}
            volume={Math.max(0, Math.min(1, audioVolume / 100))}
          />
        )}

        {sequences.map((seq, i) => {
          const sequenceFrame = frame - seq.from;
          const isActive = sequenceFrame >= 0 && sequenceFrame <= seq.durationInFrames + (seq.isLast ? 0 : seq.transitionDurationInFrames);

          if (!isActive) return null;

          const progress = sequenceFrame / seq.durationInFrames;
          const transitionProgress = seq.isLast ? 0 :
            Math.max(
              0,
              (progress - (1 - seq.transitionDurationInFrames / seq.durationInFrames)) *
              (seq.durationInFrames / seq.transitionDurationInFrames)
            );

          const fromOpacity = seq.isLast ? 1 : 1 - transitionProgress; // для первого видео
          const toOpacity = transitionProgress; // для второго (в фоне muted)
          const scale = 1 + 0.1 * transitionProgress;

          const currentVolume = seq.isLast
            ? 1
            : Math.max(0, 1 - transitionProgress);

          const nextVolume = Math.max(0, transitionProgress);

          return (
            <Sequence
              key={i}
              from={seq.from}
              durationInFrames={seq.durationInFrames + (seq.isLast ? 0 : seq.transitionDurationInFrames)}
            >
              <AbsoluteFill>
                {/* ▶️ Основное видео (первое в паре) */}
                <OffthreadVideo
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    mixBlendMode: 'screen',
                    opacity: fromOpacity, // ← затухание
                  }}
                  volume={currentVolume}
                  src={seq.src}
                />
              </AbsoluteFill>

              {/* 🫥 Во время перехода: второе видео, но без звука */}
              {!seq.isLast && (
                <AbsoluteFill
                  style={{
                    opacity: toOpacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <OffthreadVideo
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      mixBlendMode: 'screen',
                    }}
                    src={sequences[i + 1].src}
                    muted // важно!
                    startFrom={0}
                  />
                </AbsoluteFill>
              )}
            </Sequence>
          );
        })}

      </AbsoluteFill>
      <AbsoluteFill>
        <Sequence>
          <div
            className="container relative flex flex-col justify-between"
          >
            <div
              style={{ lineHeight: `${subtitlesLineHeight}px` }}
              className="captions flex-1 text-center flex items-center justify-center"
            >
              {subtitles && <PaginatedSubtitles
                subtitles={subtitles}
                startFrame={0}
                endFrame={durationInFrames}
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


export const compositionName = "CompositorScene" as const;

export const initInputProps = {
  audioFileName: undefined,
  audioVolume: 50,
  videos: [
    {
      src: "https://storage.procat-saas.online/vidzy/1743640720016-renderer_storyscene_dd1eee6b-e52d-4745-9f26-a90d29a20e0a.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250403%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250403T003842Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=89cf0d3ab4037236d0417ddb1b47a9dbda26f6d7c7abe9b6baded2f311088123",
      durationInSeconds: 8,
      transitionDurationInSeconds: 1,
    },
    {
      src: "https://storage.procat-saas.online/vidzy/1743732355972-renderer_storyscene_b67291df-a8dd-41d8-bcf4-b2e811b13d44.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=dHv3V0J5Z9Y47lQPqfpZ%2F20250404%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250404T020559Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=d270b1c9fa439854362ae0957305d985340334a8d1481bbb8c5f8f52f23ddca9",
      durationInSeconds: 10,
      transitionDurationInSeconds: 0,
    }
  ],
  format: "16:9",

  onlyDisplayCurrentSentence: true,
  subtitlesTextColor: "rgba(255, 255, 255, 1)",
  subtitlesLinePerPage: 1,
  subtitlesZoomMeasurerSize: 1,
  subtitlesLineHeight: 120,
} satisfies z.infer<typeof CompositorSchema>;


export const FPS = 30

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof CompositorSchema>> = async ({ props }) => {
  const formatValues = getFormatByEnum(props.format)
  let durationInSeconds = 10

  try {
    if (props.videos.length > 0) {
      durationInSeconds = props.videos.reduce((sum, video, index) => {
        const transition = index === props.videos.length - 1 ? 0 : (Number(video.transitionDurationInSeconds ?? 0) || 0);
        return sum + Number(video.durationInSeconds) - transition;
      }, 0);
    }
  }
  catch {
    durationInSeconds = 10
  }
  return {
    durationInFrames: Math.floor(durationInSeconds * FPS),
    props: {
      ...props,
    },
    abortSignal: new AbortController().signal,
    defaultProps: { ...initInputProps, ...props },
    fps: FPS,
    ...formatValues
  };
};

export const config = {
  durationInFrames: 30 * 10,
  fps: FPS,
  width: 1280,
  height: 720,
  calculateMetadata
};