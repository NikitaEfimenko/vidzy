import {
  type EdgeTypes,
  type NodeTypes
} from '@xyflow/react';

import { AnnotationNode } from './annotation';
import { AudioInjectorNode } from './audio-injector';
import { ImageInjectorNode } from './image-injector';
import { FileInjectorNode } from './file-injector';
import { JsonInjectorNode } from './json-injector';
import { JsonMapperNode } from './json-mapper';
import { PreviewerNode } from './previewer';
import { TranscribeInjectorNode } from './transcribe-injector';
import { CustomNodeType } from '../../types';
import { EditableEdge } from '../edges/editable';
import { AIHelperNode } from './ai-helper';

export const nodeTypes: NodeTypes = {
  'annotation': AnnotationNode,
  "audio-injector": AudioInjectorNode,
  "image-injector": ImageInjectorNode,
  "file-injector": FileInjectorNode,
  "json-injector": JsonInjectorNode,
  "json-mapper": JsonMapperNode,
  "previewer": PreviewerNode,
  "transcribe-injector": TranscribeInjectorNode,
  "ai-helper": AIHelperNode,
} satisfies Record<CustomNodeType, NodeTypes[keyof NodeTypes]>;

export const edgeTypes: EdgeTypes = {
  "editable": EditableEdge
}