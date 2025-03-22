
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { FormAction } from "@/shared/ui/form-action";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { FormGeneratorBody, FormGeneratorProvider, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import { z } from "zod";

type JsonMapper = Node<{ title: number }, 'number'>;

const testSchema = z.object({
  title: z.string(),
  listElems: z.array(z
    .string()),
  options: z.array(z.array(z.string()).min(0)).min(0),
})

export const JsonMapperNode = ({ data }: NodeProps<JsonMapper>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeIcon nodeType="file-injector"/>

    <FormNoActionGeneratorProvider schema={testSchema} defaultValues={{} as z.infer<typeof testSchema>}>
      <FormGeneratorBody schema={testSchema}></FormGeneratorBody>
    </FormNoActionGeneratorProvider>
  </Card>
}
