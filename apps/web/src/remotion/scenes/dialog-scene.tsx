'use client'
import { zColor } from "@remotion/zod-types";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  continueRender,
  delayRender,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { PaginatedSubtitles } from "../components/subtitles";
import { BaseSceneSchema, getFormatByEnum } from "../helpers";
import { Slide } from "../components/slide";

export const DialogSchema = BaseSceneSchema.extend({
  dialog: z.array(z.object({
    personName: z.string(),
    positionPrority: z.enum(["left", "right", "center", "top", "bottom"]),
    subtitleUrl: z.string().url().describe("url").optional(),
    soundUrl: z.string().url().describe("url").optional(),
    avatarUrl: z.string().url().describe("url").optional(),
    durationInSeconds: z.number().min(0),
  })),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
});

export type DialogSchemaType = z.infer<typeof DialogSchema>;

const DialogMessage = ({
  personName,
  positionPrority = "center",
  subtitleUrl,
  soundUrl,
  avatarUrl,
  startFrame,
  endFrame,
  fps,
  overlapFrames,
  subtitlesTextColor,
  subtitlesLinePerPage,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}: {
  personName: string;
  positionPrority?: "left" | "right" | "center" | "top" | "bottom";
  subtitleUrl?: string;
  soundUrl?: string;
  avatarUrl?: string;
  startFrame: number;
  endFrame: number;
  fps: number;
  overlapFrames: number;
  subtitlesTextColor: string;
  subtitlesLinePerPage: number;
  subtitlesZoomMeasurerSize: number;
  subtitlesLineHeight: number;
  onlyDisplayCurrentSentence: boolean;
}) => {
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    if (!subtitleUrl) {
      continueRender(handle);
      return;
    }

    fetch(subtitleUrl)
      .then((res) => res.text())
      .then((text) => {
        setSubtitles(text);
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Error fetching subtitles", err);
        continueRender(handle);
      });
  }, [handle, subtitleUrl]);

  const positionClasses = {
    left: "items-start justify-start ml-4",
    right: "items-end justify-end mr-4",
    center: "items-center justify-center",
    top: "items-start justify-center mt-4",
    bottom: "items-end justify-center mb-4"
  };


  return (<>
    <AbsoluteFill>
      {avatarUrl && (
        <Slide
          img={avatarUrl}
          startFrame={startFrame}
          endFrame={endFrame}
          fps={fps}
          overlapFrames={overlapFrames} // Передаем перекрытие в Slide
        />
      )}
    </AbsoluteFill>


    <AbsoluteFill>

      <div className={`absolute inset-0 bottom-0 flex min-w-96 transition-all ${positionClasses[positionPrority]} p-4`}>
        <div className="bg-black bg-opacity-70 rounded-lg p-4 max-w-2xl">
          {avatarUrl && (
            <div className="flex items-center mb-2">
              <Img
                src={avatarUrl}
                className="w-14 h-14 rounded-full mr-3"
              />
              <span className="text-white text-2xl font-bold">{personName}:</span>
            </div>
          )}
          <div className="bg-white h-[1px] w-full"></div>
          {subtitles && (
            <div className="text-white">
              <PaginatedSubtitles
                subtitles={subtitles}
                startFrame={startFrame}
                endFrame={endFrame}
                linesPerPage={subtitlesLinePerPage}
                subtitlesTextColor={subtitlesTextColor}
                subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                subtitlesLineHeight={subtitlesLineHeight}
                onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
              />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  </>
  );
};

export const DialogComposition = ({
  dialog = [],
  subtitlesTextColor,
  subtitlesLinePerPage,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}: DialogSchemaType) => {
  const { durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);

  const audioOffsetInFrames = 0;
  const overlapFrames = 0;

  // Calculate total duration based on individual message durations or default to equal distribution
  const totalDuration = dialog.reduce((sum, msg) => sum + (Number(msg.durationInSeconds) || 5), 0);
  const calculatedDurationInFrames = Math.floor(totalDuration * fps);

  const messageFrames = useMemo(() => {
    let currentFrame = 0;
    return dialog.map((msg) => {
      const duration = Number(msg.durationInSeconds) ? Math.floor(Number(msg.durationInSeconds) * fps) : Math.floor(5 * fps);
      const start = currentFrame;
      currentFrame += duration;
      return {
        ...msg,
        startFrame: start,
        endFrame: start + duration,
      };
    });
  }, [dialog, fps]);

  return (
    <div ref={ref}>
      <AbsoluteFill className="bg-gray-900">
        {messageFrames.map((message, index) => (
          <Sequence
            key={`${message.personName}-${index}`}
            from={message.startFrame - audioOffsetInFrames}
            durationInFrames={message.endFrame - message.startFrame}
          >
            {message.soundUrl && <Audio pauseWhenBuffering src={message.soundUrl} />}
            <DialogMessage
              personName={message.personName}
              positionPrority={message.positionPrority}
              subtitleUrl={message.subtitleUrl}
              soundUrl={message.soundUrl}
              avatarUrl={message.avatarUrl}
              startFrame={message.startFrame}
              endFrame={message.endFrame}
              fps={fps}
              overlapFrames={overlapFrames}
              subtitlesTextColor={subtitlesTextColor}
              subtitlesLinePerPage={subtitlesLinePerPage}
              subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
              subtitlesLineHeight={subtitlesLineHeight}
              onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </div>
  );
};

export const compositionName = "DialogScene" as const;

export const initInputProps = {
  dialog: [],
  onlyDisplayCurrentSentence: true,
  subtitlesTextColor: "rgba(255, 255, 255, 1)",
  subtitlesLinePerPage: 2,
  subtitlesZoomMeasurerSize: 1,
  subtitlesLineHeight: 120,
  format: "1:1" as const,
} satisfies z.infer<typeof DialogSchema>;

export const FPS = 30;

export const calculateMetadata: CalculateMetadataFunction<z.infer<typeof DialogSchema>> = async ({ props }) => {
  const formatValues = getFormatByEnum(props.format);

  // Calculate total duration based on individual message durations or default to 5 seconds per message
  const totalDuration = props.dialog.reduce((sum, msg) =>
    sum + (Number(msg.durationInSeconds ?? 0) || 5), 0) ?? 1;

  return {
    durationInFrames: Math.floor(totalDuration * FPS),
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
  durationInFrames: 30 * 10, // Default duration if not calculated
  fps: FPS,
  width: 1280,
  height: 720,
  calculateMetadata,
};