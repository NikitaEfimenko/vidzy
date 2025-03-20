export const msToFrame = (time: number, FPS: number = 30) => {
  return Math.floor((time / 1000) * FPS);
};
