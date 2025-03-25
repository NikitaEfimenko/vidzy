
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { GenerateSpeechCTA } from "@/features/generate-speech/ui";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";

type AudioInjector = Node<{ title: number }, 'number'>;

export const AudioInjectorNode = ({ data }: NodeProps<AudioInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    
    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="audio-injector" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["audio-injector"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <GenerateSpeechCTA formOnly />
    </CardContent>
  </Card>
}
