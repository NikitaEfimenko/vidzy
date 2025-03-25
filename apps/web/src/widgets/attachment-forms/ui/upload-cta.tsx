'use client'
import { Button } from "@/shared/ui/button"
import { FormAction } from "@/shared/ui/form-action"
import * as UploadForm from "@/widgets/attachment-forms/ui/upload-form"
import { ReactElement } from "react"
import { MdAttachment } from "react-icons/md"

type AttachmentUploadCTAProps = {
  userId?: string
  isPublic?: boolean,
  ctaSlot?: ReactElement,
  disableSlot?: boolean
}

export const AttachmentUploadCTA = ({
  userId,
  isPublic = true,
  disableSlot = false,
  ctaSlot = <Button><MdAttachment /></Button>
}: AttachmentUploadCTAProps) => <FormAction
    title="Add attachments"
    description="Add attachments for generator"
    ctaSlot={disableSlot ? undefined : ctaSlot}
    formSlot={<UploadForm.SaaSAttachmentFormBody />}
    formControls={<UploadForm.SaaSAttachmentFormControls />}
    formProviderComponent={(body) => <UploadForm.SaaSAttachmentFormProvider 
      defaultValues={{
        userId,
        isPublic
      }}
    >
      {body}
    </UploadForm.SaaSAttachmentFormProvider>}
  />