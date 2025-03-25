import type { Node, NodeProps } from '@xyflow/react';
import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useUpdateNodeInternals, useReactFlow, NodeResizer, NodeResizeControl, Position } from '@xyflow/react';
import { useWorkflowEditor } from '../../services';

type AnnotationNodeType = Node<{
  title: string;
  color?: string;
  width?: number;
  height?: number;
}, 'annotation'>;

const DEFAULT_TEXT = "Lorem ipsum dolor sit amet...";

export const AnnotationNode = memo(({ 
  id, 
  data, 
  selected,
  width: initialWidth = 400,
  height: initialHeight = 400
}: NodeProps<AnnotationNodeType>) => {
  const { flowInstance } = useWorkflowEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(data.title || DEFAULT_TEXT);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Синхронизация при изменении data.title
  useEffect(() => {
    setLocalTitle(data.title || DEFAULT_TEXT);
  }, [data.title]);

  // Автоматическая высота textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localTitle, isEditing]);

  const saveChanges = useCallback(() => {
    const newTitle = localTitle.trim() || DEFAULT_TEXT;
    console.log(newTitle)
    flowInstance.updateNode(id, {
      data: {
        ...data,
        title: newTitle,
      },
      width: dimensions.width,
      height: dimensions.height
    });
    setIsEditing(false);
  }, [id, data, localTitle, dimensions, flowInstance.updateNode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      setLocalTitle(data.title || DEFAULT_TEXT);
      setIsEditing(false);
    }
  }, [saveChanges, data.title]);

  const handleResize = useCallback((width: number, height: number) => {
    setDimensions({ width, height });
    flowInstance.updateNode(id, {
      data: {
        ...data,
      },
      width,
      height
    });
  }, [id, data, flowInstance.updateNode]);

  return (
    <div 
      className={`
        relative p-4 rounded-lg shadow-md
        ${selected ? 'ring-2 ring-blue-400' : ''}
        ${data.color || 'bg-yellow-100'}
        transition-colors duration-200
        flex items-center justify-center
      `}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height 
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <NodeResizer 
        minWidth={150}
        minHeight={100}
        onResize={(_, { width, height }) => handleResize(width, height)}
        isVisible={selected}
        keepAspectRatio={false}
      />
      
      {isEditing ? (
        <textarea
          ref={textareaRef}
          autoFocus
          className={`
            w-full h-full bg-transparent border-none 
            focus:outline-none resize-none
            font-sans text-sm p-2
            ${data.color ? 'text-gray-800' : 'text-gray-700'}
          `}
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={saveChanges}
          onKeyDown={handleKeyDown}
          placeholder="Введите текст..."
        />
      ) : (
        <div 
          className={`
            w-full h-full overflow-auto
            whitespace-pre-wrap break-words
            font-sans text-sm cursor-text
            ${data.color ? 'text-gray-800' : 'text-gray-700'}
          `}
        >
          {localTitle}
        </div>
      )}
    </div>
  );
});

AnnotationNode.displayName = 'AnnotationNode';