
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


type Previewer = Node<{ title: number, inputSchema?: Record<string, any>, inputData?: Record<string, any>, compositionName: typeof scenes[number]["compositionName"] }, 'previewer'>;

export const PreviewerNode = ({ data, id }: NodeProps<Previewer>) => {
  const [compName, setCompositionName] = useState<typeof scenes[number]["compositionName"]>('PhysicsPreviewScene')
  const conf = useMemo(() => scenes.find(el => el.compositionName === compName), [compName])
  const { flowInstance } = useWorkflowEditor()
  console.log(data, "is preview data")
  useEffect(() => {
    flowInstance.updateNodeData(id, (node) => ({
      ...node.data,
      inputSchema: !conf?.schema ? undefined : zodToJsonSchema(conf?.schema, {
        dateStrategy: "string", // как обрабатывать даты
        target: "jsonSchema7"
      }),
      compositionName: compName
    }))
  }, [compName, flowInstance, conf?.schema])

  return <Card className="bg-accent relative border px-0">
    <Handle type="target" position={Position.Left} />
    {/* <Handle type="source" position={Position.Right} /> */}
    <NodeResizer minWidth={400} />
    <CardHeader>
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
    </CardHeader>
    <CardContent>

      {conf && <Playground
        {...conf}
        schema={conf.schema as typeof conf.schema}
        showSettingsFlat
        initInputProps={{...conf.initInputProps, ...(data.inputData ?? {}) as Partial<z.infer<typeof conf.schema>>}}
      />}
    </CardContent>
  </Card>
}
