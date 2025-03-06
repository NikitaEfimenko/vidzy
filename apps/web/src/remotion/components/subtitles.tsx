import {parseSrt, Caption} from '@remotion/captions';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  useCurrentFrame,
  useCurrentScale,
  useVideoConfig,
} from "remotion";
import { ensureFont } from "./ensure-font";
import { Word } from "./word";
import { msToFrame } from '../scenes/karaoke';

const useWindowedFrameSubs = (
  src: string,
  options: { windowStart: number; windowEnd: number },
) => {
  const { windowStart, windowEnd } = options;

  const parsed = useMemo(() => parseSrt({ input: src }), [src]);

  return useMemo(() => {
    return parsed.captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) >= windowStart && msToFrame(endMs) <= windowEnd;
    });
  }, [parsed.captions, windowEnd, windowStart]);
}; 


export const PaginatedSubtitles: React.FC<{
  readonly subtitles: string;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly linesPerPage: number;
  readonly subtitlesTextColor: string;
  readonly subtitlesZoomMeasurerSize: number;
  readonly subtitlesLineHeight: number;
  readonly onlyDisplayCurrentSentence: boolean;
}> = ({
  startFrame,
  endFrame,
  subtitles,
  linesPerPage,
  subtitlesTextColor: transcriptionColor,
  subtitlesZoomMeasurerSize,
  subtitlesLineHeight,
  onlyDisplayCurrentSentence,
}) => {
  const frame = useCurrentFrame();
  const windowRef = useRef<HTMLDivElement>(null);
  const zoomMeasurer = useRef<HTMLDivElement>(null);
  const [handle] = useState(() => delayRender());
  const [fontHandle] = useState(() => delayRender());
  const [fontLoaded, setFontLoaded] = useState(false);
  const windowedFrameSubs = useWindowedFrameSubs(subtitles, {
    windowStart: startFrame,
    windowEnd: endFrame,
  });

  const currentScale = useCurrentScale();

  const [lineOffset, setLineOffset] = useState(0);

  const currentAndFollowingSentences = useMemo(() => {
    // If we don't want to only display the current sentence, return all the words
    if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

    const indexOfCurrentSentence =
      windowedFrameSubs.findLastIndex((w, i) => {
        const nextWord = windowedFrameSubs[i + 1];

        return (
          nextWord &&
          (w.text.endsWith("?") ||
            w.text.endsWith(".") ||
            w.text.endsWith("!")) &&
            msToFrame(nextWord.startMs) < frame
        );
      }) + 1;

    return windowedFrameSubs.slice(indexOfCurrentSentence);
  }, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);



  useEffect(() => {
    if (!fontLoaded) {
      return;
    }
    const linesRendered =
      (windowRef.current?.getBoundingClientRect().height as number) /
      (subtitlesLineHeight * currentScale);
    const linesToOffset = Math.max(0, linesRendered - linesPerPage);
    setLineOffset(linesToOffset);
    continueRender(handle);
  }, [
    fontLoaded,
    currentScale,
    frame,
    handle,
    linesPerPage,
    subtitlesLineHeight,
    subtitlesZoomMeasurerSize,
  ]);


  useEffect(() => {
    ensureFont()
      .then(() => {
        continueRender(fontHandle);
        setFontLoaded(true);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [fontHandle, fontLoaded]);


  const currentFrameSentences = currentAndFollowingSentences.filter((word) => {
    return msToFrame(word.startMs) < frame;
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "20px",
      }}
    >
      <div
        ref={windowRef}
        style={{
          transform: `translateY(-${lineOffset * subtitlesLineHeight}px)`,
        }}
      >
        {currentFrameSentences.map((item) => (
          <span key={item.startMs + item.endMs} id={String(item.startMs + item.endMs)}>
            <Word
              frame={frame}
              item={item}
              transcriptionColor={transcriptionColor}
            />{" "}
          </span>
        ))}
      </div>
    </div>
  );
};

declare global {
  interface Array<T> {
    findLastIndex(
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: unknown,
    ): number;
  }
}