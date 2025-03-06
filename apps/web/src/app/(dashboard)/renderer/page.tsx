import { Playground } from "@/widgets/remotion-playground/ui/playground";
import { scenes } from "@/remotion/scenes";

export default function Page() {
  return <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {scenes.map(conf =>
        <div className="aspect-video rounded-xl bg-muted/50">
          {/* <Playground {...conf} /> */}
        </div>)}
    </div>
  </div>
}
