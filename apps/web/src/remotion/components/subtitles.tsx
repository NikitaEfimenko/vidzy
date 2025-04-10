import { parseSrt, ParseSrtOutput } from '@remotion/captions';
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  cancelRender,
  continueRender,
  delayRender,
  useCurrentFrame,
  useCurrentScale
} from "remotion";
import { ensureFont } from "./ensure-font";
import { msToFrame } from './utils';
import { Word } from "./word";
import { CaptionView } from './base-caption';
import { SubtitleType } from './captions';

const useWindowedFrameSubs = (
  src: string,
  options: { windowStart: number; windowEnd: number },
) => {
  const { windowStart, windowEnd } = options;

  const parsed = useMemo<ParseSrtOutput | null>(() => {
    let result = null
    try {
      result = parseSrt({ input: src })
    } catch {
      result = null
    }
    return result
  }, [src]);
  return useMemo(() => {
    if (!parsed) {
      return []
    }
    return parsed?.captions.filter(({ startMs, endMs }) => {
      return msToFrame(startMs) <= windowEnd
    });
  }, [parsed?.captions, windowEnd, windowStart]);
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
  readonly captionType?: SubtitleType
}> = ({
  startFrame,
  endFrame,
  subtitles,
  linesPerPage = 1,
  subtitlesTextColor: transcriptionColor = "rgba(255, 255, 255, 1)",
  subtitlesLineHeight = 120,
  subtitlesZoomMeasurerSize = 1,
  onlyDisplayCurrentSentence = true,
  captionType = SubtitleType.DEFAULT
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
    return msToFrame(word.startMs) <= frame;
  });


  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height: `${linesPerPage * subtitlesLineHeight}px`,
      }}
    >
      <div
        ref={windowRef}
        style={{
          transform: `translateY(-${lineOffset * subtitlesLineHeight}px)`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0.5em",
        }}
        
      >
        {currentFrameSentences.map((item) => (
          <span key={item.startMs + item.endMs} id={String(item.startMs + item.endMs)}>
            {/* <Word
              frame={frame}
              item={item}
              transcriptionColor={transcriptionColor}
            />{" "} */}
            <CaptionView
              frame={frame}
              item={item}
              transcriptionColor={transcriptionColor}
              subtitleType={captionType}
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