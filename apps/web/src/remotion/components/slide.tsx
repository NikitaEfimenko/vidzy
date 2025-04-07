'use client'
import React from "react";

import {
  AnimatedImage,
  Easing,
  Img,
  interpolate,
  useCurrentFrame
} from "remotion";

export interface SlideProps {
  img: string;
  startFrame: number;
  endFrame: number;
  fps: number;
  overlapFrames: number;
}

export const Slide: React.FC<SlideProps> = ({ img, startFrame, endFrame, overlapFrames, fps }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fps / 2, endFrame - startFrame - fps / 2 - overlapFrames, endFrame - startFrame],
    [0.2, 1, 1, 0.2],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const scale = interpolate(
    frame,
    [0, endFrame - startFrame],
    [1, 1.8],
    {
      easing: Easing.inOut(Easing.ease),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity,
        transform: `scale(${scale})`,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <AnimatedImage
        src={img}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: '-1'
        }}
      />
    </div>
  );
};