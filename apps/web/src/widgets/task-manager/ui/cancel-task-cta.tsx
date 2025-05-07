'use client'
import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { DialogClose } from "@/shared/ui/dialog"
import { FormAction } from "@/shared/ui/form-action"
import { Trash2Icon } from "lucide-react"
import * as CancelForm from "./cancel-task-form"

type CancelTaskCTAProps = {
  taskId: string
}

export const CancelTaskCTA = ({
  taskId
}: CancelTaskCTAProps) => {

  return <FormAction
    ctaSlot={<Button size="icon" variant="ghost">
      <Trash2Icon size={14} />
    </Button>}
    title="Cancel task?"
    description="Cancel task?"
    formControls={<div className="flex gap-2">
      <DialogClose>
        <CancelForm.CancelTaskFormControls />
      </DialogClose>
      <DialogClose>
        <Button type="button">Close</Button>
      </DialogClose>
    </div>}
    formSlot={<></>}
    formProviderComponent={body => <CancelForm.CancelTaskFormProvider taskId={taskId}>{body}</CancelForm.CancelTaskFormProvider>}
  />
}