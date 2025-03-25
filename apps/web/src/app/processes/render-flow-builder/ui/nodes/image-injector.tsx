
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestAIImageCTA } from "@/features/generate-image";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";

type ImageInjector = Node<{ title: number }, 'number'>;

export const ImageInjectorNode = ({ data }: NodeProps<ImageInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />

    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="image-injector" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["image-injector"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <RequestAIImageCTA formOnly />
    </CardContent>
  </Card>
}
