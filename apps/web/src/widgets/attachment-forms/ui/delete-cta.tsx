
'use client'
import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { DialogClose } from "@/shared/ui/dialog"
import { FormAction } from "@/shared/ui/form-action"
import { Trash2Icon } from "lucide-react"
import * as RemoveForm from "./delete-form"

type RemoveAttachmentCTAProps = {
  id: AttachmentsModelType["id"]
}

export const RemoveAttachmentCTA = ({
  id
}: RemoveAttachmentCTAProps) => {

  return <FormAction
    ctaSlot={<Button size="sm" variant="destructive">
      <Trash2Icon size={14} />
    </Button>}
    title="Удалить?"
    description="Удалить вложение"
    formControls={<div className="flex gap-2">
      <DialogClose>
        <RemoveForm.RemoveAttachmentFormControls />
      </DialogClose>
      <DialogClose>
        <Button type="button">Закрыть</Button>
      </DialogClose>
    </div>}
    formSlot={<></>}
    formProviderComponent={body => <RemoveForm.RemoveAttachmentFormProvider id={id}>{body}</RemoveForm.RemoveAttachmentFormProvider>}
  />
}