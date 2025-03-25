'use client'

import { createWorkflowAction } from "@/entities/workflow/api/actions"
import { CreateWorkflowDtoSchema, CreateWorkflowDtoType } from "@/entities/workflow/dto/create-workflow"
import { WorkflowModelType } from "@/entities/workflow/dto/model"

import { Button } from "@/shared/ui/button"
import { FilePreview } from "@/shared/ui/file-preview"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { fileTypeEnum } from "@vidzy/database"
import { FC, ReactNode, use, useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"

type CreateWorkflowFormBodyProps = {
  workflowListPromise?: Promise<WorkflowModelType[]>
}

export const CreateWorkflowFormBody = ({
  workflowListPromise
}: CreateWorkflowFormBodyProps) => {
  const form = useFormContext<CreateWorkflowDtoType>()
  const workflowsList = use(workflowListPromise ?? Promise.resolve([]))
  return <>

    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Workflow title</FormLabel>
          <FormControl>
            <Input {...field} placeholder="" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="copyFromFlowId"
      render={({ field }) => (
        <FormItem className="max-h-96 overflow-scroll">
          <FormControl>
            <Select
              name="copyFromFlowId"
              onValueChange={field.onChange}
            >

              <SelectTrigger>
                <SelectValue defaultValue={undefined} placeholder="Select value" />
              </SelectTrigger>
              <SelectContent>
                {workflowsList.map((item) => (
                  <SelectItem value={item.id!} key={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

  </>
}

export const CreateWorkflowFormControls = () => {
  const form = useFormContext<CreateWorkflowDtoType>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)

  return <>
    <Button disabled={pending || errors.length > 0} type="submit">Add workflow</Button>
  </>
}

type CreateWorkflowFormProviderProps = {
  children: ReactNode,
  defaultValues: Partial<CreateWorkflowDtoType>
}

export const CreateWorkflowFormProvider: FC<CreateWorkflowFormProviderProps> = ({
  children,
  defaultValues
}) => {
  const form = useForm<CreateWorkflowDtoType>({
    resolver: zodResolver(CreateWorkflowDtoSchema),
    defaultValues,
    mode: "all"
  })
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action] = useFormState(createWorkflowAction, {
    isSuccess: false
  })

  useEffect(() => {
    if (state.isSuccess) {
      toast("Create worfklow", {
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