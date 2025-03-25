'use client'
import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { DialogClose } from "@/shared/ui/dialog"
import { FormAction } from "@/shared/ui/form-action"
import { Trash2Icon } from "lucide-react"
import * as RemoveForm from "./delete-form"
import { WorkflowModelType } from "@/entities/workflow/dto/model"

type RemoveWorkflowCTAProps = {
  id: WorkflowModelType["id"]
}

export const RemoveWorkflowCTA = ({
  id
}: RemoveWorkflowCTAProps) => {

  return <FormAction
    ctaSlot={<Button size="icon" variant="ghost">
      <Trash2Icon size={14} />
    </Button>}
    title="Удалить?"
    description="Удалить вложение"
    formControls={<div className="flex gap-2">
      <DialogClose>
        <RemoveForm.RemoveWorkflowFormControls />
      </DialogClose>
      <DialogClose>
        <Button type="button">Close</Button>
      </DialogClose>
    </div>}
    formSlot={<></>}
    formProviderComponent={body => <RemoveForm.RemoveWorkflowFormProvider id={id}>{body}</RemoveForm.RemoveWorkflowFormProvider>}
  />
}