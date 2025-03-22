import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers"
import { WorkflowPanel } from "./panel";
import { ReactElement, ReactNode } from "react";
import { auth } from "@/app/config/auth";
import { ReactFlowProvider } from "@xyflow/react";

export default async function EditorLayout({
  nav,
  editor,
  tools
}: {
  nav: ReactElement,
  editor: ReactElement,
  tools: ReactElement
}) {
  noStore();

  const layout = cookies().get("react-resizable-panels-workflows:layout")
  const collapsed = cookies().get("react-resizable-panels-workflows:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  const session = await auth()
  if (!session) {
    return <></>
  }

  return <div className="hidden flex-col md:flex flex-auto h-full w-full">
    <ReactFlowProvider>
      <WorkflowPanel
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
        navSlot={nav}
        editorSlot={editor}
        toolsSlot={tools}
      />
    </ReactFlowProvider>
  </div>
}