
import { db } from "@/app/config/db"
import { WorkflowPlayground } from "@/app/processes/render-flow-builder/ui/playground"
import { renderWorkflows } from "@vidzy/database"
import { eq } from "drizzle-orm"

export default async function Page({
  params
}: {params: Promise<{ slug: string}>}) {

  const workflowId = (await params).slug
  const [flow] = await db.select().from(renderWorkflows).where(eq(renderWorkflows.id, workflowId)).execute()
  if (!flow) return <>not found</>
  return <WorkflowPlayground flowData={flow.flowData ?? {}} workflowId={workflowId}/>
}