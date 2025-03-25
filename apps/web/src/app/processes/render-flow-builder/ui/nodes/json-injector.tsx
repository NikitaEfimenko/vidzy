
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestLLMJsonResponseCTA } from "@/features/generate-llm/ui/json";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";

type JsonInjector = Node<{ title: number }, 'number'>;

const testSchema = {
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
}

export const JsonInjectorNode = ({ data }: NodeProps<JsonInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeResizer/>
    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="json-injector" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["json-injector"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <RequestLLMJsonResponseCTA formOnly schema={testSchema} />
    </CardContent>
  </Card>
}
