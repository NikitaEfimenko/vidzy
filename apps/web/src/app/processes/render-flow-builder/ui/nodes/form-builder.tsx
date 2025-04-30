
import { scenes } from "@/remotion/scenes";
import { CompositorSchema } from "@/remotion/scenes/compositor-scene";
import { CubesSceneSchema } from "@/remotion/scenes/cubes-physics";
import { QuizSchema } from "@/remotion/scenes/quiz-scene";
import { StorySchema } from "@/remotion/scenes/story-scene";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ZodFormBuilder } from "@/widgets/form-builder/ui/builder";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { useMemo, useState } from "react";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { nodeContextSchema } from "../../config";
import { useWorkflowEditor } from "../../services";
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";
import { DialogSchema } from "@/remotion/scenes/dialog-scene";
import { QuestSchema } from "@/remotion/scenes/quest-scene";

type FormBuilder = Node<{
  schemaMode: typeof scenes[number]["compositionName"] | 'Custom',
  outputData: Record<string, any>,
  title: string,
  outputSchema: Record<string, any>
}, 'form_builder'>;

export const FormBuilder = ({ id, data }: NodeProps<FormBuilder>) => {
  const { flowInstance } = useWorkflowEditor()
  const [schemaMode, setSchemaMode] = useState<typeof scenes[number]["compositionName"] | 'Custom'>(() => {
    return data.schemaMode ?? 'Custom'
  })

  const inputSchema = useMemo(() => {
    switch (schemaMode) {
      case "CompositorScene": return CompositorSchema.pick({
        "audioFileName": true,
        "videos": true,
        "format": true,
        "audioVolume": true,
        "subtitlesUrl": true,
      })
      case "DialogScene": return DialogSchema.pick({
        "dialog": true,
        "format": true,
        "captionType": true
      })
      case "QuestScene": return QuestSchema.pick({
        "answers": true,
        "coverImgFileName": true,
        "questions": true,
        "format": true,
        "options": true,
        "timeToRespond": true
      })
      case "PhysicsPreviewScene": return CubesSceneSchema
      case "QuizScene": return QuizSchema
      case "StoryScene": return StorySchema.pick({
        "audioFileName": true,
        "coverImgFileName": true,
        "subtitlesFileName": true,
        "audioWizEnabled": true,
        "format": true,
        "captionType": true
      })
      default: z.object({})
    }
  }, [schemaMode])

  const [schema, setSchema] = useState<any>()
  const [schemaDescription, setSchemaDescription] = useState<any>(null)

  const handleSchemaDone = (generatedSchema: any) => {
    setSchema(generatedSchema)
  }

  const handleSchemaDescriptionDone = (description: any) => {
    setSchemaDescription(description)
  }

  return <NodeLayout
    descriptionSlot={<> {nodeContextSchema["form-builder"].title}</>}
    handlersSlot={<>
      <Handle type="source" position={Position.Right} />
      <NodeResizer minWidth={400} /></>}

    titleSlot={
      <Select onValueChange={v => setSchemaMode(v as typeof scenes[number]["compositionName"])} defaultValue={schemaMode}>
        <SelectTrigger>
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {scenes.map(({ compositionName }) => (
            <SelectItem value={compositionName} key={compositionName}>
              {compositionName}
            </SelectItem>
          ))}
            <SelectItem value="Custom" key="Custom">
              Custom
            </SelectItem>
        </SelectContent>
      </Select>
    }
  >
    <>
    <ZodFormBuilder
      inputSchema={inputSchema}
      onSchemaDone={handleSchemaDone}
      onSchemaDescriptionDone={handleSchemaDescriptionDone}
      />
    <Button onClick={() => {
      const currentSchema = inputSchema
      const output = !currentSchema ? undefined : zodToJsonSchema(currentSchema, {
        dateStrategy: "string", // как обрабатывать даты
        target: "jsonSchema7"
      })
      flowInstance.updateNodeData(id, (node) => ({
        ...node.data,
        outputSchema: output,
        schemaMode: schemaMode
      }));
    }}>Update</Button>
    </>
  </NodeLayout>
}
