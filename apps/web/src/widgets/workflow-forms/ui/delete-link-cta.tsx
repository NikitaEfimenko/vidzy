'use client'
import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { DialogClose } from "@/shared/ui/dialog"
import { FormAction } from "@/shared/ui/form-action"
import { Trash2Icon } from "lucide-react"
import * as RemoveForm from "./delete-link-form"
import { WorkflowInviteLinksModelType, WorkflowModelType } from "@/entities/workflow/dto/model"

type RemoveLinkCTAProps = {
  id: WorkflowInviteLinksModelType["id"]
}

export const RemoveLinkCTA = ({
  id
}: RemoveLinkCTAProps) => {

  return <FormAction
    ctaSlot={<Button size="icon" variant="ghost">
      <Trash2Icon size={14} />
    </Button>}
    title="Удалить?"
    description="Удалить ссылку"
    formControls={<div className="flex gap-2">
      <DialogClose>
        <RemoveForm.RemoveLinkFormControls />
      </DialogClose>
      <DialogClose>
        <Button type="button">Close</Button>
      </DialogClose>
    </div>}
    formSlot={<></>}
    formProviderComponent={body => <RemoveForm.RemoveLinkFormProvider id={id}>{body}</RemoveForm.RemoveLinkFormProvider>}
  />
}