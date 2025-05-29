'use client'

import { AttachmentsModelType } from "@/entities/attachments/dto/model"
import { Button } from "@/shared/ui/button"
import { BatchRemoveAttachments } from "@/widgets/attachment-forms/ui/batch-delete-cta"
import { AttachmentUploadCTA } from "@/widgets/attachment-forms/ui/upload-cta"
import { FileSelector } from "@/widgets/form-generator/ui/file-selector"
import { Plus, PlusSquareIcon } from "lucide-react"
import { useState } from "react"

export const FilteredAttachmentList = () => {
  const [selected, setSelected] = useState<Array<NonNullable<AttachmentsModelType["id"]>>>([]);

  const handleToggleSelect = (attachmentId: NonNullable<AttachmentsModelType["id"]>) => {
    setSelected(prev => 
      prev.includes(attachmentId)
        ? prev.filter(id => id !== attachmentId) // Удаляем если уже выбран
        : [...prev, attachmentId] // Добавляем если не выбран
    );
  };

  return <div className="flex w-full flex-col gap-2">
    <div className="flex gap-2 bg-accent rounded-md p-4">
      <AttachmentUploadCTA isPublic={false} ctaSlot={<Button><PlusSquareIcon/>Add Content</Button>} />
      {selected.length > 0 && <BatchRemoveAttachments ids={selected}/>}
    </div>
    <FileSelector
      withCaption={true}
      withRemove={true}
      withCurrentUser
      handleSelect={attachment => {
        if (attachment.id) {
          handleToggleSelect(attachment.id);
        }
      }}
    />
  </div>
}