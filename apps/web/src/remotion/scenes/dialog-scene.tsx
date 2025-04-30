'use client'
import { zColor } from "@remotion/zod-types";
import { useMemo, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Sequence,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import { z } from "zod";
import { SubtitleType } from "../components/captions";
import { DialogMessage } from "../components/dialog-message";
import { BaseSceneSchema, getFormatByEnum } from "../helpers";

export const DialogSchema = BaseSceneSchema.extend({
  dialog: z.array(z.object({
    personName: z.string(),
    positionPrority: z.enum(["left", "right", "center", "top", "bottom"]),
    subtitleUrl: z.string().url().describe("url").optional(),
    soundUrl: z.string().url().describe("url").optional(),
    avatarUrl: z.string().url().describe("url").optional(),
    durationInSeconds: z.number().min(0),
    animateScale: z.boolean().describe("show").optional(),
    animateOpacity: z.boolean().describe("show").optional(),
  })),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
  captionType: z.enum([
    SubtitleType.DEFAULT,
    SubtitleType.GLITCH,
    SubtitleType.LIGHTNING,
    SubtitleType.TYPEWRITER,
  ]),
});

export type DialogSchemaType = z.infer<typeof DialogSchema>;


export const DialogComposition = ({
  dialog = [],
  subtitlesTextColor,
  subtitlesLinePerPage,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
  captionType = SubtitleType.DEFAULT
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
        animateOpacity: Boolean(msg.animateOpacity),
        animateScale: Boolean(msg.animateOpacity),
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
              captionType={captionType}
              animationConfig={{
                scale: message.animateScale,
                opacity: message.animateOpacity,
              }}
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
  captionType: SubtitleType.DEFAULT
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
  width: 720,
  height: 1280,
  calculateMetadata,
};