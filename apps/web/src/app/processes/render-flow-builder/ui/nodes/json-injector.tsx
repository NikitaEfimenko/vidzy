
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestLLMJsonResponseCTA } from "@/features/generate-llm/ui/json";

type JsonInjector = Node<{ title: number }, 'number'>;

export const JsonInjectorNode = ({ data }: NodeProps<JsonInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeIcon nodeType="file-injector" />
    <RequestLLMJsonResponseCTA formOnly schema={{
      questions: [
        "questions.{number} is quiz question",
      ],
      explanations: [
        "explanations of correct answers",
      ],
      options: [
        ["options.{number} - is list of variants of answers for questions.{number}"],
      ],
      correctAnswers: ["correctAnswers.{number} is index of correct answers"],
    }} />
  </Card>
}
