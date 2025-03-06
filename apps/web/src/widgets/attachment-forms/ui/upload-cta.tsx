'use client'
import { Button } from "@/shared/ui/button"
import { FormAction } from "@/shared/ui/form-action"
import * as UploadForm from "@/widgets/attachment-forms/ui/upload-form"
import { ReactElement } from "react"
import { MdAttachment } from "react-icons/md"

type AttachmentUploadCTAProps = {
  clientId?: string,
  userId?: string
  isPublic?: boolean,
  ctaSlot?: ReactElement
}

export const AttachmentUploadCTA = ({
  clientId,
  userId,
  isPublic = true,
  ctaSlot
}: AttachmentUploadCTAProps) => <FormAction
    title="Add attachments"
    description="Add attachments for SaaS"
    ctaSlot={ctaSlot ?? <Button size="sm"><MdAttachment /></Button>}
    formSlot={<UploadForm.SaaSAttachmentFormBody />}
    formControls={<UploadForm.SaaSAttachmentFormControls />}
    formProviderComponent={(body) => <UploadForm.SaaSAttachmentFormProvider 
      defaultValues={{
        clientId,
        userId,
        isPublic
      }}
    >
      {body}
    </UploadForm.SaaSAttachmentFormProvider>}
  />