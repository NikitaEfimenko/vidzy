'use client'
import { removeWorkflowInvite } from "@/entities/workflow/api/actions"
import { WorkflowInviteLinksModelType } from "@/entities/workflow/dto/model"

import { Button } from "@/shared/ui/button"
import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"


export const RemoveLinkFormControls = () => {
  const form = useFormContext()
  const { pending } = useFormStatus()
  
  return <>
    <Button variant="destructive" disabled={pending}>Delete</Button>
  </>
}

type RemoveLinkFormProviderProps = {
  children: ReactNode,
  id: WorkflowInviteLinksModelType["id"]
}

export const RemoveLinkFormProvider = ({
  children,
  id
}: RemoveLinkFormProviderProps) => {
  const [state, action] = useFormState(removeWorkflowInvite.bind(null, id), {
    message: ""
  })

  useEffect(() => {
    if (state.message) {
      toast("Link deleted", {
        description: state.message
      })
    }
  }, [state])
  
  return <form action={action}>
    {children}
  </form>
}