import type { Node, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { NodeIcon } from './node-icon';

type AnnotationNodeType = Node<{ step: number, label: string }, 'annotation'>;

export const AnnotationNode = memo(({ data }: NodeProps<AnnotationNodeType>) => {
  return (
    <div>
      <NodeIcon nodeType="annotation"></NodeIcon>
      <div className={"absolute shadow-none font-mono text-left bg-transparent border-none"}>
        <div className='annotation-level'>{data.step ?? 1}.</div>
        <div>{data.label ?? "Описание"}</div>
      </div>
    </div>
  );
})
