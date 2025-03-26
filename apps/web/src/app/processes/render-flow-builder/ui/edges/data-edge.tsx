import { objectToZodSchema } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FormAction } from "@/shared/ui/form-action";
import { HoverCard, HoverCardContent } from "@/shared/ui/hover-card";
import { FormGeneratorBody, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import { HoverCardTrigger } from "@radix-ui/react-hover-card";
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
import { AlertOctagonIcon, Map, MapIcon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo } from "react";
import { MdDangerous, MdErrorOutline } from "react-icons/md";
import { z } from "zod";
import { jsonSchemaToZod } from "@n8n/json-schema-to-zod";
import { useWorkflowEditor } from "../../services";


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
  const { flowInstance } = useWorkflowEditor()
  const sourceNode = useStore((state) => {
    return state.nodeLookup.get(source)
  });
  const targetNode = useStore((state) => {
    return state.nodeLookup.get(target)
  });
  const sourceData = useMemo(() => sourceNode?.data, [sourceNode])
  const targetData = useMemo(() => targetNode?.data, [targetNode])
  
  const deferededInput = useDeferredValue(sourceData)
  useEffect(() => {
    if (targetNode?.id) {
      console.log(deferededInput, "defered")
      flowInstance.updateNodeData(
        targetNode.id,
        node => ({
          ...node.data,
          inputData: {count: (deferededInput?.outputData as any)?.number ?? 9}
        })
      )
    }
  }, [flowInstance, deferededInput, targetNode?.id])

  const [edgePath, labelX, labelY] = getPath({
    type: data.path ?? "bezier",
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const labelSlot = useMemo(() => {
    if (sourceData && targetData) {
      const sourceSchemaDef = sourceData?.["outputSchema" as keyof typeof sourceData] as undefined | JsonSchema;
      const sourceValue = sourceData?.["outputData" as keyof typeof sourceData] as undefined | JsonSchema;
      const targetSchemaDef = targetData?.["inputSchema" as keyof typeof targetData];
      console.log(sourceValue, sourceSchemaDef, targetSchemaDef, "target!")
      if (!(sourceValue && sourceSchemaDef && targetSchemaDef && typeof sourceValue === 'object')) {
        const description = "sourceValue or targetValue is not object"
        console.warn(description)
        return <div className="flex flex-col gap-1 items-center">
          <AlertOctagonIcon className="w-8 h-8 text-destructive" />
          <span className="text-xs text-destructive">
            {description}
          </span>
        </div>
      }
      const sourceSchema = jsonSchemaToZod(sourceSchemaDef) as z.ZodObject<any>;
      const targetSchema = jsonSchemaToZod(targetSchemaDef) as z.ZodObject<any>;
      return <FormAction
        title="Attribute Mapping"
        description="Attribute Mapping"
        formSlot={<div className="flex justify-between items-center gap-3">
          <FormNoActionGeneratorProvider schema={sourceSchema} defaultValues={sourceValue as z.infer<typeof sourceSchema>}>
            <FormGeneratorBody schema={sourceSchema} />
          </FormNoActionGeneratorProvider>
          <Map size="64" />
          <FormNoActionGeneratorProvider schema={targetSchema} defaultValues={{} as z.infer<typeof targetSchema>}>
            <FormGeneratorBody schema={targetSchema} />
          </FormNoActionGeneratorProvider></div>}
        formControls={<Button size="sm">Validate</Button>}
        ctaSlot={<Button size="sm"><MapIcon/></Button>}
        formProviderComponent={body => <>{body}</>}
      />;
    }
    else {
      const description = "sourceData or targetData is not configurated"
      console.warn(description)
      return <div className="flex flex-col gap-1 items-center">
        <AlertOctagonIcon className="w-8 h-8 text-destructive" />
        <span className="text-xs text-destructive">
          {description}
        </span>
      </div>
    }
  }, [data.key, sourceData, targetData]);

  const transform = `translate(${labelX}px,${labelY}px) translate(-50%, -50%)`;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {labelSlot !== undefined && (
        <EdgeLabelRenderer>
          <div
            className="!absolute !rounded !border-primary !border !bg-background !px-1 !text-foreground edge-label-renderer__custom-edge nopan "
            style={{ transform, pointerEvents: 'all' }}
            onClick={() => {
            }}
          >
            <div className="flex flex-col gap-2 p-4">
              {labelSlot}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
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