'use client'
import { generateTTSAction } from "@/entities/voice/api/actions/tts-action";
import { TTSDtoSchema } from "@/entities/voice/dto";
import { Card, CardFooter } from "@/shared/ui/card";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { useDeferredValue, useState } from "react";

export default function Page() {

  const [inputProps, setInputProps] = useState<any>({})
  const [result, setResult] = useState<any>({})
  const input = useDeferredValue(inputProps)
  return <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      <Card className="bg-accent">
        <pre>
          {JSON.stringify(result)}
        </pre>
        <CardFooter>
          <FormGeneratorCTA
            serverAction={generateTTSAction}
            onChange={setInputProps}
            schema={TTSDtoSchema}
            defaultValues={null}
          />
        </CardFooter>
      </Card>
    </div>
  </div>
}
