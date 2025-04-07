'use client'
import React from "react";
import {
  AnimatedImage,
  Easing,
  Img,
  interpolate,
  useCurrentFrame,
  Video
} from "remotion";

export type MediaType = 'image' | 'gif' | 'video';

export interface SlideProps {
  mediaSrc: string;
  mediaType: MediaType;
  startFrame: number;
  endFrame: number;
  fps: number;
  overlapFrames: number;
  videoStartFrom?: number; // Начальная точка для видео (в секундах)
  videoEndAt?: number; // Конечная точка для видео (в секундах)
}

export const ExtendedSlide: React.FC<SlideProps> = ({ 
  mediaSrc, 
  mediaType, 
  startFrame, 
  endFrame, 
  overlapFrames, 
  fps,
  videoStartFrom = 0,
  videoEndAt
}) => {
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

  // Для видео вычисляем текущее время
  const videoTime = videoStartFrom + frame / fps;

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
      {mediaType === 'video' ? (
        <Video
          src={mediaSrc}
          startFrom={videoStartFrom * fps} // переводим секунды в кадры
          endAt={videoEndAt ? videoEndAt * fps : undefined}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <AnimatedImage
          src={mediaSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
    </div>
  );
};