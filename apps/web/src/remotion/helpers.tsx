import { z } from "zod"

export const VideoFormatEnum = {
  Vertical: "9:16",
  Square: "1:1",
  Horizontal: "16:9"
} as const;

export type VideoFormat = typeof VideoFormatEnum[keyof typeof VideoFormatEnum];

export const videoFormatValues = [
  VideoFormatEnum.Vertical,
  VideoFormatEnum.Square,
  VideoFormatEnum.Horizontal,
] as const;

export const BaseSceneSchema = z.object({
  format: z.enum(videoFormatValues),
});


export const getFormatByEnum = (format: VideoFormat) => {
  let width: number;
  let height: number;
  switch (format) {
    case VideoFormatEnum.Vertical:
      width = 720;
      height = 1280;
      break;
    case VideoFormatEnum.Square:
      width = 1080;
      height = 1080;
      break;
    case VideoFormatEnum.Horizontal:
    default:
      width = 1280;
      height = 720;
      break;
  }
  return {
    width, height
  }
}