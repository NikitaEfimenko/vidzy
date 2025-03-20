import type { ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DnDWrapperProps {
  children: ReactNode;
}

export const DnDWrapper = ({ children }: DnDWrapperProps) => {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};