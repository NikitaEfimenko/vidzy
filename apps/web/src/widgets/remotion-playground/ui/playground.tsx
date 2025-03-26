
'use client'
import { renderVideoAction } from "@/entities/renderer/api/actions"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta"
import { VideoPlayground } from "@/widgets/remotion-playground/ui"
import { SettingsIcon } from "lucide-react"
import { useDeferredValue, useEffect, useState } from "react"
import { z } from "zod"

type PlaygroundProps<T extends z.ZodType<any, any, any>,> = {
  composition: (props: any) => React.JSX.Element,
  config: Record<string, any>,
  schema: T,
  initInputProps: z.infer<T>,
  compositionName: string,
  showSettingsFlat?: boolean
}

export const Playground = <T extends z.ZodObject<any>>({
  schema,
  composition,
  config,
  initInputProps,
  compositionName,
  showSettingsFlat = false
}: PlaygroundProps<T>) => {
  const [inputProps, setInputProps] = useState<typeof initInputProps>(initInputProps)
  
  useEffect(() => {
    setInputProps(initInputProps)
  }, [initInputProps])
  
  const input = useDeferredValue(inputProps)
  console.log(input, "in playgound input??")
  return <Card className="bg-accent">
    <CardHeader className="py-2">
      <CardTitle>
        {compositionName}
      </CardTitle>
    </CardHeader>
    <CardContent className="py-2">
      <VideoPlayground
        Composition={composition}
        inputPropsSchema={schema}
        inputProps={input}
        fps={config.fps}
        compositionId={compositionName}
        compositionHeight={config.height}
        compositionWidth={config.width}
        calculateMetadata={config.calculateMetadata}
      />
    </CardContent>
    <CardFooter>
      <FormGeneratorCTA
        serverAction={renderVideoAction.bind(null, compositionName)}
        onChange={setInputProps}
        pendingSlot={<span className="text-xs">It can take from 30 seconds to a minute.</span>}
        schema={schema}
        ctaSlot={showSettingsFlat ? undefined : <Button size="sm"><SettingsIcon/>Edit and Render</Button>}
        defaultValues={input} />
    </CardFooter>
  </Card>
}