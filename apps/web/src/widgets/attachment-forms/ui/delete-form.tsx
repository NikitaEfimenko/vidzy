import { removeAttachment } from "@/entities/attachments/api/actions"
import { AttachmentsModelType } from "@/entities/attachments/dto/model"

import { Button } from "@/shared/ui/button"
import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"


export const RemoveAttachmentFormControls = () => {
  const form = useFormContext()
  const { pending } = useFormStatus()
  
  return <>
    <Button variant="destructive" disabled={pending}>Удалить</Button>
  </>
}

type RemoveAttachmentFormProviderProps = {
  children: ReactNode,
  id: AttachmentsModelType["id"]
}

export const RemoveAttachmentFormProvider = ({
  children,
  id
}: RemoveAttachmentFormProviderProps) => {
  const [state, action] = useFormState(removeAttachment.bind(null, id), {
    message: ""
  })

  useEffect(() => {
    if (state.message) {
      toast("Вложение удалено", {
        description: state.message
      })
    }
  }, [state])
  
  return <form action={action}>
    {children}
  </form>
}