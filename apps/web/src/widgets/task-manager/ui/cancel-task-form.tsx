'use client'
import { cancelTask } from "@/entities/task/api/actions"
import { Button } from "@/shared/ui/button"
import { ReactNode, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"


export const CancelTaskFormControls = () => {
  const form = useFormContext()
  const { pending } = useFormStatus()
  
  return <>
    <Button variant="destructive" disabled={pending}>Cancel</Button>
  </>
}

type CancelTaskFormProviderProps = {
  children: ReactNode,
  taskId: string
}

export const CancelTaskFormProvider = ({
  children,
  taskId
}: CancelTaskFormProviderProps) => {
  const [state, action] = useFormState(cancelTask.bind(null, taskId), {
    isSuccess: false
  })

  useEffect(() => {
    if (state.isSuccess) {
      toast("Task canceled")
    }
  }, [state])
  
  return <form action={action}>
    {children}
  </form>
}