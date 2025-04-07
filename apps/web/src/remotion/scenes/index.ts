'use client'
import * as StoryScene from "./story-scene"
import * as QuizScene from "./quiz-scene"
import * as CubesScene from "./cubes-physics"
import * as CompositorScene from "./compositor-scene"
import * as DialogScene from "./dialog-scene"

export const scenes = [
  {
    composition: StoryScene.StoryComposition,
    schema: StoryScene.StorySchema,
    compositionName: StoryScene.compositionName,
    config: StoryScene.config,
    initInputProps: StoryScene.initInputProps,
    calculateMetadata: StoryScene.calculateMetadata
  },
  {
    composition: QuizScene.QuizComposition,
    schema: QuizScene.QuizSchema,
    compositionName: QuizScene.compositionName,
    config: QuizScene.config,
    initInputProps: QuizScene.initInputProps,
    calculateMetadata: QuizScene.calculateMetadata
  },
  {
    composition: CubesScene.CubesComposition,
    schema: CubesScene.CubesSceneSchema,
    compositionName: CubesScene.compositionName,
    config: CubesScene.config,
    initInputProps: CubesScene.initInputProps,
    calculateMetadata: CubesScene.calculateMetadata
  },
  {
    composition: CompositorScene.CompositorScene,
    schema: CompositorScene.CompositorSchema,
    compositionName: CompositorScene.compositionName,
    config: CompositorScene.config,
    initInputProps: CompositorScene.initInputProps,
    calculateMetadata: CompositorScene.calculateMetadata
  },
  {
    composition: DialogScene.DialogComposition,
    schema: DialogScene.DialogSchema,
    compositionName: DialogScene.compositionName,
    config: DialogScene.config,
    initInputProps: DialogScene.initInputProps,
    calculateMetadata: DialogScene.calculateMetadata
  }
]