
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { RequestAIImageCTA } from "@/features/generate-image";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";

type ImageInjector = Node<{ title: number }, 'number'>;

export const ImageInjectorNode = ({ data }: NodeProps<ImageInjector>) => {

  return <NodeLayout
    handlersSlot={<>
     <Handle type="target" position={Position.Left} />
     <Handle type="source" position={Position.Right} />
    </>}
    titleSlot={  <NodeIcon className="w-8 h-8" nodeType="image-injector" />}
    descriptionSlot={<> {nodeContextSchema["image-injector"].title}</>}
  >
     <RequestAIImageCTA formOnly />
  </NodeLayout>
}
