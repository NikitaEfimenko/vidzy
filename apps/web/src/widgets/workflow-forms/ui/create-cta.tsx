'use client'
import { WorkflowModelType } from "@/entities/workflow/dto/model"
import { Button } from "@/shared/ui/button"
import { FormAction } from "@/shared/ui/form-action"
import { PlusIcon } from "lucide-react"
import { ReactElement } from "react"
import * as CreateForm from "./create-form"

type CreateWorkflowCTAProps = {
  ctaSlot?: ReactElement,
  disableSlot?: boolean,
  workflowListPromise?: Promise<WorkflowModelType[]>
}

export const CreateWorkflowCTA = ({
  disableSlot = false,
  workflowListPromise,
  ctaSlot = <Button size="sm"><PlusIcon></PlusIcon>Add workflow</Button>
}: CreateWorkflowCTAProps) => <FormAction
    title="Add workflow"
    description="Add workflow"
    ctaSlot={disableSlot ? undefined : ctaSlot}
    formSlot={<CreateForm.CreateWorkflowFormBody workflowListPromise={workflowListPromise} />}
    formControls={<CreateForm.CreateWorkflowFormControls />}
    formProviderComponent={(body) => <CreateForm.CreateWorkflowFormProvider defaultValues={{}}
    >
      {body}
    </CreateForm.CreateWorkflowFormProvider>}
  />