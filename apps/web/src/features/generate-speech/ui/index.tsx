
'use client'
import { generateTTSAction } from "@/entities/voice/api/actions/tts-action";
import { TTSDtoSchema } from "@/entities/voice/dto";
import { Button } from "@/shared/ui/button";
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta";
import { BookMarkedIcon, LaughIcon, Music, PlusSquareIcon } from "lucide-react";
import React, { useDeferredValue, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/shared/ui/hover-card";
import { FaLaugh } from "react-icons/fa";

type GenerateSpeechCTAProps = {
  formOnly?: boolean
}

export const GenerateSpeechCTA = React.memo(({
  formOnly = false
}: GenerateSpeechCTAProps) => {
  const [inputProps, setInputProps] = useState<any>({})
  const input = useDeferredValue(inputProps)

  return <FormGeneratorCTA
    serverAction={generateTTSAction}
    onChange={setInputProps}
    schema={TTSDtoSchema}
    defaultValues={null}
    docsSlot={
      <HoverCard>
        <HoverCardTrigger>
          <Button size="sm" type="button" variant='secondary'>
            <BookMarkedIcon aria-hidden="true" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent>
            <div className="flex items-center gap-2">
            [laughter] - for <LaughIcon></LaughIcon>
            </div>
            <br></br>
            <div className="flex items-center gap-2">
            [laughs] - for <FaLaugh></FaLaugh>
            </div>
            <br></br>
            <div className="flex items-center gap-2">
            [music] - for <Music/>
              </div>
            <br></br>
            ♪ - for song lyrics
            <br></br>
            CAPITALIZATION - for emphasis of a word
            <br></br>
            [MAN] and [WOMAN] - for man/woman voice 
        </HoverCardContent>
      </HoverCard>
    }
    pendingSlot={<span className="text-xs">May take a couple of minutes</span>}
    ctaSlot={formOnly ? undefined : <Button size="sm"><PlusSquareIcon />Generate Text-to-Speech</Button>}
  />
})