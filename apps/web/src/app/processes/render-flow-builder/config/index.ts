import { CustomNodeType, TNode } from "../types";
import crypto from "crypto";


type Content = {
  title: string
}

export const nodeContextSchema = {
  "annotation": {
    title: "Annotation",
  },
  "audio-injector": {
    title: "AudioInjector",
  },
  "file-injector": {
    title: "FileInjector",
  },
  "image-injector": {
    title: "ImageInjector",
  },
  "json-injector": {
    title: "JsonInjector",
  },
  "json-mapper": {
    title: "JsonMapper",
  },
  "previewer": {
    title: "Previewer",
  },
  "transcribe-injector": {
    title: "TranscribeInjector",
  },
  "ai-helper": {
    title: "AIHelper",
  },

} satisfies Record<CustomNodeType, Content>

export const nodeFactory = (node?: Partial<TNode>) => {
  const id = crypto.randomBytes(20).toString('hex')
  return {
    data: {
      completed: false,
      current: false,
      meta: {
      },
      title: nodeContextSchema[(node?.type as CustomNodeType) || 'action' as CustomNodeType].title,
      type: node?.type || ('action' as const),
    },
    id: id,
    position: {
      x: node?.position?.x || 0,
      y: node?.position?.y || 0
    },
    type: node?.type || ('action' as const),
    ...(node?.type as CustomNodeType) === 'annotation' ? { width: 150, height: 150 } : {},
    edges: []
  }
}
