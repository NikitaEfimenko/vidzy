
import { Card, CardHeader } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { NodeIcon } from './node-icon';

import { scenes } from "@/remotion/scenes";
import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

type Previewer = Node<{ title: number }, 'number'>;

export const PreviewerNode = ({ data }: NodeProps<Previewer>) => {
  const [compName, setCompositionName] = useState<typeof scenes[number]["compositionName"]>('QuizScene')
  const conf = useMemo(() => scenes.find(el => el.compositionName === compName), [compName])
  return <Card className="bg-accent w-96 relative border px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
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
    {conf && <Playground
      {...conf}
      schema={conf.schema as typeof conf.schema}
    />}
  </Card>
}
