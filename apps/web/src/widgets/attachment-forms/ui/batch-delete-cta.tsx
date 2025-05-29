
'use client'
import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { DialogClose } from "@/shared/ui/dialog"
import { FormAction } from "@/shared/ui/form-action"
import { Trash2Icon } from "lucide-react"
import * as BatchRemoveForm from "./batch-delete-form"
import { Badge } from "@/shared/ui/badge"

type RemoveAttachmentCTAProps = {
  ids: Array<NonNullable<AttachmentsModelType["id"]>>
}

export const BatchRemoveAttachments = ({
  ids
}: RemoveAttachmentCTAProps) => {

  return <FormAction
    ctaSlot={<Button variant="destructive">
      <Trash2Icon size={14} />
      {ids.length > 0 && <Badge variant="secondary">{ids.length}</Badge>}
    </Button>}
    title="Удалить?"
    description="Удалить вложение"
    formControls={<div className="flex gap-2">
      <DialogClose>
        <BatchRemoveForm.BatchRemoveAttachmentFormControls />
      </DialogClose>
      <DialogClose>
        <Button type="button">Закрыть</Button>
      </DialogClose>
    </div>}
    formSlot={<></>}
    formProviderComponent={body => <BatchRemoveForm.BatchRemoveAttachmentFormProvider ids={ids}>{body}</BatchRemoveForm.BatchRemoveAttachmentFormProvider>}
  />
}