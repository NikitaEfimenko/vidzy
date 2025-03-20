import { Caption, FragmentData } from "../dto/model";

export const splitCaptionsIntoFragments = (
  captions: Caption[],
  durationInFrames: number
): FragmentData[] => {
  const scenes: FragmentData[] = [];
  let currentFrame = 0;

  captions.forEach((caption, index) => {
    const startFrame = currentFrame;
    const endFrame = startFrame + durationInFrames;

    scenes.push({
      id: `scene-${index}`,
      image: `https://example.com/image${index + 1}.jpg`, // Заглушка для изображения
      text: `Сцена ${index + 1}`,
      captions: caption.text,
      durationInFrames: endFrame - startFrame,
    });

    currentFrame = endFrame;
  });

  return scenes;
};