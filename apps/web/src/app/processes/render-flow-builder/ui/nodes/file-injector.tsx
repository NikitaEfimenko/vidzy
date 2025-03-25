
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { AttachmentUploadCTA } from "@/widgets/attachment-forms/ui/upload-cta";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";

type FileInjector = Node<{ title: number }, 'number'>;

export const FileInjectorNode = ({ data }: NodeProps<FileInjector>) => {
  return <Card className="bg-accent relative border max-w-[400px] px-0">
    <Handle type="target" position={Position.Left} />
    <Handle type="source" position={Position.Right} />

    <CardHeader>
      <CardTitle>
        <NodeIcon className="w-8 h-8" nodeType="file-injector" />
      </CardTitle>
      <CardDescription>
        {nodeContextSchema["file-injector"].title}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <AttachmentUploadCTA disableSlot isPublic={false} />

    </CardContent>
  </Card>
}
