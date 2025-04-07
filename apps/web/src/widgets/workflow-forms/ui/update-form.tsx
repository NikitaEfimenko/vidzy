'use client'

import { updateWorkflowAction } from "@/entities/workflow/api/actions"
import { WorkflowModelType } from "@/entities/workflow/dto/model"
import { UpdateWorkflowDtoSchema, UpdateWorkflowDtoType } from "@/entities/workflow/dto/update-workflow"

import { Button } from "@/shared/ui/button"
import { Form } from "@/shared/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon } from "lucide-react"
import { FC, ReactNode, useEffect, useRef } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"

export const UpdateWorkflowFormControls = () => {
  const form = useFormContext<UpdateWorkflowDtoType>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)

  return <>
    <Button variant="ghost" size="icon" disabled={pending || errors.length > 0} type="submit"><SaveIcon></SaveIcon></Button>
  </>
}

type UpdateWorkflowFormProviderProps = {
  children: ReactNode,
  workflowId: WorkflowModelType["id"],
  defaultValues: Partial<UpdateWorkflowDtoType>
}

export const UpdateWorkflowFormProvider: FC<UpdateWorkflowFormProviderProps> = ({
  children,
  defaultValues,
  workflowId
}) => {
  const form = useForm<UpdateWorkflowDtoType>({
    resolver: zodResolver(UpdateWorkflowDtoSchema),
    defaultValues,
    mode: "all"
  })
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action] = useFormState(updateWorkflowAction.bind(null, workflowId, defaultValues.flowData), {
    isSuccess: false
  })

  useEffect(() => {
    if (state?.isSuccess) {
      toast("Update worfklow", {
        description: state.issues
      })
    }
  }, [state])

  return <Form {...form}>
    <form
      ref={formRef}
      // onSubmit={form.handleSubmit(onSubmit)}
      action={action}
    >
      {children}
    </form>
  </Form>
}