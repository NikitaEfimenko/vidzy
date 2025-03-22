'use client'

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  type DefaultEdgeOptions,
  type FitViewOptions,
  MiniMap,
  type OnConnect,
  type OnEdgesChange,
  type OnNodeDrag,
  type OnNodesChange,
  ReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';

import { nodeFactory } from '../config';
import { useWorkflowEditor } from '../services';
import { CustomNodeType } from '../types';
import { edgeTypes, nodeTypes } from './nodes';

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
};
 
 
const onNodeDrag: OnNodeDrag = (_, node) => {
  console.log('drag event', node.data);
};
 
export const WorkflowPlayground = () => {
  const service = useWorkflowEditor()
 
 
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => service.setNodes((nds) => applyNodeChanges(changes, nds)),
    [service],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => service.setEdges((eds) => applyEdgeChanges(changes, eds)),
    [service],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => service.setEdges((eds) => addEdge({...connection}, eds)),
    [service],
  );

  const onDragOver = (event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }
  const onDrop = (event: any) => {
    event.preventDefault()
    const type: CustomNodeType = event.dataTransfer.getData("application/flow")
  
    service.setNodes(nds => nds.concat(nodeFactory({ type, position: service.flowInstance.flowToScreenPosition({ x: event.clientX, y: event.clientY })  }))) 
  }
 

  return (
    <ReactFlow
      nodes={service.state.elements}
      nodeTypes={nodeTypes}
      
      edges={service.state.edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDrag={onNodeDrag}
      onDrop={onDrop}
      onDragOver={onDragOver}
      fitView
      proOptions={{ hideAttribution: true }}
      fitViewOptions={fitViewOptions}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Controls />
      <MiniMap />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
    </ReactFlow>
  );
}


