
'use client'
import { separatorAction } from "@/entities/voice/api/actions/separator-action";
import { InstrumentalSeparatorDtoSchema } from "@/entities/voice/dto";
import { Button } from "@/shared/ui/button";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { LucideSeparatorVertical, PlusSquareIcon } from "lucide-react";
import React, { useDeferredValue, useState } from "react";


export const SeparateAudioCTA = React.memo(() => {
  const [inputProps, setInputProps] = useState<any>({})
  const input = useDeferredValue(inputProps)

  return <FormGeneratorCTA
    serverAction={separatorAction}
    onChange={setInputProps}
    schema={InstrumentalSeparatorDtoSchema}
    defaultValues={null}
    pendingSlot={<span className="text-xs">May take a couple of minutes</span>}
    ctaSlot={<Button size="sm"><LucideSeparatorVertical/>Separate audio</Button>}
  />
})