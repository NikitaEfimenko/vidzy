'use client'
import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { scenes } from "@/remotion/scenes";


export default function Page() {
  return <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {scenes.map(conf =>
        <div className="aspect-video rounded-xl bg-muted/50">
          <Playground {...conf}
            schema={conf.schema as typeof conf.schema}
          />
        </div>)}
    </div>
  </div>
}
