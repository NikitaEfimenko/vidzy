
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestLLMJsonResponseCTA } from "@/features/generate-llm/ui/json";
import { RequestLLMChatResponseCTA } from "@/features/generate-llm/ui/chat";

type AIHelper = Node<{ title: number }, 'number'>;

export const AIHelperNode = ({ data }: NodeProps<AIHelper>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeIcon nodeType="ai-helper" />
    <RequestLLMChatResponseCTA formOnly/>
  </Card>
}
