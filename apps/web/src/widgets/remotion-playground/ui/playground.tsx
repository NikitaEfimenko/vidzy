
'use client'
import { renderVideoAction } from "@/entities/renderer/api/actions"
import { Card, CardFooter } from "@/shared/ui/card"
// import * as VideoPreviewScene from "@/remotion/scenes/simple-preview"
import { FormGeneratorCTA } from "@/widgets/form-generator/ui/generator-cta"
import { VideoPlayground } from "@/widgets/remotion-playground/ui"
import { useDeferredValue, useState } from "react"
import { z } from "zod"

type PlaygroundProps<T extends z.ZodType<any, any, any>,> = {
  composition: (props: any) => React.JSX.Element,
  config: Record<string, any>,
  schema: T,
  initInputProps: z.infer<T>
}

export const Playground = <T extends z.ZodObject<any>>({
  schema,
  composition,
  config,
  initInputProps
}: PlaygroundProps<T>) => {
  const [inputProps, setInputProps] = useState<typeof initInputProps>(initInputProps)
  const input = useDeferredValue(inputProps)
  return <Card className="bg-accent">
    <VideoPlayground
      Composition={composition}
      inputPropsSchema={schema}
      inputProps={input}
      fps={config.fps}
      durationInFrames={config.durationInFrames}
      compositionHeight={config.height}
      compositionWidth={config.width}
    />
    <CardFooter>
      <FormGeneratorCTA serverAction={renderVideoAction} onChange={setInputProps} schema={schema} defaultValues={initInputProps} />
    </CardFooter>
  </Card>
}