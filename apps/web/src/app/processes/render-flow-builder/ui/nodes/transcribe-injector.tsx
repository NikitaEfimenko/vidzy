
import { GenerateTranscribeCTA } from "@/features/generate-transcribe/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { nodeContextSchema } from "../../config";
import { NodeIcon } from './node-icon';
import { WorkflowHandle as Handle } from "../handle";

type TranscribeInjector = Node<{ title: number }, 'number'>;

export const TranscribeInjectorNode = ({ data }: NodeProps<TranscribeInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="transcribe-injector" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["transcribe-injector"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <GenerateTranscribeCTA formOnly />
    </CardContent>
  </Card>
}
