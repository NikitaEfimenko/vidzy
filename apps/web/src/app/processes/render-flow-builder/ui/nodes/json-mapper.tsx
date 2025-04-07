
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
import { useMemo } from "react";
import { databaseSchema } from "@vidzy/database";

const initSchema = z.object({})

type JsonMapper = Node<{ outputData: Record<string, any>, title: string, outputSchema: Record<string, any>, inputSchema?: Record<string, any>}, 'json-mapper'>;


export const JsonMapperNode = ({ id, data }: NodeProps<JsonMapper>) => {
  const { flowInstance } = useWorkflowEditor()

  const schema = useMemo<ZodObject<any, any, any>>(() => data?.inputSchema ? jsonSchemaToZod(data?.inputSchema) : initSchema, [data?.inputSchema])
  const defaultValues = useMemo(() => data.outputData as z.infer<typeof schema>, [data.outputData])

  return <NodeLayout
    descriptionSlot={<> {nodeContextSchema["json-mapper"].title}</>}
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
      <FormGeneratorBody schema={schema}></FormGeneratorBody>
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
