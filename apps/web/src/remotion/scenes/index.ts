import * as SimpleScene from "./simple-preview"
import * as KaraokeScene from "./karaoke"

export const scenes = [
  {
    composition: SimpleScene.SimplePreview,
    schema: SimpleScene.SimplePreviewSchema,
    config: SimpleScene.config,
    initInputProps: {count: '5'}
  },
  {
    composition: KaraokeScene.KaraokeComposition,
    schema: KaraokeScene.KaraokeSchema,
    config: KaraokeScene.config,
    initInputProps: KaraokeScene.initInputProps,
    calculateMetadata: KaraokeScene.calculateMetadata
  }
]