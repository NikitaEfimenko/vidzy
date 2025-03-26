import { auth } from "@/app/config/auth";
import { db } from "@/app/config/db";
import { Card, CardContent } from "@/shared/ui/card";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import { CreateWorkflowCTA } from "@/widgets/workflow-forms/ui/create-cta";
import { WorkflowsList } from "@/widgets/workflows-list/ui/workflows-list";
import { renderWorkflows, workflowAccess } from "@vidzy/database";
import { and, eq, exists, or } from "drizzle-orm";
import { Suspense } from "react";

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

export default async function Page({
  params
}: {params: Promise<{ slug: string}>}) {
  const session = await auth()
  const { slug } = await params
  if (!session?.user.id) return <></>

  return <section className="flex flex-col gap-2">
    <ScrollArea className="h-full w-full whitespace-nowrap overflow-auto rounded-md">
      <div className="flex w-h-full space-x-3 overflow-auto">
        <Card className="bg-accent p-3 w-full flex flex-col item-center justify-center">
          <CardContent className="flex flex-col items-center p-0">
            <CreateWorkflowCTA workflowListPromise={getWorkflows(session.user.id)} />
          </CardContent>
        </Card>
      </div>
      <Separator className="my-3" />
      <div className="px-3 flex flex-col gap-3">
        <Suspense fallback={<Skeleton className="w-full rounded-lg h-96"/>}>
          <WorkflowsList selected={slug} />
        </Suspense>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  </section>
}