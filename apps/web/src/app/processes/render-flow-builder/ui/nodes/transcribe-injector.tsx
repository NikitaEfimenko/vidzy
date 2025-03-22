
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { GenerateTranscribeCTA } from "@/features/generate-transcribe/ui";

type TranscribeInjector = Node<{ title: number }, 'number'>;
 
export const TranscribeInjectorNode = ({ data }: NodeProps<TranscribeInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeIcon nodeType="file-injector"/>
    <GenerateTranscribeCTA formOnly/>
  </Card>
}
