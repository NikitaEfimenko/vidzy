import { auth } from "@/app/config/auth"
import { db } from "@/app/config/db"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { RemoveWorkflowCTA } from "@/widgets/workflow-forms/ui/delete-cta"
import { ShareWorkflowCTA } from "@/widgets/workflow-forms/ui/shared-workflow-cta"
import { SaveWorkflowCTA } from "@/widgets/workflow-forms/ui/update-cta"
import { renderWorkflows, workflowAccess } from "@vidzy/database"
import { and, eq, exists, or } from "drizzle-orm"
import Link from "next/link"
import { Suspense } from "react"
import { SharingLinksList } from "./share-links-list"

const getWorkflows = async (userId: string) => {
  return db
    .select()
    .from(renderWorkflows)
    .where(
      or(
        eq(renderWorkflows.authorId, userId),
        eq(renderWorkflows.public, true),
        exists(
          db
            .select()
            .from(workflowAccess)
            .where(
              and(
                eq(workflowAccess.workflowId, renderWorkflows.id),
                eq(workflowAccess.userId, userId)
              )
            )
        )
      )
    ).execute()
}

export const WorkflowsList = async ({
  selected
}: { selected?: string }) => {
  const session = await auth()
  if (!session?.user.id) return <></>

  const workflows = await getWorkflows(session?.user.id)

  return <>
    {workflows.map(workflow => <Card id={workflow.id} className={cn("relative h-36 flex flex-col items-center justify-center", selected === workflow.id && "border-primary")}>
      <CardHeader>
        <Link id={workflow.id} href={`/visual-renderer/${workflow.id}`}>
          <Button variant="link">
            <CardTitle className="text-lg">{workflow.title}</CardTitle>
          </Button>
        </Link>
      </CardHeader>
      <div className="absolute z-10 flex items-center gap-2 bottom-0 left-0">
        <SaveWorkflowCTA workflowId={workflow.id} />
        <RemoveWorkflowCTA id={workflow.id} />
      </div>
      <div className="absolute z-10 flex items-center gap-2 top-0 left-0">
        <ShareWorkflowCTA slot={
          <Suspense fallback={<p>loading...</p>}>
            {workflow.id ? <SharingLinksList workflowId={workflow.id} /> : <></>}
          </Suspense>
        } workflowId={workflow.id} />
      </div>
    </Card>)}
  </>
}