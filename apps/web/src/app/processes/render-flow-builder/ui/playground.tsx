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
  Panel,
  ReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { SaveWorkflowCTA } from '@/widgets/workflow-forms/ui/update-cta';
import { LucideHelpCircle, MapIcon } from 'lucide-react';
import { nodeFactory } from '../config';
import { useWorkflowEditor } from '../services';
import { CustomNodeType } from '../types';
import { edgeTypes, nodeTypes } from './nodes';

const fitViewOptions: FitViewOptions = {
  padding: 0.1,
  includeHiddenNodes: false,
};
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: "mapper"
};
 
 
const onNodeDrag: OnNodeDrag = (_, node) => {
  // console.log('drag event', node.data);
};
 
export const WorkflowPlayground = ({
  workflowId,
  flowData
}: {
  workflowId: string,
  flowData: Record<string, any>
}) => {
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
    (connection) => {
      const { source, target } = connection;
      const nodes = service.flowInstance.getNodes(); // Получаем текущие узлы
  
      // Находим исходный узел (source)
      const sourceNode = nodes.find((node) => node.id === source);
  
      // Определяем тип ребра:
      // Если sourceNode.type === 'form-builder', то 'editable', иначе 'mapper'
      const edgeType = sourceNode?.type === "form-builder" ? 'editable' : 'mapper';
  
      const newEdge = {
        ...connection,
        type: edgeType, // Присваиваем тип
        data: {
          ...connection,
          key: crypto.randomUUID(),
        },
      };
  
      service.setEdges((eds) => addEdge(newEdge, eds));
    },
    [service],
  );

  useEffect(() => {
    if (flowData && flowData.viewport) {
      const { x = 0, y = 0, zoom = 1 } = flowData.viewport;
      service.setNodes(cb => flowData?.nodes || []);
      service.setEdges(cb => flowData?.edges || []);
      service.flowInstance.setViewport({ x, y, zoom });
    }
  }, [flowData])


  const onDragOver = (event: any) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }
  const onDrop = (event: any) => {
    event.preventDefault()
    const type: CustomNodeType = event.dataTransfer.getData("application/flow")
  
    service.setNodes(nds => nds.concat(nodeFactory({ type, position: service.flowInstance.flowToScreenPosition({ x: event.clientX, y: event.clientY })  }))) 
  }
 
  const [minimap, setMinimap] = useState(false)
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
      minZoom={0.1}
      defaultEdgeOptions={defaultEdgeOptions}
    >
      <Controls />
      <Panel position={"top-right"}>
        <Card className='bg-muted flex items-center gap-2'>
          <SaveWorkflowCTA workflowId={workflowId} />
          {/* <RestoreWorkflowCTA/> */}
          <Button variant="secondary" onClick={() => setMinimap(m => !m)} size="icon"><MapIcon/></Button>
          <Button variant="secondary"  size="icon"><LucideHelpCircle/></Button>
        </Card>
      </Panel>
      {minimap && <MiniMap />}
      <Background variant={BackgroundVariant.Dots} gap={24} size={2} />
    </ReactFlow>
  );
}


