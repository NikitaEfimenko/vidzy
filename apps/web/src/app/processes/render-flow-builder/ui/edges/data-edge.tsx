'use client'
import { SchemaMapper } from "@/shared/ui/object-mapper/ui";
import { jsonSchemaToZod } from "@n8n/json-schema-to-zod";
import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Node,
  Position,
  useStore,
} from "@xyflow/react";
import { JsonSchema } from "json-schema-to-zod";
import { AlertOctagonIcon, MapIcon } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useWorkflowEditor } from "../../services";
import { Mapping, transformData } from "@/shared/lib/schema-mapper";
import { FormAction } from "@/shared/ui/form-action";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

export type DataEdge<T extends Node = Node> = Edge<{
  /**
   * The key to lookup in the source node's `data` object. For additional safety,
   * you can parameterize the `DataEdge` over the type of one of your nodes to
   * constrain the possible values of this key.
   *
   * If no key is provided this edge behaves identically to React Flow's default
   * edge component.
   */
  key?: keyof T["data"];
  /**
   * Which of React Flow's path algorithms to use. Each value corresponds to one
   * of React Flow's built-in edge types.
   *
   * If not provided, this defaults to `"bezier"`.
   */
  path?: "bezier" | "smoothstep" | "step" | "straight";
  mappings?: Mapping[];
}>;

interface GetPathParams {
  type: "bezier" | "smoothstep" | "step" | "straight";
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}

interface MappingFormProps {
  sourceSchema?: z.ZodObject<any>;
  targetSchema?: z.ZodObject<any>;
  initialMappings: Mapping[];
  onSave: (mappings: Mapping[]) => void;
}

export function MappingForm({
  sourceSchema,
  targetSchema,
  initialMappings,
  onSave,
}: MappingFormProps) {

  if (!sourceSchema || !targetSchema) {
    const description = "sourceSchema or targetSchema is not configured";
    console.warn(description);

    return (
      <div className="flex flex-col gap-1 items-center">
        <AlertOctagonIcon className="w-8 h-8 text-destructive" />
        <span className="text-xs text-destructive whitespace-pre-wrap max-w-32">
          {description}
        </span>
      </div>
    );
  }

  return (
    <FormAction
      className="md:max-w-4xl"
      title="Mapping"
      description=""
      formSlot={
        <SchemaMapper
          sourceSchema={sourceSchema}
          targetSchema={targetSchema}
          initialMapping={initialMappings}
          onSave={onSave}
        />
      }
      formControls={<></>}
      ctaSlot={
        <Button variant={Object.keys(initialMappings).length === 0 ? "destructive" : "default"}>
          <MapIcon size={48} />
        </Button>
      }
    />
  );
}

export function DataMapper<T extends Node>({
  data = { path: "bezier" },
  id,
  markerEnd,
  source,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
  target
}: EdgeProps<DataEdge<T>>) {
  const { flowInstance } = useWorkflowEditor();
  const sourceNode = useStore((state) => state.nodeLookup.get(source));
  const targetNode = useStore((state) => state.nodeLookup.get(target));

  // Локальное состояние для маппингов
  console.log(data, "edge data")
  const [localMappings, setLocalMappings] = useState<Mapping[]>(data.mappings || []);
  console.log(sourceNode, "source")
  console.log(targetNode, "target")
  const {
    sourceValue,
    sourceSchema,
    targetSchema
  } = useMemo(() => {
    const sourceData = sourceNode?.data;
    const targetData = targetNode?.data;
    const sourceSchemaDef = sourceData?.["outputSchema" as keyof typeof sourceData] as undefined | JsonSchema;
    const sourceValue = sourceData?.["outputData" as keyof typeof sourceData] as undefined | JsonSchema;
    const targetSchemaDef = targetData?.["inputSchema" as keyof typeof targetData];

    return {
      sourceValue,
      sourceSchema: sourceSchemaDef ? jsonSchemaToZod(sourceSchemaDef) as z.ZodObject<any> : undefined,
      targetSchema: targetSchemaDef ? jsonSchemaToZod(targetSchemaDef) as z.ZodObject<any> : undefined
    };
  }, [JSON.stringify(sourceNode?.data), JSON.stringify(targetNode?.data)]);

  const deferededInput = useDeferredValue(sourceValue);

  // Сохраняем маппинги в edge данные
  const handleSaveMappings = useCallback((newMappings: Mapping[]) => {
    console.log("handle save mapping")
    flowInstance.setEdges((edges) =>
      edges.map((edge) => {
        console.log(edge.id, id, "id check")
        return edge.id === id ? { ...edge, data: { ...edge.data, mappings: newMappings } } : edge
      })
    );
    setLocalMappings(newMappings);
  }, [flowInstance, id]);

  useEffect(() => {
    console.log(deferededInput, targetNode?.id, localMappings, sourceSchema, targetSchema, "useeffect")
    if (targetNode?.id && localMappings && sourceSchema && targetSchema) {
      try {
        const newData = transformData(deferededInput, sourceSchema, targetSchema, localMappings);
        flowInstance.updateNodeData(
          targetNode.id,
          node => ({
            ...node.data,
            inputData: newData
          })
        );
      } catch (e) {
        console.log("error!!!", String(e))
        toast.error(String(e));
      }
    }
  }, [flowInstance, deferededInput, targetNode?.id, localMappings, sourceSchema, targetSchema]);
  
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

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />

      <EdgeLabelRenderer>
        <div
          className="!absolute !rounded !border-primary !border !bg-background !px-1 !text-foreground edge-label-renderer__custom-edge nopan "
          style={{ transform, pointerEvents: 'all' }}
          onClick={() => {
          }}
        >
          <div className="flex flex-col gap-2 p-4">
            <MappingForm
              sourceSchema={sourceSchema}
              targetSchema={targetSchema}
              initialMappings={localMappings}
              onSave={handleSaveMappings}
            />
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

/**
 * Chooses which of React Flow's edge path algorithms to use based on the provided
 * `type`.
 */
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