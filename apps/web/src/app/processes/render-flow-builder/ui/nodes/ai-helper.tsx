
import { RequestLLMChatResponseCTA } from "@/features/generate-llm/ui/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { nodeContextSchema } from "../../config";
import { NodeIcon } from './node-icon';
import { WorkflowHandle } from "../handle";
import { NodeLayout } from "./node-layout";

type AIHelper = Node<{ title: number }, 'number'>;

export const AIHelperNode = ({ data }: NodeProps<AIHelper>) => {

  return <NodeLayout
    titleSlot={ <NodeIcon className="w-8 h-8" nodeType="ai-helper" />}
    descriptionSlot={<>{nodeContextSchema["ai-helper"].title}</>}
  >
    <RequestLLMChatResponseCTA formOnly />
  </NodeLayout>
}
