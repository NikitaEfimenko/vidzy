'use client'

import { uploadAttachmentAction } from "@/entities/attachments/api/actions"
import { CreateAttachmentDto, CreateAttachmentDtoType } from "@/entities/attachments/dto/create-attachment"

import { Button } from "@/shared/ui/button"
import { FilePreview } from "@/shared/ui/file-preview"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC, ReactNode, useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"

function generateDataUrl(file: File, callback: (imageUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(file);
}

export const SaaSAttachmentFormBody = () => {
  const form = useFormContext<CreateAttachmentDtoType>()
  const fileInput = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) generateDataUrl(file, setDataUrl);
  };

  return <>
    <FormField
      control={form.control}
      name="fileType"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              type="hidden"
              placeholder=""
              value="image"
            />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="file"
      render={({ field, formState }) => {
        return <FormItem>
          <FormLabel>Files</FormLabel>
          <FilePreview
            fileType={"image"}
            fileUrl={dataUrl ?? undefined}
            onClick={() => fileInput.current?.click()}
          />
          <FormControl>
            <Input
              className="hidden"
              name="file"
              type="file"
              placeholder=""
              ref={fileInput}
              accept="image/*,video/*"
              onChange={(e) => {
                handleFileChange(e)
                const file = e.target.files?.[0];
                if (file) {
                  field.onChange(file);
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      }}
    />

  </>
}

export const SaaSAttachmentFormControls = () => {
  const form = useFormContext<CreateAttachmentDtoType>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)

  return <>
    <Button size="sm" disabled={pending || errors.length > 0} type="submit">Добавить вложение</Button>
  </>
}

type SaaSAttachmentFormProviderProps = {
  children: ReactNode,
  defaultValues: Partial<CreateAttachmentDtoType>
}

export const SaaSAttachmentFormProvider: FC<SaaSAttachmentFormProviderProps> = ({
  children,
  defaultValues
}) => {
  const form = useForm<CreateAttachmentDtoType>({
    resolver: zodResolver(CreateAttachmentDto),
    defaultValues,
    mode: "all"
  })
  const formRef = useRef<HTMLFormElement>(null)
  const serverAction = uploadAttachmentAction.bind(null, defaultValues.clientId, !!defaultValues.isPublic)
  const [state, action] = useFormState(serverAction, {
    url: null,
    isSuccess: false
  })

  useEffect(() => {
    if (state.isSuccess) {
      toast("Upload file", {
        description: state.url
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