
'use client'
import { createWorkflowInvite } from "@/entities/workflow/api/actions";
import { WorkflowModelType } from "@/entities/workflow/dto/model";
import { Button } from "@/shared/ui/button";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { ShareIcon } from "lucide-react";
import { ReactElement, Suspense } from "react";
import { z } from "zod";

export const ShareWorkflowCTA = async ({
  workflowId,
  slot
}: {
  workflowId: WorkflowModelType["id"],
  slot?: ReactElement
}) => {

  return <FormGeneratorCTA
    serverAction={createWorkflowInvite.bind(null, workflowId)}
    schema={z.object({})}
    defaultValues={null}
    formStateSlot={slot}
    ctaSlot={<Button variant="ghost" size="sm"><ShareIcon />Share</Button>}
  />
}
