import { auth } from "@/app/config/auth";
import { db } from "@/app/config/db";
import { Card, CardContent } from "@/shared/ui/card";
import { CreateWorkflowCTA } from "@/widgets/workflow-forms/ui/create-cta";
import { renderWorkflows, workflowAccess } from "@vidzy/database";
import { and, eq, exists, or } from "drizzle-orm";
import { redirect } from "next/navigation";

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

export default async function Page() {
  const session = await auth()
  if (!session?.user.id) return <></>

  const workflows = await getWorkflows(session.user.id)
  const workflow = workflows.at(0)
  if (workflow) {
    redirect(`/visual-renderer/${workflow.id}`)
  }

  return <section className="flex flex-col gap-2">
    <Card className="bg-accent p-3 w-full flex flex-col item-center justify-center">
      <CardContent className="flex flex-col items-center p-0">
        <CreateWorkflowCTA />
      </CardContent>
    </Card>
  </section>
}