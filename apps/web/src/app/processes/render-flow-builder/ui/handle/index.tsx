import { Handle } from "@xyflow/react"
import { useWorkflowEditor } from "../../services"
import { HandleProps } from "@xyflow/react"
import { CSSProperties } from "react"

type CustomHandleProps = HandleProps & { style?: CSSProperties }

export const CustomHandle = (props: CustomHandleProps) => {
  const service = useWorkflowEditor()

  return <Handle
    {...props}
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