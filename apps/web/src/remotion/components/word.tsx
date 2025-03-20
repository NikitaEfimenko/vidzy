import React, { useMemo } from 'react';
import { interpolate, Easing } from 'remotion'; // Предположим, что вы используете Remotion
import { Caption } from '@remotion/captions';
import { msToFrame } from './utils';
import { cn } from '../../shared/lib/utils';

export const Word: React.FC<{
  readonly item: Caption;
  readonly frame: number;
  readonly transcriptionColor: string; // Формат: "rgba(0, 0, 200, 0.93)"
}> = ({ item, frame, transcriptionColor }) => {
  
  // Анимация появления текста
  const opacity = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10],
    [0.2, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Анимация смещения текста
  const translateY = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10],
    [0.2, 0],
    {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Анимация цвета текста (белый -> transcriptionColor)
  const textColorProgress = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10], // Анимация цвета текста
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const fontSizeProgress = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 5, msToFrame(item.startMs) + 10], // Анимация fontSize
    [1, 1.8, 1], 
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const badgeProgress = interpolate(
    frame,
    [msToFrame(item.startMs), msToFrame(item.startMs) + 10], 
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Вычисляем текущий цвет текста
  const textColor = useMemo(() => {
    const startColor = { r: 255, g: 255, b: 255 }; // Белый цвет
    const endColor = parseRgba(transcriptionColor); // Конечный цвет (transcriptionColor)

    return `rgba(
      ${startColor.r + (endColor.r - startColor.r) * textColorProgress},
      ${startColor.g + (endColor.g - startColor.g) * textColorProgress},
      ${startColor.b + (endColor.b - startColor.b) * textColorProgress},
      1
    )`;
  }, [textColorProgress, transcriptionColor]);


  const fontSize = useMemo(() => {
    const baseFontSize = 52; // Базовый размер шрифта
    return `${baseFontSize * fontSizeProgress}px`;
  }, [fontSizeProgress]);

  // Стили для текста
  const style: React.CSSProperties = useMemo(() => {
    return {
      display: 'inline-block',
      opacity,

      translate: `0 ${translateY}em`,
      color: textColor, // Текущий цвет текста
      padding: '1rem',
      fontSize, // Текущий размер шрифта
      textStroke: `2px black`,
      WebkitTextStroke: `2px black`, // Для Safari и старых браузеров
      textShadow: `2px 2px 10px black`,
      transition: 'color 0.3s ease, background-color 0.3s ease, font-size 0.3s ease', // Плавные переходы
    };
  }, [opacity, translateY, textColor, fontSize]);

  return (
    <span style={style}>
      <span className={cn('font-bold text-shadow-xl py-1 px-3 shadow-black', badgeProgress > 0 && "rounded-lg bg-primary")}>
        {item.text}
      </span>
    </span>
  );
};

// Вспомогательная функция для парсинга RGBA
const parseRgba = (rgba: string) => {
  const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!match) throw new Error('Invalid RGBA format');
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: parseFloat(match[4]),
  };
};