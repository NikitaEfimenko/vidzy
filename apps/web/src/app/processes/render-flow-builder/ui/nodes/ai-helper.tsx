
import { RequestLLMChatResponseCTA } from "@/features/generate-llm/ui/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { nodeContextSchema } from "../../config";
import { NodeIcon } from './node-icon';
import { WorkflowHandle } from "../handle";

type AIHelper = Node<{ title: number }, 'number'>;

export const AIHelperNode = ({ data }: NodeProps<AIHelper>) => {
  return <Card className="bg-accent relative border max-w-[400px]">
    {/* <WorkflowHandle type="target" position={Position.Left} /> */}
    {/* <WorkflowHandle type="source" position={Position.Right} /> */}
    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="ai-helper" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["ai-helper"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <RequestLLMChatResponseCTA formOnly />
    </CardContent>
  </Card>
}
