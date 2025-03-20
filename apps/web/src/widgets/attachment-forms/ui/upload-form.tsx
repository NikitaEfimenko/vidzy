'use client'

import { uploadAttachmentAction } from "@/entities/attachments/api/actions"
import { CreateAttachmentDto, CreateAttachmentDtoType } from "@/entities/attachments/dto/create-attachment"

import { Button } from "@/shared/ui/button"
import { FilePreview } from "@/shared/ui/file-preview"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { fileTypeEnum } from "@vidzy/database"
import { FC, ReactNode, useEffect, useRef, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { generateDataUrl, getFileTypeByExtension } from "@/shared/lib/utils"


export const SaaSAttachmentFormBody = () => {
  const form = useFormContext<CreateAttachmentDtoType>()
  const fileInput = useRef<HTMLInputElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<typeof fileTypeEnum.enumValues[number]>('other');


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateDataUrl(file, setDataUrl);
      const type = getFileTypeByExtension(file.name);
      setFileType(type);
      form.setValue('fileType', type);
    }
  };

  const watchedValues = form.watch();
  return <>
    <FormField
      control={form.control}
      name="file"
      render={({ field, formState }) => {
        return <FormItem>
          <FormLabel>Files</FormLabel>
          <FilePreview
            fileType={watchedValues.fileType ?? "other"}
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
    {!!watchedValues.file && <FormField
      control={form.control}
      name="fileType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>File Type</FormLabel>
          <FormControl>
            <Select
              name="fileType"
              onValueChange={field.onChange} defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select file type" />
              </SelectTrigger>
              <SelectContent>
                {fileTypeEnum.enumValues.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />}
  </>
}

export const SaaSAttachmentFormControls = () => {
  const form = useFormContext<CreateAttachmentDtoType>()
  const { pending } = useFormStatus()
  const errors = Object.values(form.formState.errors)

  return <>
    <Button disabled={pending || errors.length > 0} type="submit">Add attachment</Button>
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
  const serverAction = uploadAttachmentAction.bind(null, !!defaultValues.isPublic)
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