'use client'

import { Button } from "@/shared/ui/button"
import * as Generator from "./index"
import { FormAction } from "@/shared/ui/form-action"
import { Settings2Icon } from "lucide-react"
import { memo, ReactElement } from "react"
import { Separator } from "@/shared/ui/separator"

type GeneratorProps = {
  ctaSlot?: ReactElement,
  defaultValues: any,
  serverAction: (prevState: any, formData: FormData) => any | Promise<any>,
  onChange?: (values: Record<any, any>) => void,
  onResult?: (v: any) => void,
  formStateSlot?: ReactElement,
  docsSlot?: ReactElement,
  showForm?: boolean,
} & Generator.GeneratorMainProps

export const FormGeneratorCTA = memo(({ showForm = true, docsSlot, pendingSlot, ctaSlot, formStateSlot, schema, onResult, serverAction, defaultValues, onChange }: GeneratorProps) => {
  if (!showForm) {
    return <Generator.FormGeneratorProvider
      schema={schema}
      serverAction={serverAction}
      onChange={onChange}
      onResult={onResult}
      defaultValues={defaultValues}
    >
      <div className="hidden">
        <Generator.FormGeneratorBody schema={schema}></Generator.FormGeneratorBody>
      </div>
      <div className="flex items-center gap-2">
        <Generator.FormGeneratorControls noUpdater pendingSlot={pendingSlot} onChange={onChange} schema={schema}></Generator.FormGeneratorControls>
      </div>
    </Generator.FormGeneratorProvider>
  }

  return <FormAction
    title="Form"
    description="Form generator"
    ctaSlot={ctaSlot}
    formSlot={<div className="max-h-[400px] overflow-auto">
      <div className="flex items-center justify-center w-full">
        {docsSlot}
      </div>
      <Generator.FormGeneratorBody schema={schema}></Generator.FormGeneratorBody>
      {formStateSlot && <>
        <Separator className="mt-2 mb-2" />
        {formStateSlot}
      </>}
    </div>
    }
    formControls={<div className="flex items-center gap-2">
      <Generator.FormGeneratorControls pendingSlot={pendingSlot} onChange={onChange} schema={schema}></Generator.FormGeneratorControls>
    </div>
    }
    formProviderComponent={body => <Generator.FormGeneratorProvider
      schema={schema}
      serverAction={serverAction}
      onChange={onChange}
      onResult={onResult}
      defaultValues={defaultValues}
    >{body}</Generator.FormGeneratorProvider>}
  />
})