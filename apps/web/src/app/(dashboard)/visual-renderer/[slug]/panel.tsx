
"use client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/ui/resizable"
import { TooltipProvider } from "@/shared/ui/tooltip"
import React, { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

interface WorkflowPanelProps {
  defaultLayout: number[] | undefined[]
  defaultCollapsed?: boolean
  navCollapsedSize: number

  navSlot: ReactNode,
  editorSlot: ReactNode,
  toolsSlot: ReactNode,
}

export const WorkflowPanel = ({
  defaultLayout = [15, 75, 10],
  defaultCollapsed = false,
  navCollapsedSize,
  navSlot,
  editorSlot,
  toolsSlot
}: WorkflowPanelProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return <TooltipProvider delayDuration={0}>
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        console.log(sizes)
        document.cookie = `react-resizable-panels-workflows:layout=${JSON.stringify(
          sizes
        )}`
      }}
      className="h-full max-h-screen items-stretch flex-auto"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        minSize={15}
        onCollapse={() => {
          setIsCollapsed(true)
          document.cookie = `react-resizable-panels-workflows:collapsed=${JSON.stringify(true)}`
        }}
        onExpand={() => {
          setIsCollapsed(false)
          document.cookie = `react-resizable-panels-workflows:collapsed=${JSON.stringify(false)}`
        }}
        className={cn("flex flex-col", isCollapsed && "transition-all duration-300 ease-in-out")}
      >
        {navSlot}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]}>
        {editorSlot}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel minSize={10} defaultSize={defaultLayout[2]}>
        {toolsSlot}
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
}