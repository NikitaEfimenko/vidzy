import { Handle } from "@xyflow/react"
import { useWorkflowEditor } from "../../services"
import { HandleProps } from "@xyflow/react"
import { CSSProperties } from "react"

type WorkflowHandleProps = HandleProps & { style?: CSSProperties }

export const WorkflowHandle = (props: WorkflowHandleProps) => {
  const service = useWorkflowEditor()

  return <Handle
    {...props}
    className="w-4 h-4 bg-transparent border-primary border-2"
    isValidConnection={(e) => {
      const sourceNode = service.state.elements.find(node => node.id === e.source)
      const sourceFromHandle = service.state.edges.filter(edge => edge.source === e.source).length
      const targetFromHandle = service.state.edges.filter(edge => edge.target === e.target).length
      if (targetFromHandle === 1) return false
      if (sourceNode?.type === 'condition') return false
      if (sourceFromHandle < 1) return true

      return false
    }}
  />
}