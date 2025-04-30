
import { FormGeneratorBody, FormGeneratorControls, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { z, ZodObject, ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { nodeContextSchema } from "../../config";
import { useWorkflowEditor } from "../../services";
import { WorkflowHandle as Handle } from "../handle";
import { NodeIcon } from './node-icon';
import { NodeLayout } from "./node-layout";

import { jsonSchemaToZod } from "@n8n/json-schema-to-zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import { databaseSchema } from "@vidzy/database";
import { Button } from "@/shared/ui/button";
import { ColumnsIcon, RowsIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const initSchema = z.object({})

const VisualMode = {
  row: 'row',
  column: 'column'
} as const

type VisualModeValues = keyof typeof VisualMode

type JsonMapper = Node<{ visualMode?: VisualModeValues, outputData: Record<string, any>, title: string, outputSchema: Record<string, any>, inputSchema?: Record<string, any>}, 'json-mapper'>;


export const JsonMapperNode = ({ id, data }: NodeProps<JsonMapper>) => {
  const { flowInstance } = useWorkflowEditor()

  const schema = useMemo<ZodObject<any, any, any>>(() => data?.inputSchema ? jsonSchemaToZod(data?.inputSchema) : initSchema, [data?.inputSchema])
  const defaultValues = useMemo(() => data.outputData as z.infer<typeof schema>, [data.outputData])

  const [isPending, startTransition] = useTransition();
  const [visualMode, setVisualMode] = useState(() => data.visualMode ?? "column")


  const handleToggleVisualMode = () => {
    const newMode = visualMode === 'column' ? 'row' : 'column';
    setVisualMode(newMode);
    startTransition(() => {
      flowInstance.updateNodeData(id, (node) => ({
        ...node.data,
        visualMode: newMode
      }));
    });
  };

  return <NodeLayout
    className={cn(visualMode === 'column' ? "max-w-[400px] h-full" : "w-full h-full")}
    descriptionSlot={
      <div className="flex gap-3 justify-between items-center">
        <span>
          {nodeContextSchema["json-mapper"].title}
        </span>
        <Button variant="outline" onClick={handleToggleVisualMode}>
          {visualMode === 'row' ? <RowsIcon/> : <ColumnsIcon/>}
        </Button>
      </div>
    }
    titleSlot={<NodeIcon className="w-8 h-8" nodeType="json-mapper" />}
    onRefresh={() => {
      flowInstance.updateNodeData(id, (node) => ({
        ...node.data,
        outputData: {},
      }));
    }}
    handlersSlot={<>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <NodeResizer minWidth={400} /></>}
  >
    <FormNoActionGeneratorProvider schema={schema} defaultValues={defaultValues}>
      <FormGeneratorBody mode={visualMode} schema={schema}></FormGeneratorBody>
      <FormGeneratorControls noAction onChange={v => {
        flowInstance.updateNodeData(id, (node) => ({
          ...node.data,
          outputData: v,
          outputSchema: !schema ? undefined : zodToJsonSchema(schema, {
            dateStrategy: "string", // как обрабатывать даты
            target: "jsonSchema7"
          }),
        }));
      }}  schema={schema} />
    </FormNoActionGeneratorProvider>
  </NodeLayout>
}
