import React from 'react';
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { useWorkflowEditor } from '../../services';
import type { EdgeProps } from '@xyflow/react';
import { Button } from '@/shared/ui/button';


export const EditableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { flowInstance } = useWorkflowEditor();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
 
  const onEdgeClick = () => {
    console.log("click")
    flowInstance.setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  return <div>
  <BaseEdge path={edgePath} markerEnd={markerEnd} style={style}/>
  <EdgeLabelRenderer>
  <div
      className="button-edge__label nodrag nopan"
      style={{
        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
      }}
    >
      <Button className="button-edge__button" onClick={onEdgeClick}>
        ×
      </Button>
    </div>
  </EdgeLabelRenderer>
</div>
}