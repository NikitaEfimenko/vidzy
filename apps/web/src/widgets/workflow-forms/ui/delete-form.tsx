'use client'
import { removeWorkflow } from "@/entities/workflow/api/actions"
import { WorkflowModelType } from "@/entities/workflow/dto/model"

import { Button } from "@/shared/ui/button"
import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"


export const RemoveWorkflowFormControls = () => {
  const form = useFormContext()
  const { pending } = useFormStatus()
  
  return <>
    <Button variant="destructive" disabled={pending}>Delete</Button>
  </>
}

type RemoveWorkflowFormProviderProps = {
  children: ReactNode,
  id: WorkflowModelType["id"]
}

export const RemoveWorkflowFormProvider = ({
  children,
  id
}: RemoveWorkflowFormProviderProps) => {
  const [state, action] = useFormState(removeWorkflow.bind(null, id), {
    message: ""
  })

  useEffect(() => {
    if (state.message) {
      toast("Workflow deleted", {
        description: state.message
      })
    }
  }, [state])
  
  return <form action={action}>
    {children}
  </form>
}