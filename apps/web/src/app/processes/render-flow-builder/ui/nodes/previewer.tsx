
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';

import { scenes } from "@/remotion/scenes";
import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { WorkflowHandle as Handle } from "../handle";

type Previewer = Node<{ title: number }, 'number'>;

export const PreviewerNode = ({ data }: NodeProps<Previewer>) => {
  const [compName, setCompositionName] = useState<typeof scenes[number]["compositionName"]>('QuizScene')
  const conf = useMemo(() => scenes.find(el => el.compositionName === compName), [compName])
  return <Card className="bg-accent relative border px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeResizer minWidth={400}/>
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
      />}
      </CardContent>
  </Card>
}
