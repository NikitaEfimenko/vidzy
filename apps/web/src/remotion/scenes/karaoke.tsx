'use client'
import { useAudioData, visualizeAudio, getAudioDurationInSeconds } from "@remotion/media-utils";
import React, { useEffect, useRef, useState } from "react";

import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";


import { PaginatedSubtitles } from "../components/subtitles";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const KaraokeSchema = z.object({
  durationInSeconds: z.number().positive(),
  audioOffsetInSeconds: z.number().min(0),
  subtitlesFileName: z.string(),
  audioFileName: z.string(),
  coverImgFileName: z
    .string()
    .optional(),
  titleText: z.string(),
  titleColor: zColor(),
  waveColor: zColor(),
  subtitlesTextColor: zColor(),
  subtitlesLinePerPage: z.number().int().min(0),
  subtitlesLineHeight: z.number().int().min(0),
  subtitlesZoomMeasurerSize: z.number().int().min(0),
  onlyDisplayCurrentSentence: z.boolean(),
  mirrorWave: z.boolean(),
  waveLinesToDisplay: z.number().int().min(0),
  waveFreqRangeStartIndex: z.number().int().min(0),
  waveNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
});

type AudiogramCompositionSchemaType = z.infer<typeof KaraokeSchema>;

const AudioViz: React.FC<{
  readonly waveColor: string;
  readonly numberOfSamples: number;
  readonly freqRangeStartIndex: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  waveColor,
  numberOfSamples,
  freqRangeStartIndex,
  waveLinesToDisplay,
  mirrorWave,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const audioData = useAudioData(audioSrc);

  if (!audioData) {
    return null;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples,
  });

  const frequencyDataSubset = frequencyData.slice(
    freqRangeStartIndex,
    freqRangeStartIndex +
      (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay),
  );

  const frequenciesToDisplay = mirrorWave
    ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
    : frequencyDataSubset;

  return (
    <div className="audio-viz">
      {frequenciesToDisplay.map((v, i) => {
        return (
          <div
            key={i}
            className="bar"
            style={{
              minWidth: "1px",
              backgroundColor: waveColor,
              height: `${500 * Math.sqrt(v)}%`,
            }}
          />
        );
      })}
    </div>
  );
};



export const KaraokeComposition: React.FC<AudiogramCompositionSchemaType> = ({
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
}) => {
  const { durationInFrames } = useVideoConfig();

  const [handle] = useState(() => delayRender());
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    subtitlesFileName && fetch(subtitlesFileName, {
      mode: "no-cors"
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

  if (!subtitles || !audioFileName) {
    return null;
  }

  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * config.fps);
  return (
    <div ref={ref}>
      <AbsoluteFill>
        <Sequence from={-audioOffsetInFrames}>
          {audioFileName && <Audio pauseWhenBuffering src={audioFileName} />}
          <div
            className="container"
            style={{
              fontFamily: "IBM Plex Sans",
            }}
          >
            <div className="row">
              {coverImgFileName && <Img className="cover" src={coverImgFileName} />}

              <div className="title" style={{ color: titleColor }}>
                {titleText}
              </div>
            </div>

            <div>
              <AudioViz
                audioSrc={audioFileName}
                mirrorWave={mirrorWave}
                waveColor={waveColor}
                numberOfSamples={Number(waveNumberOfSamples)}
                freqRangeStartIndex={waveFreqRangeStartIndex}
                waveLinesToDisplay={waveLinesToDisplay}
              />
            </div>
            <div
              style={{ lineHeight: `${subtitlesLineHeight}px` }}
              className="captions"
            >
              <PaginatedSubtitles
                subtitles={subtitles}
                startFrame={audioOffsetInFrames}
                endFrame={audioOffsetInFrames + durationInFrames}
                linesPerPage={subtitlesLinePerPage}
                subtitlesTextColor={subtitlesTextColor}
                subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                subtitlesLineHeight={subtitlesLineHeight}
                onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
              />
            </div>
          </div>
        </Sequence>

      </AbsoluteFill>
    </div>
  );
};

export const compositionName = "KaraokeScene"

export const initInputProps = {
  // Audio settings
  audioOffsetInSeconds: 6.9,

  // Title settings
  audioFileName: '/oauth/public/1735334010026_output.wav',
  coverImgFileName: '',
  titleText:
    "RHCP! - Under-the-bridge",
  titleColor: "rgba(186, 186, 186, 0.93)",

  // Subtitles settings
  subtitlesFileName: '/oauth/public/1735337131023_output.srt',
  onlyDisplayCurrentSentence: true,
  subtitlesTextColor: "rgba(186, 186, 186, 0.93)",
  subtitlesLinePerPage: 2,
  subtitlesZoomMeasurerSize: 1,
  subtitlesLineHeight: 98,

  // Wave settings
  waveColor: "#a3a5ae",
  waveFreqRangeStartIndex: 7,
  waveLinesToDisplay: 29,
  waveNumberOfSamples: "256",
  mirrorWave: true,
  durationInSeconds: 30,
}

export const FPS = 30

export const calculateMetadata = async ({ props }: any) => {
  const durationInSeconds = await getAudioDurationInSeconds(
    props.audioFileName,
  );

  return {
    durationInFrames: Math.floor(
      (durationInSeconds - props.audioOffsetInSeconds) * FPS,
    ),
    props: {
      ...props,
    },
    fps: FPS,
  };
}

export const msToFrame = (time: number) => {
  return Math.floor((time / 1000) * FPS);
};

export const config = {
  durationInFrames: 30 * 60 * 3,
  fps: FPS,
  height: 768,
  width: 1024
}