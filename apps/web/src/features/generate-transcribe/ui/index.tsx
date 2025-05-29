'use client'
import { transcribeAction, transcribeInBackgroundAction } from "@/entities/voice/api/actions/transcribe-action";
import { TranscribeDtoSchema } from "@/entities/voice/dto";
import { Button } from "@/shared/ui/button";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { PlusSquareIcon, TextIcon } from "lucide-react";
import React, { useDeferredValue, useState } from "react";

const initValues = {
  file: null
}

export const GenerateTranscribeCTA = React.memo(({
  formOnly = false,
  backgroundJob = false
}: {
  formOnly?: boolean,
  backgroundJob?: boolean
}) => {

  const [inputProps, setInputProps] = useState<any>(initValues)
  const [result, setResult] = useState<any>({})
  const input = useDeferredValue(inputProps)

  return <FormGeneratorCTA
    serverAction={backgroundJob ? transcribeInBackgroundAction : transcribeAction}
    onChange={setInputProps}
    schema={TranscribeDtoSchema}
    defaultValues={initValues}
    pendingSlot={<span className="text-xs">It may take about 30 seconds.</span>}
    ctaSlot={formOnly ? undefined : <Button variant="secondary"><TextIcon/>Transcription</Button>}
  />

})
