import { batchRemoveAttachments } from "@/entities/attachments/api/actions"
import { AttachmentsModelType } from "@/entities/attachments/dto/model"

import { Button } from "@/shared/ui/button"
import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"


export const BatchRemoveAttachmentFormControls = () => {
  const form = useFormContext()
  const { pending } = useFormStatus()
  
  return <>
    <Button variant="destructive" disabled={pending}>Удалить</Button>
  </>
}

type RemoveAttachmentFormProviderProps = {
  children: ReactNode,
  ids: Array<NonNullable<AttachmentsModelType["id"]>>
}

export const BatchRemoveAttachmentFormProvider = ({
  children,
  ids
}: RemoveAttachmentFormProviderProps) => {
  const [state, action] = useFormState(batchRemoveAttachments.bind(null, ids), {
    message: ""
  })

  useEffect(() => {
    if (state.message) {
      toast("Вложения удалены", {
        description: state.message
      })
    }
  }, [state])
  
  return <form action={action}>
    {children}
  </form>
}