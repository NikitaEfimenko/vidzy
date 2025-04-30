
import { GenerateTranscribeCTA } from "@/features/generate-transcribe/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { nodeContextSchema } from "../../config";
import { NodeIcon } from './node-icon';
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";

type TranscribeInjector = Node<{ title: number }, 'number'>;

export const TranscribeInjectorNode = ({ data }: NodeProps<TranscribeInjector>) => {
  return <NodeLayout
    titleSlot={ <NodeIcon className="w-8 h-8" nodeType="transcribe-injector" />}
    descriptionSlot={<>{nodeContextSchema["transcribe-injector"].title}</>}
    handlersSlot={<>
     <Handle type="target" position={Position.Left} />
     <Handle type="source" position={Position.Right} /></>}
  >
     <GenerateTranscribeCTA backgroundJob formOnly />
  </NodeLayout>
}
