
import { FormGeneratorBody, FormGeneratorControls, FormNoActionGeneratorProvider } from "@/widgets/form-generator/ui";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { nodeContextSchema } from "../../config";
import { useWorkflowEditor } from "../../services";
import { WorkflowHandle as Handle } from "../handle";
import { NodeIcon } from './node-icon';
import { NodeLayout } from "./node-layout";

import { StorySchema } from "@/remotion/scenes/story-scene";

const testSchema = StorySchema.pick({
  "audioFileName": true,
  "coverImgFileName": true,
  "subtitlesFileName": true,
  "audioWizEnabled": true,
  "format": true
})

type JsonMapper = Node<{ outputData: Record<string, any>, title: string, outputSchema: Record<string, any> }, 'number'>;


export const JsonMapperNode = ({ id, data }: NodeProps<JsonMapper>) => {
  const { flowInstance } = useWorkflowEditor()

  return <NodeLayout
    descriptionSlot={<> {nodeContextSchema["json-mapper"].title}</>}
    titleSlot={<NodeIcon className="w-8 h-8" nodeType="json-mapper" />}
    handlersSlot={<>
      <Handle type="source" position={Position.Right} />
      <NodeResizer minWidth={400} /></>}
  >
    <FormNoActionGeneratorProvider schema={testSchema} defaultValues={data.outputData as z.infer<typeof testSchema>}>
      <FormGeneratorBody schema={testSchema}></FormGeneratorBody>
      <FormGeneratorControls noAction onChange={v => {
        flowInstance.updateNodeData(id, (node) => ({
          ...node.data,
          outputData: v,
          outputSchema: !testSchema ? undefined : zodToJsonSchema(testSchema, {
            dateStrategy: "string", // как обрабатывать даты
            target: "jsonSchema7"
          }),
        }));
      }}  schema={testSchema} />
    </FormNoActionGeneratorProvider>
  </NodeLayout>
}
