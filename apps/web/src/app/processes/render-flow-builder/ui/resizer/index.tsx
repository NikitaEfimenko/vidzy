import { NodeResizeControl } from '@xyflow/react';
import { memo } from 'react';
import { IoIosResize } from "react-icons/io";
const controlStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
};


export const Resizer = memo(() => {
  return (
    <NodeResizeControl style={controlStyle}>
      <IoIosResize />
    </NodeResizeControl>
  );
});
