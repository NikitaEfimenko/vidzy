import { Edge, Node } from "@xyflow/react"

export type CustomNodeType = "ai-helper" | "audio-injector" | "annotation" | "file-injector" | "image-injector" | "json-injector" | "json-mapper" | "transcribe-injector" | "previewer"
export type TEdge = {
  id: string,
  source: string,
  target: string
} | Edge

export type TNode = {
  data: {
    completed: boolean,
    current: boolean,
    description: string,
    meta: object,
    title: string,
    type: CustomNodeType,
  },
  id: string,
  position: {
    x: number,
    y: number
  }
  type: CustomNodeType,
} | Node

export type TState = {
  selectedNode?: TNode,
  elements: TNode[],
  edges: TEdge[]
}

export type THistory = {
  history: TState[],
  pointer?: number
}