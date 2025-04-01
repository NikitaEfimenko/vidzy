
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { GenerateSpeechCTA } from "@/features/generate-speech/ui";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";

type AudioInjector = Node<{ title: number }, 'number'>;

export const AudioInjectorNode = ({ data }: NodeProps<AudioInjector>) => {

  return <NodeLayout
    handlersSlot={<>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>}
    titleSlot={<NodeIcon className="w-8 h-8" nodeType="audio-injector" />}
    descriptionSlot={<>     {nodeContextSchema["audio-injector"].title}</>}
  >
    <GenerateSpeechCTA formOnly />
  </NodeLayout>
}
