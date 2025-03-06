'use client'

import { Button } from "@/shared/ui/button"
import * as Generator from "./index"
import { FormAction } from "@/shared/ui/form-action"
import { Settings2Icon } from "lucide-react"
import { memo } from "react"

export const FormGeneratorCTA = memo(({ schema, onResult, serverAction, defaultValues, onChange }: Generator.GeneratorMainProps & { defaultValues: any, serverAction: (prevState: any, formData: FormData) => any | Promise<any>, onChange: (values: Record<any, any>) => void, onResult?: (v: any) => void }) => {
  return <FormAction
    title="Форма"
    description="Форма"
    ctaSlot={<Button size="sm" className="py-3 mt-3"><Settings2Icon /></Button>}
    formSlot={<Generator.FormGeneratorBody schema={schema}></Generator.FormGeneratorBody>}
    formControls={
      <Generator.FormGeneratorControls schema={schema}></Generator.FormGeneratorControls>
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