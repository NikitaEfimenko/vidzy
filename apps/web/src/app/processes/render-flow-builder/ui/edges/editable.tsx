import type { EdgeProps, Position } from '@xyflow/react';
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Node,
  useStore
} from '@xyflow/react';
import { useWorkflowEditor } from '../../services';
import { Button } from '@/shared/ui/button';
import { MdDelete } from 'react-icons/md';
import { useEffect, useMemo } from 'react';
import { JsonSchema, jsonSchemaToZod } from '@n8n/json-schema-to-zod';
import { z } from 'zod';
import { toast } from 'sonner';
import zodToJsonSchema from 'zod-to-json-schema';

export type EditableEdgeData<T extends Node = Node> = Edge<{
  key?: keyof T["data"];
  path?: "bezier" | "smoothstep" | "step" | "straight";
}>;

export const EditableEdge = <T extends Node>({
  data = { path: "bezier" },
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  source,
  target,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps<EditableEdgeData<T>>) => {
  const { flowInstance } = useWorkflowEditor();
  const sourceNode = useStore((state) => state.nodeLookup.get(source));
  const targetNode = useStore((state) => state.nodeLookup.get(target));

  const {
    sourceSchema,
  } = useMemo(() => {
    const sourceData = sourceNode?.data;
    const sourceSchemaDef = sourceData?.["outputSchema" as keyof typeof sourceData] as undefined | JsonSchema;

    return {
      sourceSchema: sourceSchemaDef ? jsonSchemaToZod(sourceSchemaDef) as z.ZodObject<any> : undefined,
    };
  }, [JSON.stringify(sourceNode?.data)]);


  useEffect(() => {
    if (targetNode?.id && sourceSchema) {
      try {
        flowInstance.updateNodeData(
          targetNode.id,
          node => ({
            ...node.data,
            inputSchema: zodToJsonSchema(sourceSchema)
          })
        );
      } catch (e) {
        toast.error(String(e));
      }
    }
  }, [flowInstance, targetNode?.id, JSON.stringify(sourceSchema)]);


  const onEdgeClick = () => {
    flowInstance.setEdges((edges: Edge[]) => edges.filter((edge) => edge.id !== id));
  };

  const [edgePath, labelX, labelY] = getPath({
    type: data.path ?? "bezier",
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const transform = `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`;

  return <>
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
    <EdgeLabelRenderer>
      <div
        className="!absolute !rounded !border-primary !border !bg-background !px-1 !text-foreground edge-label-renderer__custom-edge nopan "
        style={{ transform, pointerEvents: 'all' }}
        onClick={() => {

        }}
      >

        <Button variant="ghost" size="icon" onClick={onEdgeClick}><MdDelete /></Button>
      </div>
    </EdgeLabelRenderer>
  </>
}

function getPath({
  type,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: GetPathParams) {
  switch (type) {
    case "bezier":
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });

    case "smoothstep":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });

    case "step":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });

    case "straight":
      return getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });

    default:
      throw new Error(`Unknown path type: ${type}`);
  }
}


interface GetPathParams {
  type: "bezier" | "smoothstep" | "step" | "straight";
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}