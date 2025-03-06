'use client'
import { separatorAction } from "@/entities/voice/api/actions/separator-action";
import { InstrumentalSeparatorDtoSchema } from "@/entities/voice/dto";
import { Card, CardFooter } from "@/shared/ui/card";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { useDeferredValue, useState } from "react";

const initValues = {
  file: null
}

export default function Page() {

  const [inputProps, setInputProps] = useState<any>(initValues)
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
            serverAction={separatorAction}
            onChange={setInputProps}
            schema={InstrumentalSeparatorDtoSchema}
            defaultValues={initValues}
          />
        </CardFooter>
      </Card>
    </div>
  </div>
}
