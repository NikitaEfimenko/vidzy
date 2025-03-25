
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormGeneratorBody, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { z } from "zod";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeIcon } from './node-icon';

type JsonMapper = Node<{ title: number }, 'number'>;

const testSchema = z.object({
  title: z.string(),
  listElems: z.array(z
    .string()),
  options: z.array(z.array(z.string()).min(0)).min(0),
})

export const JsonMapperNode = ({ data }: NodeProps<JsonMapper>) => {
  return <Card className="bg-accent relative border min-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeResizer minWidth={400}/>
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
      </FormNoActionGeneratorProvider>

    </CardContent>
  </Card>
}
