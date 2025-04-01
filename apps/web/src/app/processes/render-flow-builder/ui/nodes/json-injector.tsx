
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { NodeResizer, Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestLLMJsonResponseCTA } from "@/features/generate-llm/ui/json";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";

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

  return <NodeLayout
    titleSlot={   <NodeIcon className="w-8 h-8" nodeType="json-injector" />}
    handlersSlot={<>
     <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />
    <NodeResizer/>
    </>}
    descriptionSlot={<>   {nodeContextSchema["json-injector"].title}</>}
  >
     <RequestLLMJsonResponseCTA formOnly schema={testSchema} />
  </NodeLayout>
}
