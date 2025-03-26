
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormGeneratorBody, FormGeneratorControls, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { z } from "zod";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeIcon } from './node-icon';
import { useWorkflowEditor } from "../../services";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import zodToJsonSchema from "zod-to-json-schema";

type JsonMapper = Node<{ outputData: Record<string, any>, title: string, outputSchema: Record<string, any> }, 'number'>;

const testSchema = z.object({
  number: z.number(),
})

export const JsonMapperNode = ({ id, data }: NodeProps<JsonMapper>) => {
  const { flowInstance } = useWorkflowEditor()


  return <Card className="bg-accent relative border min-w-[400px] px-0">
    {/* <Handle type="target" position={Position.Left} /> */}
    <Handle type="source" position={Position.Right} />
    <NodeResizer minWidth={400} />
    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="json-mapper" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["json-mapper"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <FormNoActionGeneratorProvider schema={testSchema} defaultValues={{} as z.infer<typeof testSchema>}>
        <FormGeneratorBody schema={testSchema}></FormGeneratorBody>
        <FormGeneratorControls noAction onChange={v => {
          console.log("onresult")
          flowInstance.updateNodeData(id, (node) => ({
            ...node.data,
            outputData: v,
            outputSchema: !testSchema ? undefined : zodToJsonSchema(testSchema, {
              dateStrategy: "string", // как обрабатывать даты
              target: "jsonSchema7"
            }),
          }));
        }} schema={testSchema} />
      </FormNoActionGeneratorProvider>
    </CardContent>
  </Card>
}
