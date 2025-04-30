
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';

import { scenes } from "@/remotion/scenes";
import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { WorkflowHandle as Handle } from "../handle";
import { useWorkflowEditor } from "../../services";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { NodeLayout } from "./node-layout";

type Previewer = Node<{ title: number, inputSchema?: Record<string, any>, inputData?: Record<string, any>, compositionName: typeof scenes[number]["compositionName"] }, 'previewer'>;

export const PreviewerNode = ({ data, id }: NodeProps<Previewer>) => {
  const [compName, setCompositionName] = useState<typeof scenes[number]["compositionName"]>(() => {
    return data.compositionName ?? 'StoryScene'
  })
  const conf = useMemo(() => scenes.find(el => el.compositionName === compName), [compName])
  const { flowInstance } = useWorkflowEditor()

  useEffect(() => {
    flowInstance.updateNodeData(id, (node) => ({
      ...node.data,
      inputSchema: !conf?.schema ? undefined : zodToJsonSchema(conf?.schema, {
        dateStrategy: "string", // как обрабатывать даты
        target: "jsonSchema7"
      }),
      compositionName: compName
    }))
  }, [compName, flowInstance, JSON.stringify(conf?.schema)])

  return <NodeLayout
    className="min-w-[680px]"
    handlersSlot={<>
      <Handle type="target" position={Position.Left} />
      <NodeResizer minWidth={400} />
    </>}
    titleSlot={
      <Select onValueChange={v => setCompositionName(v as typeof scenes[number]["compositionName"])} defaultValue={compName}>
        <SelectTrigger>
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {scenes.map(({ compositionName }) => (
            <SelectItem value={compositionName} key={compositionName}>
              {compositionName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    }
  >
    {conf && <Playground
      {...conf}
      schema={conf.schema as typeof conf.schema}
      showSettingsFlat
      disableForm
      backgroundJob
      initInputProps={{ ...conf.initInputProps, ...(data.inputData ?? {}) as Partial<z.infer<typeof conf.schema>> }}
    />}
  </NodeLayout>
}
