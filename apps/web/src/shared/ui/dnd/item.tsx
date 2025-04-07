import type { CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DnDItemProps {
  renderItem: (dragRef: React.RefObject<HTMLDivElement>) => ReactNode
  index: string
  onMove: (sourceIdx: string, targetIdx: string) => void
}

export const DnDItem = ({ renderItem, index, onMove }: DnDItemProps) => {
  const dragRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const [{ opacity }, drag] = useDrag(() => ({
    type: "box",
    item: { index },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.4 : 1,
    }),
  }))

  const [, drop] = useDrop({
    accept: "box",
    hover: (item: { index: string }, monitor) => {
      if (!previewRef.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = previewRef.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      onMove(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(dragRef)
  drop(previewRef)

  const style: CSSProperties = {
    opacity,
    userSelect: "none",
    width: "100%",
  }

  return (
    <div ref={previewRef} style={style}>
      {renderItem(dragRef)}
    </div>
  )
}