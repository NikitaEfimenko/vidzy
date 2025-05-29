
'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { FormAction } from '@/shared/ui/form-action';
import { Separator } from '@/shared/ui/separator';
import { Textarea } from '@/shared/ui/textarea';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { FileJsonIcon, PlayIcon, StopCircleIcon } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { z } from 'zod'
import { Prism } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyItem } from '@/shared/ui/copy';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs"


export const RequestLLMJsonResponseCTA = ({
  schema,
  formOnly = false
}: {
  schema: Record<any, any>,
  formOnly?: boolean
}) => {
  const { object, submit, isLoading, stop } = useObject({
    api: `${process.env.NEXT_PUBLIC_RENDERER_HOST}/llm/generate-json`,
    schema: objectToZodSchema(schema)
  });

  const [input, setInput] = useState('')
  const deferededInput = useDeferredValue(input)

  const code = useMemo(() => JSON.stringify(object ?? {}, null, 2), [object])
  const schemaElem = useMemo(() => JSON.stringify(schema ?? {}, null, 2), [schema])

  return <FormAction
    title="JSON generation"
    description="LLM JSON generation"
    ctaSlot={formOnly ? undefined : <Button variant="secondary"><FileJsonIcon />Generate JSON</Button>}
    formSlot={<div className='flex flex-col gap-2'>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="flex items-center gap-2">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>
        <TabsContent value="template">
          <Card>
            <CardContent className='px-4 py-4 whitespace-pre-wrap text-sm relative overflow-auto max-h-96'>
              <div className='absolute z-10 right-2 top-2'>
                <CopyItem textToCopy={code} />
              </div>
              <div className='-z-10'>
                <Prism language="javascript" style={darcula}>
                  {schemaElem}
                </Prism>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="generator">
          <Card>
            <CardContent className='px-4 py-4 whitespace-pre-wrap text-sm relative overflow-auto max-h-96'>
              <div className='absolute z-10 right-2 top-2'>
                <CopyItem textToCopy={code} />
              </div>
              <div className='-z-10'>
                <Prism language="javascript" style={darcula}>
                  {code}
                </Prism>
              </div>
            </CardContent>
          </Card>
          <Separator />
          <Textarea
            value={deferededInput}
            placeholder="Say something..."
            onChange={v => setInput(v.target.value)}
          />
        </TabsContent>
      </Tabs>
    </div>
    }
    formControls={
      <div className='flex items-center gap-2'>
        <Button size="sm" variant="secondary" onClick={stop}><StopCircleIcon></StopCircleIcon>Stop</Button>
        <Button disabled={isLoading} size="sm" onClick={() => submit({
          prompt: deferededInput,
          schema: schema,
          provider: 'ollama'
        })}><PlayIcon></PlayIcon>Generate</Button>
      </div>
    }
  />
}

function objectToZodSchema(obj: Record<string, any>): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Преобразуем значение в строку для описания
      const description = value.toString();

      // Определяем тип значения и создаем соответствующую Zod-схему
      if (typeof value === 'string') {
        schemaShape[key] = z.string().describe(description);
      } else if (typeof value === 'number') {
        schemaShape[key] = z.number().describe(description);
      } else if (typeof value === 'boolean') {
        schemaShape[key] = z.boolean().describe(description);
      } else if (Array.isArray(value)) {
        // Если значение — массив, проверяем тип его элементов
        if (value.length > 0) {
          const firstElement = value[0];
          if (typeof firstElement === 'string') {
            schemaShape[key] = z.array(z.string()).describe(description);
          } else if (typeof firstElement === 'number') {
            schemaShape[key] = z.array(z.number()).describe(description);
          } else if (typeof firstElement === 'boolean') {
            schemaShape[key] = z.array(z.boolean()).describe(description);
          } else {
            // Если тип элемента массива неизвестен, используем z.any()
            schemaShape[key] = z.array(z.any()).describe(description);
          }
        } else {
          // Если массив пустой, используем z.array(z.any())
          schemaShape[key] = z.array(z.any()).describe(description);
        }
      } else if (value && typeof value === 'object') {
        // Если значение — объект, рекурсивно создаем схему для него
        schemaShape[key] = objectToZodSchema(value).describe(description);
      } else {
        // Если тип неизвестен, используем z.any()
        schemaShape[key] = z.any().describe(description);
      }
    }
  }

  return z.object(schemaShape);
}