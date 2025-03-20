
'use client'
import { generateAIImageAction } from "@/entities/llm/api/actions";
import { GenerateImageDtoSchema } from "@/entities/llm/dto/generate-image";
import { Button } from "@/shared/ui/button";
import { FormAction } from "@/shared/ui/form-action";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import React, { useDeferredValue, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { z } from "zod";
import { AIImagePreview } from "./ai-image-preview";
import { MdPreview } from "react-icons/md";

const ResultResponse = z.object({
  requestId: z.string()
})

export const RequestAIImageCTA = () => {
  const [inputProps, setInputProps] = useState<any>({})
  const [requestId, setRequestId] = useState<string | null>(null)
  return <FormGeneratorCTA
    serverAction={generateAIImageAction}
    onChange={setInputProps}
    schema={GenerateImageDtoSchema}
    defaultValues={null}
    onResult={(v) => {
      const parsed = ResultResponse.safeParse(v)
      if (parsed.success) {
        setRequestId(parsed.data.requestId)
      }
    }}
    formStateSlot={<>
      {requestId && <FormAction
        title="Image preview"
        description="Image preview"
        formSlot={
          <>
          <AIImagePreview requestId={requestId} />
          </>
        }
        formControls={<></>}
        ctaSlot={<Button size="icon" variant="secondary"><MdPreview></MdPreview>Show generation</Button>}
        formProviderComponent={(body) => <>{body}</>}
      />}
    </>
    }
    ctaSlot={
      <Button size="sm"><FaMagic />Generate Image</Button>
    }
  />
}