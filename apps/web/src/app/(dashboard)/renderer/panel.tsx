'use client'
import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { scenes } from "@/remotion/scenes";


export const Panel = () => {
  return <>
    {scenes.map(conf =>
      <div className="aspect-video rounded-xl bg-muted/50">
        <Playground {...conf}
          schema={conf.schema as typeof conf.schema}
        />
      </div>)}
  </>
}
