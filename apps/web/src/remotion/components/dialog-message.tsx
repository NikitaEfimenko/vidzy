'use client'
import { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender
} from "remotion";
import { SubtitleType } from "../components/captions";
import { Slide } from "../components/slide";
import { PaginatedSubtitles } from "../components/subtitles";


export type DialogMessageType = {
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
  captionType?: SubtitleType;
  animationConfig?: {
    scale: boolean;
    opacity: boolean
  }
}

export const DialogMessage = ({
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
  captionType = SubtitleType.DEFAULT,
  animationConfig
}: DialogMessageType) => {
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
          overlapFrames={overlapFrames}
          animateOpacity={animationConfig?.opacity}
          animateScale={animationConfig?.scale}
        />
      )}
    </AbsoluteFill>


    <AbsoluteFill>

      <div className={`absolute inset-0 bottom-0 flex min-w-96 transition-all ${positionClasses[positionPrority]} p-4`}>
        <div className="bg-black bg-opacity-70 rounded-lg p-4 max-w-2xl">
          {avatarUrl && (
            <div className="flex items-center mb-2">
              <span className="text-white text-4xl font-bold" style={{ fontFamily: 'Courier New, monospace' }}>
                {personName}:</span>
            </div>
          )}
          {/* <div className="bg-white h-[1px] w-full"></div> */}
          {subtitles && (
            <div className="text-white py-3">
              <PaginatedSubtitles
                subtitles={subtitles}
                startFrame={startFrame}
                endFrame={endFrame}
                linesPerPage={subtitlesLinePerPage}
                subtitlesTextColor={subtitlesTextColor}
                subtitlesZoomMeasurerSize={subtitlesZoomMeasurerSize}
                subtitlesLineHeight={subtitlesLineHeight}
                onlyDisplayCurrentSentence={onlyDisplayCurrentSentence}
                captionType={captionType}
              />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  </>
  );
};
