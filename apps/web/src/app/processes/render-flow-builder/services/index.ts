import { atom, useAtom } from "jotai"
import { CustomNodeType } from "../types"
import { Edge, Node, useReactFlow } from "@xyflow/react"
import { initialState } from "../config/initial"

type TEdge = {
  id: string,
  source: string,
  target: string
} | Edge

type TNode = {
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

type TState = {
  selectedNode?: TNode,
  elements: TNode[],
  edges: TEdge[]
}

type THistory = {
  history: TState[],
  pointer?: number
}


const workflowAtom = atom<TState>(initialState)
const historyAtom = atom<THistory>({
  history: [initialState],
  pointer: 0
})

export const useWorkflowEditor = () => {
  const instance = useReactFlow()
  const [state, setState] = useAtom(workflowAtom)
  const [history, setHistory] = useAtom(historyAtom)

  const selectNode = (id: string) => {
    setState(state => ({ ...state, selectedNode: state.elements.find(el => el.id === id) }))
  }
  const setNodes = (cb: (nds: any) => Node[]) => {

    setState(state => ({ ...state, elements: cb(state.elements) }))
  }
  const setEdges = (cb: (nds: any) => Edge[]) => {
    setState(state => ({ ...state, edges: cb(state.edges) }))
  }

  return {
    state,
    history,
    selectNode,
    setNodes,
    setEdges,
    flowInstance: instance
  }
}