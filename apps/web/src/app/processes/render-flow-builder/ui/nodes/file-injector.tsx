
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { Node, NodeProps } from '@xyflow/react';
import { Position } from '@xyflow/react';
import { DotIcon } from 'lucide-react';
import { NodeIcon } from './node-icon';
import { AttachmentUploadCTA } from "@/widgets/attachment-forms/ui/upload-cta";
import { nodeContextSchema } from "../../config";
import { WorkflowHandle as Handle } from "../handle";
import { NodeLayout } from "./node-layout";

type FileInjector = Node<{ title: number }, 'number'>;

export const FileInjectorNode = ({ data }: NodeProps<FileInjector>) => {

  return <NodeLayout
    handlersSlot={<>
     <Handle type="source" position={Position.Right} />
    </>}
    titleSlot={ <NodeIcon className="w-8 h-8" nodeType="file-injector" />}
    descriptionSlot={<> {nodeContextSchema["file-injector"].title}</>}
  >
     <AttachmentUploadCTA disableSlot isPublic={false} />
  </NodeLayout>
}
