'use client'
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import React from "react";

import {
  useCurrentFrame,
  useVideoConfig
} from "remotion";

export const AudioViz: React.FC<{
  readonly waveColor: string;
  readonly numberOfSamples: number;
  readonly freqRangeStartIndex: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioSrc: string;
}> = ({
  waveColor = "rgba(255, 255, 255, 1)",
  numberOfSamples = 256 as const,
  freqRangeStartIndex = 7,
  waveLinesToDisplay = 29,
  mirrorWave = true,
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
