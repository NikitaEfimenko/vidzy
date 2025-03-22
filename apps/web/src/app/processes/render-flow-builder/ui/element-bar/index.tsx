

import { useWorkflowEditor } from "../../services"
import { cn } from "@/shared/lib/utils"
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area"
import { nodeTypes } from "../nodes"
import { NodeIcon } from "../nodes/node-icon"
import { MdDragIndicator } from "react-icons/md"
import { CustomNodeType } from "../../types"

type WorkflowElementBarProps = {
}

export const WorkflowElementBar = ({ }: WorkflowElementBarProps) => {
  const service = useWorkflowEditor()

  return <ScrollArea className="w-full h-full whitespace-nowrap m-auto rounded-md">
    <div className="flex h-full w-max items-center gap-4 px-4 mx-auto">
      <div className="flex flex-col gap-4 justify-center pt-2 items-center">
        {Object.keys(nodeTypes).map((type) => <div onDragStart={(e) => {
          e.dataTransfer.setData("application/flow", type)
          e.dataTransfer.effectAllowed = "move"
        }} draggable key={type} className="p-2 bg-accent rounded-md border relative">
          <MdDragIndicator className={cn("w-4 h-4 ring-primary rounded-full absolute bg-background -left-2 -bottom-0 z-10")} />
          <NodeIcon nodeType={type as CustomNodeType} className={cn("rounded-md")} />
        </div>)}
      </div>
    </div>
    <ScrollBar orientation="vertical" />
  </ScrollArea>
}