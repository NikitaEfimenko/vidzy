import {
  useCurrentFrame,
  useVideoConfig,
  interpolate
} from "remotion";
import React from "react";
import { SubtitleStyleProps } from "./types";
import { msToFrame } from "../utils";

export const TypewriterCaption: React.FC<SubtitleStyleProps> = ({
  item,
  transcriptionColor,
  frame
}) => {

  const { fps } = useVideoConfig();
  const totalChars = item.text.length;
  const localFrame = frame - msToFrame(item.startMs)
  const charCount = Math.floor(interpolate(
    localFrame,
    [0, (msToFrame(item.endMs) - msToFrame(item.startMs)) * 0.5],
    [0, totalChars],
    { extrapolateRight: 'clamp' }
  ));

  const styleCombined: React.CSSProperties = {
    fontFamily: 'Courier New, monospace',
    fontSize: 52,
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '0.5em',
    WebkitTextStroke: `2px black`, // 
    color: transcriptionColor ?? 'white',
    width: '100%',
  };

  return (
    <div style={styleCombined}>
      {item.text.split('').map((char, index) => (
        <span key={index} style={{ visibility: index < charCount ? 'visible' : 'hidden' }}>
          {char}
        </span>
      ))}
      {charCount < item.text.length && (
        <span style={{
          opacity: interpolate(localFrame % (fps * 0.5), [0, fps * 0.5], [1, 0]),
        }}>
          |
        </span>
      )}
    </div>
  );
};